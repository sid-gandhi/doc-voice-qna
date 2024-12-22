import { getChunkedDocsFromPDF } from "@/lib/pdf-loader";
import { getPineconeClient } from "@/lib/pinecone-client";
import { embedAndStoreDocs } from "@/lib/vector-store";
import { NextResponse, type NextRequest } from "next/server";

export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    console.log("Processing document...");

    const formData = await req.formData();

    const uploadedFile = formData.get("file") as File;

    console.log("File received:", uploadedFile.name);

    const pineconeClient = await getPineconeClient();

    console.log("Preparing chunks from PDF File");
    const docs = await getChunkedDocsFromPDF(uploadedFile);
    console.log(`Loading ${docs.length} chunks into pinecone...`);

    await embedAndStoreDocs(pineconeClient, docs);
    console.log("Data embedded and stored in pine-cone index");

    return NextResponse.json({
      message: "success",
    });
  } catch (e) {
    console.error(e);
  }
}
