import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";

export const maxDuration = 30;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: groq("llama3-8b-8192"),
    messages,
  });

  return result.toDataStreamResponse();
}
