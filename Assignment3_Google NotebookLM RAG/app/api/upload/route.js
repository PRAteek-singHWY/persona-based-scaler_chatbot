import { NextResponse } from 'next/server';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { JinaEmbeddings } from "../../../lib/jina-embeddings.js";
import pdf from 'pdf-parse';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const data = await pdf(buffer);
    const text = data.text;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'No text extracted from PDF' }, { status: 400 });
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await textSplitter.createDocuments(
      [text],
      [{ source: file.name }]
    );

    if (!process.env.JINA_API_KEY) {
      return NextResponse.json({ error: 'JINA_API_KEY is not set' }, { status: 500 });
    }

    const embeddings = new JinaEmbeddings({
      apiKey: process.env.JINA_API_KEY,
      model: "jina-embeddings-v3",
    });

    const qdrantUrl = process.env.QDRANT_URL;
    const qdrantApiKey = process.env.QDRANT_API_KEY;
    const collectionName = process.env.QDRANT_COLLECTION || "notebook-lm-jina-v3";

    if (!qdrantUrl) {
      return NextResponse.json({ error: 'QDRANT_URL is not set' }, { status: 500 });
    }

    await QdrantVectorStore.fromDocuments(docs, embeddings, {
      url: qdrantUrl,
      apiKey: qdrantApiKey,
      collectionName,
    });

    return NextResponse.json({
      message: 'Indexing completed successfully',
      chunksCount: docs.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
