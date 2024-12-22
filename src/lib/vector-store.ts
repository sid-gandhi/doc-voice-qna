import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { CohereEmbeddings } from "@langchain/cohere";
import { Document } from "@langchain/core/documents";

export async function embedAndStoreDocs(
  client: Pinecone,
  docs: Document<Record<string, any>>[],
  namespace: string
) {
  /*create and store the embeddings in the vectorStore*/
  try {
    const embeddings = new CohereEmbeddings({ model: "embed-english-v3.0" });
    const index = client.Index(process.env.PINECONE_INDEX_NAME!);

    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      textKey: "text",
      namespace,
    });
  } catch (error) {
    console.log("error ", error);
    throw new Error("Failed to load your docs !");
  }
}

// Returns vector-store handle to be used a retrievers on langchains
export async function getVectorStoreSearchResults(
  client: Pinecone,
  query: string,
  namespace: string
) {
  try {
    const embeddings = new CohereEmbeddings({ model: "embed-english-v3.0" });
    const index = client.Index(process.env.PINECONE_INDEX_NAME!);

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      textKey: "text",
      namespace,
    });

    const searchResults = await vectorStore.similaritySearch(query, 2);

    const context = searchResults
      .map((result) => result.pageContent)
      .join("\n");

    return context;
  } catch (error) {
    console.log("error ", error);
    throw new Error("Something went wrong while getting vector store !");
  }
}
