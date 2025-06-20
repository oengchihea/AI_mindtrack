import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-1.5-flash-latest";
const API_KEY = process.env.GEMINI_API_KEY_V2;

async function analyzeJournalContent(content, questionnaireData, userId) {
  if (!API_KEY || API_KEY.length <= 10) {
    console.error("CRITICAL ERROR in analyzeJournalContent: GEMINI_API_KEY_V2 is NOT SET or is too short.");
    return { error: "API key not configured on the server." };
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.7,
    topK: 40,
    topP: 0.9,
    maxOutputTokens: 200,
  };

  const safetySettings = [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  ];

  const prompt = `
Analyze the following journal entry for sentiment and provide a score (0-10) based on emotional well-being:
- Content: ${content}
- Questionnaire Data: ${JSON.stringify(questionnaireData)}
- User ID: ${userId}

Return a JSON object with:
- sentiment: (e.g., "positive", "neutral", "negative")
- score: (number between 0 and 10)
- themes: (array of strings, e.g., ["stress", "gratitude"])
- insights: (string with a brief insight)
{"sentiment": "...", "score": number, "themes": [...], "insights": "..."}
`;

  try {
    console.log(`analyzeJournalContent: Attempting to call Gemini API with model: ${MODEL_NAME}...`);
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const response = await result.response;
    let jsonString = response.text().trim();
    console.log(`analyzeJournalContent: Raw response: ${jsonString}`);

    // Attempt to extract JSON from markdown code block
    let extractedJson = jsonString;
    const jsonMatch = jsonString.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      extractedJson = jsonMatch[1].trim();
      console.log(`analyzeJournalContent: Extracted JSON from code block: ${extractedJson}`);
    } else {
      // Fallback to parse raw response if no code block is found
      console.log(`analyzeJournalContent: No code block detected, attempting raw JSON parse...`);
    }

    try {
      const parsedResult = JSON.parse(extractedJson);
      if (parsedResult.sentiment && typeof parsedResult.score === "number" && Array.isArray(parsedResult.themes)) {
        console.log(`analyzeJournalContent: Successfully parsed result: ${JSON.stringify(parsedResult)}`);
        return parsedResult;
      }
      throw new Error("Invalid response format");
    } catch (parseError) {
      console.error("analyzeJournalContent: Error parsing JSON:", parseError, "Raw JSON attempted:", extractedJson);
      return { error: "Failed to parse analysis response: " + extractedJson };
    }
  } catch (apiError) {
    console.error("analyzeJournalContent: Gemini API call error:", apiError);
    return { error: "Failed to analyze journal content: " + (apiError.message || apiError.toString()) };
  }
}

export async function POST(req) {
  console.log("API Route /api/analyze-journal: Received POST request.");
  try {
    const { content, questionnaireData, userId } = await req.json();
    console.log(`API Route: Analyzing journal content: ${content}, questionnaireData: ${JSON.stringify(questionnaireData)}, userId: ${userId}`);

    if (!content || !questionnaireData || !userId) {
      return NextResponse.json(
        { error: "Missing required data: content, questionnaireData, and userId are required." },
        { status: 400 }
      );
    }

    const result = await analyzeJournalContent(content, questionnaireData, userId);
    if (result.error) {
      console.error("API Route: Error from analyzeJournalContent:", result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    console.log("API Route: Successfully analyzed journal content. Sending response to client:", JSON.stringify(result));
    return NextResponse.json(result);
  } catch (error) {
    console.error("API Route: Unhandled exception in POST handler:", error.message, error.stack);
    return NextResponse.json(
      { error: "An unexpected server error occurred.", details: error.message },
      { status: 500 }
    );
  }
}