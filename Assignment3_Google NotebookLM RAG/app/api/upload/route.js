import { NextResponse } from 'next/server';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import path from 'path';
import fs from 'fs/promises';
import { tmpdir } from 'os';

// Polyfills for server-side PDF parsing
if (typeof global.DOMMatrix === 'undefined') global.DOMMatrix = class {};
if (typeof global.ImageData === 'undefined') global.ImageData = class {};

// Static imports to force bundling on Vercel
import * as pdf from 'pdf-parse';
import officeParser from 'officeparser';
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Save file to a temporary location
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = path.join(tmpdir(), `${Date.now()}-${file.name}`);
    await fs.writeFile(tempPath, buffer);

    // 1. Load and Parse
    console.log("Starting PDF parsing phase...");
    let text = "";
    
    try {
      console.log("Attempting officeparser parsing...");
      text = await officeParser.parseOffice(buffer);
      console.log(`Officeparser success. Text length: ${text?.length || 0}`);
    } catch (officeError) {
      console.error("Officeparser failed:", officeError.message);
      
      console.log("Attempting pdf-parse fallback...");
      try {
        const parse = typeof pdf === 'function' ? pdf : (pdf.default || pdf);
        const data = await parse(buffer);
        text = data.text;
        console.log(`Pdf-parse success. Text length: ${text?.length || 0}`);
      } catch (pdfError) {
        console.error("Pdf-parse fallback failed:", pdfError.message);
        throw new Error("All PDF parsing methods failed. Please try a different document.");
      }
    }

    if (!text || text.trim().length === 0) {
      throw new Error("No text extracted from PDF");
    }

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
    const embeddings = new HuggingFaceTransformersEmbeddings({
      model: "Xenova/all-MiniLM-L6-v2",
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
    console.error('ULTIMATE ERROR LOG:', error);
    if (error.stack) console.error('STACK TRACE:', error.stack);
    return NextResponse.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}
