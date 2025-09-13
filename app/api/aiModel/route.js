import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// --- CONFIGURATION ---
// 1. Set your AI's main instruction or personality here.
const SYSTEM_PROMPT = `You are an expert AI assistant. Your task is to process the user's input and respond with a structured JSON object. 
The JSON object must have a key "response" containing your helpful answer.`;

// 2. Define the Gemini model settings.
const GENERATION_CONFIG = {
  temperature: 0.7,
  topP: 1,
  topK: 1,
  maxOutputTokens: 8192,
  // Forcing JSON output is a robust practice
  responseMimeType: "application/json",
};

// 3. Define the models to use (primary and a fallback).
const MODELS = {
  primary: "gemini-1.5-pro-latest",
  fallback: "gemini-1.5-flash-latest",
};

// --- API ROUTE ---
export async function POST(req) {
  // Check for API Key
  const apiKey = process.env.GEMINI_APIKEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_APIKEY environment variable is not set." },
      { status: 500 }
    );
  }

  try {
    // 1. Get user input from the request body.
    // This example expects a simple object like { "userInput": "Hello there" }
    const { userInput } = await req.json();

    if (!userInput) {
      return NextResponse.json(
        { error: "Missing 'userInput' in request body." },
        { status: 400 }
      );
    }

    // 2. Initialize the Gemini AI client
    const genAI = new GoogleGenerativeAI(apiKey);

    // 3. Construct the final prompt
    const finalPrompt = `${SYSTEM_PROMPT}\n\nUser Input: "${userInput}"`;

    let result;
    let modelUsed;

    // 4. Attempt to generate content with the primary model
    try {
      const model = genAI.getGenerativeModel({ model: MODELS.primary, generationConfig: GENERATION_CONFIG });
      result = await model.generateContent(finalPrompt);
      modelUsed = MODELS.primary;
    } catch (error) {
      // 5. If the primary model fails, fallback to the secondary model.
      // This is robust against service availability issues.
      console.warn(`Primary model (${MODELS.primary}) failed: ${error.message}. Falling back to ${MODELS.fallback}.`);
      
      const fallbackModel = genAI.getGenerativeModel({ model: MODELS.fallback, generationConfig: GENERATION_CONFIG });
      result = await fallbackModel.generateContent(finalPrompt);
      modelUsed = MODELS.fallback;
    }

    // 6. Parse the JSON response from the AI
    const responseText = result.response.text();
    const jsonData = JSON.parse(responseText);

    // 7. Send the successful response back to the client
    return NextResponse.json({
      success: true,
      data: jsonData,
      modelUsed: modelUsed,
    });

  } catch (error) {
    // 8. Catch any other errors during the process
    console.error("Error in Gemini API route:", error);
    // Checkm if the error is due to JSON parsing
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