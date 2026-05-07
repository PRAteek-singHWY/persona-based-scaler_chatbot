import { NextResponse } from 'next/server';
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantClient } from "@qdrant/js-client-rest";
import path from 'path';
import fs from 'fs/promises';
import { tmpdir } from 'os';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Save file to a temporary location for LangChain PDFLoader
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = path.join(tmpdir(), `${Date.now()}-${file.name}`);
    await fs.writeFile(tempPath, buffer);

    // 1. Load and Parse
    console.log("Loading PDF...");
    const officeParser = (await import("officeparser")).default;
    const text = await officeParser.parseUndefinedAsync(buffer);
    console.log(`PDF Parsed. Text length: ${text.length}`);

    // 2. Chunking
    console.log("Splitting text...");
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await textSplitter.createDocuments([text]);
    console.log(`Text split into ${docs.length} chunks.`);

    // 3. Embeddings (Local - No OpenAI Key Needed)
    console.log("Initializing local embeddings...");
    const { HuggingFaceTransformersEmbeddings } = await import("@langchain/community/embeddings/hf_transformers");
    const embeddings = new HuggingFaceTransformersEmbeddings({
      modelName: "Xenova/all-MiniLM-L6-v2",
    });
    console.log("Embeddings initialized.");

    // 4. Vector Store (Qdrant)
    console.log("Connecting to Qdrant...");
    const qdrantUrl = process.env.QDRANT_URL;
    const qdrantApiKey = process.env.QDRANT_API_KEY;
    const collectionName = process.env.QDRANT_COLLECTION || "notebook-lm-local";

    if (!qdrantUrl) throw new Error("QDRANT_URL is not set");

    console.log(`Storing in collection: ${collectionName}`);
    await QdrantVectorStore.fromDocuments(docs, embeddings, {
      url: qdrantUrl,
      apiKey: qdrantApiKey,
      collectionName: collectionName,
    });
    console.log("Indexing completed.");

    // Cleanup temp file
    await fs.unlink(tempPath);

    return NextResponse.json({ 
      message: 'Indexing completed successfully',
      chunksCount: docs.length
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
