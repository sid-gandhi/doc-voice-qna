export const maxDuration = 60;

import { getChunkedDocs } from "@/lib/doc-loader";
import { getPineconeClient } from "@/lib/pinecone-client";
import { embedAndStoreDocs } from "@/lib/vector-store";
import { NextResponse, type NextRequest } from "next/server";

export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    console.log("Processing document...");

    const formData = await req.formData();

    const uploadedFile = formData.get("file") as File;
    const namespace = formData.get("namespace") as string;

    console.log("File received:", uploadedFile.name);

    const pineconeClient = await getPineconeClient();

    console.log("Preparing chunks from PDF File");
    const docs = await getChunkedDocs(uploadedFile);
    console.log(`Loading ${docs.length} chunks into pinecone...`);

    // add source metadata
    docs.forEach((doc) => {
      doc.metadata.source = namespace;
    });

    await embedAndStoreDocs(pineconeClient, docs, namespace);
    console.log("Data embedded and stored in pine-cone index");

    return NextResponse.json({
      message: "success",
    });
  } catch (e) {
    console.error(e);
  }
}
