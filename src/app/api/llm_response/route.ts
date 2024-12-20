import { NextResponse, type NextRequest } from "next/server";
import Groq from "groq-sdk";

export const revalidate = 0;

export async function POST(req: NextRequest) {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const { prompt } = await req.json();

  const chatCompletion = await client.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama3-70b-8192",
  });

  const llm_response = chatCompletion.choices[0].message.content;

  return NextResponse.json({
    llm_response,
  });
}
