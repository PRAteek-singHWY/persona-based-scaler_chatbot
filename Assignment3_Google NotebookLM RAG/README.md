# Assignment 03 — Google NotebookLM RAG

## Overview
This is a full-stack RAG (Retrieval-Augmented Generation) application inspired by Google NotebookLM. It allows users to upload documents (PDF or Plain Text), processes them into intelligent chunks, indexes them into a vector database (Qdrant), and enables grounded conversations with the document content.

## Features
- **Intelligent Ingestion**: Supports PDF and Text file uploads.
- **Advanced Chunking**: Implements `RecursiveCharacterTextSplitter` for semantic context preservation.
- **Vector Search**: Uses Qdrant for high-performance vector similarity retrieval.
- **Grounded Generation**: Uses OpenAI's GPT-4o-mini with a strict system prompt to ensure answers are derived ONLY from the document.
- **Premium UI**: A modern, dark-themed interface built with Next.js, Tailwind CSS, and Framer Motion.

## Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Next.js API Routes.
- **Orchestration**: LangChain.js.
- **LLM**: Groq (Llama 3.3 70B).
- **Embeddings**: OpenAI `text-embedding-3-large`.
- **Vector Database**: Qdrant.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- OpenAI API Key
- Qdrant Instance (Local or Cloud)

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_COLLECTION=notebook-lm-rag
```

### 3. Installation
```bash
npm install
```

### 4. Run Locally
```bash
npm run dev
```

## RAG Pipeline Logic
1. **Ingestion**: The user uploads a file via the web interface.
2. **Parsing**: `PDFLoader` extracts text from PDFs.
3. **Chunking**: Text is split using `RecursiveCharacterTextSplitter` with a chunk size of 1000 and overlap of 200 to maintain context across boundaries.
4. **Embedding**: Each chunk is converted into a 3072-dimensional vector using OpenAI's `text-embedding-3-large`.
5. **Indexing**: Vectors are stored in a Qdrant collection.
6. **Retrieval**: User queries are embedded and used to search the vector store for the top 5 most relevant chunks.
7. **Generation**: The retrieved chunks are injected into the LLM prompt as context, instructing it to answer solely based on the provided material.

## Deployment
The project is ready to be deployed on **Vercel**.
- **Live Link**: [https://google-notebooklm-rag.vercel.app](https://google-notebooklm-rag.vercel.app)
- **Repository**: [https://github.com/PRAteek-singHWY/persona-based-scaler_chatbot](https://github.com/PRAteek-singHWY/persona-based-scaler_chatbot)
