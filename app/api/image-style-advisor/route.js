import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { Prompt } from "@/app/(components)/Prompt";

// --- CONFIGURATION ---
const SYSTEM_PROMPT = Prompt;

const GENERATION_CONFIG = {
  temperature: 0.7,
  topP: 1,
  topK: 1,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

const MODELS = {
  primary: "gemini-1.5-pro-latest",
  fallback: "gemini-1.5-flash-latest",
};

// --- API ROUTE ---
export async function POST(req) {
  const apiKey = process.env.GEMINI_APIKEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_APIKEY environment variable is not set." },
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
    
    // **THE FIX:** Clean the response string before parsing
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