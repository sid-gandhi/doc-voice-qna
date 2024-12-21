import { NextResponse, type NextRequest } from "next/server";
import Groq from "groq-sdk";
import { ConversationMessage } from "@/components/Conversation";

export const revalidate = 0;

type reqBodyType = {
  prompt: string;
  full_conv: ConversationMessage[];
};

export async function POST(req: NextRequest) {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const { prompt, full_conv }: reqBodyType = await req.json();

  const messages = full_conv.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const model = "llama3-70b-8192";

  const chatCompletion = await client.chat.completions.create({
    messages,
    model,
  });

  const llm_response = chatCompletion.choices[0].message.content;

  return NextResponse.json({
    llm_response,
  });
}
