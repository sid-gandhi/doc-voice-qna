import { getPineconeClient } from "@/lib/pinecone-client";
import { getVectorStoreSearchResults } from "@/lib/vector-store";
import { createGroq } from "@ai-sdk/groq";
import { createDataStreamResponse, Message, streamText, generateId } from "ai";
import { textToTextPrompt } from "@/lib/prompt-templates";
import { getPublicUrl } from "@/lib/supabase-storage";

export const maxDuration = 30;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

type ChatRequest = {
  messages: Message[];
  namespace: string;
};

export type SourceUrls = { source: string; url: string }[];

export async function POST(req: Request) {
  const { messages, namespace }: ChatRequest = await req.json();

  const lastMessage = messages[messages.length - 1]["content"];

  const pineconeClient = await getPineconeClient();

  const { context, sources } = await getVectorStoreSearchResults(
    pineconeClient,
    lastMessage,
    namespace
  );

  const sourceUrls: SourceUrls = [];
  for (const source of sources) {
    const publicUrl = await getPublicUrl(source);
    sourceUrls.push({ source, url: publicUrl });
  }

  const systemContent = textToTextPrompt.replace("{context}", context);

  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.writeData("initialized call");

      const result = streamText({
        system: systemContent,
        model: groq("llama3-8b-8192"),
        messages,

        onFinish() {
          // message annotation:
          dataStream.writeMessageAnnotation({
            id: generateId(), // e.g. id from saved DB record
            sources,
            sourceUrls,
          });

          // call annotation:
          dataStream.writeData("call completed");
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
    onError: (error) => {
      // Error messages are masked by default for security reasons.
      // If you want to expose the error message to the client, you can do so here:
      return error instanceof Error ? error.message : String(error);
    },
  });
}
