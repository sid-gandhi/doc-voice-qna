import { getPineconeClient } from "@/lib/pinecone-client";
import { getVectorStoreSearchResults } from "@/lib/vector-store";
import { createGroq } from "@ai-sdk/groq";
import { Message, streamText } from "ai";
import { textToTextPrompt } from "@/lib/prompt-templates";

export const maxDuration = 30;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

type ChaatRequest = {
  messages: Message[];
  namespace: string;
};

export async function POST(req: Request) {
  const { messages, namespace }: ChaatRequest = await req.json();

  const lastMessage = messages[messages.length - 1]["content"];

  const pineconeClient = await getPineconeClient();

  const context = await getVectorStoreSearchResults(
    pineconeClient,
    lastMessage,
    namespace
  );

  const systemContent = textToTextPrompt.replace("{context}", context);

  const result = streamText({
    system: systemContent,
    model: groq("llama3-8b-8192"),
    messages,
  });

  return result.toDataStreamResponse();
}
