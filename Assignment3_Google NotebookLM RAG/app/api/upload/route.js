import { NextResponse } from 'next/server';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
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
    const loader = new PDFLoader(tempPath);
    const rawDocs = await loader.load();

    // 2. Chunking
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await textSplitter.splitDocuments(rawDocs);

    // 3. Embeddings
    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-large",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // 4. Vector Store (Qdrant)
    const qdrantUrl = process.env.QDRANT_URL || "http://localhost:6333";
    const qdrantApiKey = process.env.QDRANT_API_KEY;
    const collectionName = process.env.QDRANT_COLLECTION || "notebook-lm-rag";

    // Ensure collection exists (optional with fromDocuments but good practice)
    const client = new QdrantClient({
        url: qdrantUrl,
        apiKey: qdrantApiKey,
    });

    await QdrantVectorStore.fromDocuments(docs, embeddings, {
      url: qdrantUrl,
      apiKey: qdrantApiKey,
      collectionName: collectionName,
    });

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
