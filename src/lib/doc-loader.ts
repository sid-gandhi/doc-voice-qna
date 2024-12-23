import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function getChunkedDocs(doc: File) {
  try {
    const fileExtension = "." + doc.name.split(".").pop()?.toLowerCase();

    let loader;
    if (fileExtension === ".pdf") {
      loader = new PDFLoader(doc);
    } else if (fileExtension === ".txt") {
      loader = new TextLoader(doc);
    } else if (fileExtension === ".docx") {
      loader = new DocxLoader(doc);
    } else {
      throw new Error(
        "Unsupported file type. Only PDF, TXT and DOCX files are supported."
      );
    }

    const docs = await loader.load();

    // From the docs https://www.pinecone.io/learn/chunking-strategies/
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunkedDocs = await textSplitter.splitDocuments(docs);

    return chunkedDocs;
  } catch (e) {
    console.error(e);
    throw new Error("Document chunking failed!");
  }
}
