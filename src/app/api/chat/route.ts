import { getPineconeClient } from "@/lib/pinecone-client";
import { getVectorStoreSearchResults } from "@/lib/vector-store";
import { createGroq } from "@ai-sdk/groq";
import { createDataStreamResponse, Message, streamText, generateId } from "ai";
import { textToTextPrompt } from "@/lib/prompt-templates";

export const maxDuration = 30;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

type ChatRequest = {
  messages: Message[];
  namespace: string;
};

export async function POST(req: Request) {
  const { messages, namespace }: ChatRequest = await req.json();

  const lastMessage = messages[messages.length - 1]["content"];

  const pineconeClient = await getPineconeClient();

  const { context, sources, sourceAndContext } =
    await getVectorStoreSearchResults(pineconeClient, lastMessage, namespace);

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
