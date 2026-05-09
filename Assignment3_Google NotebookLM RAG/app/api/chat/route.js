import { NextResponse } from 'next/server';
import { JinaEmbeddings } from "../../../lib/jina-embeddings.js";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAI } from "openai";

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!process.env.JINA_API_KEY) {
      return NextResponse.json({ error: 'JINA_API_KEY is not set' }, { status: 500 });
    }
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not set' }, { status: 500 });
    }

    const embeddings = new JinaEmbeddings({
      apiKey: process.env.JINA_API_KEY,
      model: "jina-embeddings-v3",
    });

    const qdrantUrl = process.env.QDRANT_URL;
    const qdrantApiKey = process.env.QDRANT_API_KEY;
    const collectionName = process.env.QDRANT_COLLECTION || "notebook-lm-jina-v3";

    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: qdrantUrl,
      apiKey: qdrantApiKey,
      collectionName,
    });

    const retriever = vectorStore.asRetriever({ k: 5 });
    const relevantDocs = await retriever.invoke(message);

    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const context = relevantDocs
      .map(doc => `[Source: ${doc.metadata.source || 'Document'}, Page: ${doc.metadata.loc?.pageNumber || 'N/A'}]\n${doc.pageContent}`)
      .join('\n\n');

    const systemPrompt = `You are a professional AI Assistant specialized in analyzing documents. Your goal is to answer the user's question based ONLY on the provided context.

RULES:
1. Only answer based on the available context.
2. If the answer is not in the context, politely state that you cannot find the answer in the uploaded document.
3. Use a clear, structured, and professional tone.
4. Cite the source and page number if available in the context.

CONTEXT:
${context}`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0,
    });

    return NextResponse.json({
      answer: response.choices[0].message.content,
      sources: relevantDocs.map(doc => ({
        content: doc.pageContent,
        metadata: doc.metadata,
      })),
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
