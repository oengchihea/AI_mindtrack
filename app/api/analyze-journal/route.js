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
- score: (integer between 0 and 10)
- themes: (array of strings, e.g., ["stress", "gratitude"])
- insights: (string with a brief insight)
- emoji: (string with a relevant emoji)
{
  "sentiment": "...",
  "score": number,
  "themes": [...],
  "insights": "...",
  "emoji": "..."
}
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

    jsonString = jsonString.replace(/```json\n|```/g, '').trim();
    if (!jsonString.startsWith('{')) {
      jsonString = `{${jsonString}}`;
    }

    try {
      const parsedResult = JSON.parse(jsonString);
      if (
        parsedResult.sentiment &&
        Number.isInteger(parsedResult.score) &&
        parsedResult.score >= 0 &&
        parsedResult.score <= 10 &&
        Array.isArray(parsedResult.themes) &&
        parsedResult.insights &&
        parsedResult.emoji
      ) {
        console.log(`analyzeJournalContent: Successfully parsed result: ${JSON.stringify(parsedResult)}`);
        return {
          sentiment: parsedResult.sentiment,
          score: parsedResult.score,
          themes: parsedResult.themes,
          insights: parsedResult.insights,
          emoji: parsedResult.emoji
        };
      }
      throw new Error("Invalid response format or non-integer score");
    } catch (parseError) {
      console.error("analyzeJournalContent: Error parsing JSON:", parseError, "Raw JSON attempted:", jsonString);
      return { error: "Failed to parse analysis response: " + jsonString };
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