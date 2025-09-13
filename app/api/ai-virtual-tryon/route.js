import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { VirtualTryOnPrompt } from "@/app/(components)/VirtualTryOnPrompt";

// --- CONFIGURATION ---
const SYSTEM_PROMPT = VirtualTryOnPrompt;

const GENERATION_CONFIG = {
  temperature: 0.6,
  topP: 1,
  topK: 1,
  maxOutputTokens: 8192,
  responseModalities: ['IMAGE'],
};

const MODEL_NAME = "gemini-2.5-flash-image-preview";

// --- API ROUTE ---
export async function POST(req) {
  const apiKey = process.env.GEMINI_IMAGE_MODEL;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_APIKEY environment variable is not set." },
      { status: 500 }
    );
  }

  try {
    const { modelImage, garmentImage } = await req.json();

    if (!modelImage || !garmentImage) {
      return NextResponse.json(
        { error: "Missing model or garment image in request body." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const promptParts = [
      { text: SYSTEM_PROMPT },
      { inlineData: { data: modelImage.data, mimeType: modelImage.type } },
      { inlineData: { data: garmentImage.data, mimeType: garmentImage.type } },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts: promptParts }],
      generationConfig: GENERATION_CONFIG,
    });
    
    const generatedImagePart = result?.response?.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (!generatedImagePart) {
      return NextResponse.json(
        { error: "Image generation failed. The model did not return an image." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: generatedImagePart.inlineData,
      modelUsed: MODEL_NAME,
    });

  } catch (error) {
    console.error("Error in Gemini API route:", error);
    
    // Improved: Specifically check for rate limiting (429) errors
    if (error.message && error.message.includes("429")) {
        return NextResponse.json(
            { error: "The service is currently busy due to high demand. Please try again in a minute." },
            { status: 429 }
        );
    }
    
    return NextResponse.json(
      { error: "An internal server error occurred while generating the image." },
      { status: 500 }
    );
  }
}
