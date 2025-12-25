import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { VirtualTryOnPrompt } from "@/app/(components)/VirtualTryOnPrompt";
import { ajVirtualTryOn } from "@/lib/arcjet";

// --- CONFIGURATION ---
const SYSTEM_PROMPT = VirtualTryOnPrompt;

const GENERATION_CONFIG = {
  temperature: 0.6,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 2048,
  responseModalities: ["image"],
};

// Use the correct image generation model found in the list
const MODEL_NAME = "gemini-3-pro-image-preview";

// --- API ROUTE ---
export async function POST(req) {
  // Rate limiting: 3 images per 12 hours
  const decision = await ajVirtualTryOn.protect(req);

  if (decision.isDenied()) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. You can generate up to 3 images every 12 hours.",
        rateLimited: true,
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
      const blockReason = result?.response?.candidates?.[0]?.finishReason;
      const safetyRatings = result?.response?.candidates?.[0]?.safetyRatings;
      console.error("Image generation failed. Block Reason:", blockReason, "Safety Ratings:", safetyRatings);
      return NextResponse.json(
        { error: `Image generation failed. The model did not return an image. Reason: ${blockReason}` },
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

    if (error.message && (error.message.includes("429") || /quota/i.test(error.message))) {
      return NextResponse.json(
        { error: "API quota exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || "An internal server error occurred while generating the image." },
      { status: 500 }
    );
  }
}
