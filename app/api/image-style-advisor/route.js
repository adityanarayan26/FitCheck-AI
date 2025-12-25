import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { Prompt } from "@/app/(components)/Prompt";
import { ajImageAdvisor } from "@/lib/arcjet";

// --- CONFIGURATION ---
const SYSTEM_PROMPT = Prompt;

const GENERATION_CONFIG = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 1024, // Reduced for token efficiency
  responseMimeType: "application/json",
};

// Use stable model versions
const MODELS = {
  primary: "gemini-2.0-flash",
  fallback: "gemini-2.0-flash-lite",
};

// --- API ROUTE ---
export async function POST(req) {
  // Rate limiting: 2-minute cooldown (1 request per 2 minutes)
  const decision = await ajImageAdvisor.protect(req);

  if (decision.isDenied()) {
    return NextResponse.json(
      {
        error: "Please wait 2 minutes before requesting another style analysis.",
        rateLimited: true,
        cooldown: 120,
      },
      { status: 429 }
    );
  }

  const apiKey = process.env.NEW_GEMINI_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "NEW_GEMINI_KEY environment variable is not set." },
      { status: 500 }
    );
  }

  try {
    const { image, name, type } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Missing 'image' in request body." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const imagePart = {
      inlineData: {
        data: image,
        mimeType: type,
      },
    };

    const textPart = {
      text: SYSTEM_PROMPT
    }

    let result;
    let modelUsed;

    try {
      const model = genAI.getGenerativeModel({ model: MODELS.primary });
      result = await model.generateContent([textPart, imagePart], GENERATION_CONFIG);
      modelUsed = MODELS.primary;
    } catch (error) {
      console.warn(`Primary model (${MODELS.primary}) failed: ${error.message}. Falling back to ${MODELS.fallback}.`);
      const fallbackModel = genAI.getGenerativeModel({ model: MODELS.fallback });
      result = await fallbackModel.generateContent([textPart, imagePart], GENERATION_CONFIG);
      modelUsed = MODELS.fallback;
    }

    const responseText = result.response.text();

    // Clean the response string before parsing
    const cleanedResponseText = responseText.replace(/```json/g, "").replace(/```/g, "");

    let jsonData;
    try {
      jsonData = JSON.parse(cleanedResponseText);
    } catch (error) {
      console.error("Invalid JSON response from the AI model:", responseText);
      return NextResponse.json(
        { error: "Invalid JSON response from the AI model." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: jsonData,
      modelUsed: modelUsed,
    });
  } catch (error) {
    console.error("Error in Gemini API route:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON response from the AI model." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: error.message || "An internal server error occurred." },
      { status: 500 }
    );
  }
}