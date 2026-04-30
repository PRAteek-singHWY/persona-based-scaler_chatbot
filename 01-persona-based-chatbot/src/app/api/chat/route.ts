import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { personas, PersonaId } from '@/app/lib/prompts';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages, personaId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    if (!personaId || !personas[personaId as PersonaId]) {
      return NextResponse.json({ error: 'Invalid persona ID' }, { status: 400 });
    }

    const persona = personas[personaId as PersonaId];

    // Prepend the system prompt to the messages
    const apiMessages = [
      { role: 'system' as const, content: persona.systemPrompt },
      ...messages.map((m: { role: 'user' | 'assistant' | 'system'; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: apiMessages,
      model: 'llama3-70b-8192', // Upgraded to 70B model for vastly superior reasoning and persona adherence
      temperature: 0.6, // Slightly lowered for more focused, mentorship-style answers
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    return NextResponse.json({
      message: chatCompletion.choices[0]?.message?.content || '',
    });
  } catch (error: unknown) {
    console.error('Groq API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during the API request.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
