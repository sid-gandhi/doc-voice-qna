import { NextResponse, type NextRequest } from "next/server";
import Groq from "groq-sdk";
import { ConversationMessage } from "@/components/Conversation";
import { getPineconeClient } from "@/lib/pinecone-client";
import { getVectorStoreSearchResults } from "@/lib/vector-store";
import { LLM_PROMPT } from "@/lib/prompt-templates";

export const revalidate = 0;

type reqBodyType = {
  prompt: string;
  full_conv: ConversationMessage[];
  namespace: string;
};

export async function POST(req: NextRequest) {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const { prompt, full_conv, namespace }: reqBodyType = await req.json();

  const chatHistory = full_conv
    .map(
      (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
    )
    .join(" ");

  // retrieve context from vector store
  const pineconeClient = await getPineconeClient();
  const context = await getVectorStoreSearchResults(
    pineconeClient,
    prompt,
    namespace
  );

  // build the prompt
  const llmPrompt = LLM_PROMPT.replace("{chat_history}", chatHistory)
    .replace("{context}", context)
    .replace("{query}", prompt);

  const model = "llama3-70b-8192";

  const chatCompletion = await client.chat.completions.create({
    messages: [{ role: "user", content: llmPrompt }],
    model,
    max_tokens: 300,
  });

  const llm_response = chatCompletion.choices[0].message.content;

  return NextResponse.json({
    llm_response,
  });
}
