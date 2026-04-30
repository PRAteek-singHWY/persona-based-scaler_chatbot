'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User } from 'lucide-react';
import styles from './page.module.css';
import { personas, PersonaId } from './lib/prompts';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  const [activePersona, setActivePersona] = useState<PersonaId>('anshuman');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const chatAreaRef = useRef<HTMLDivElement>(null);

  const persona = personas[activePersona];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handlePersonaChange = (id: PersonaId) => {
    if (isLoading) return;
    setActivePersona(id);
    setMessages([]); // Reset conversation on persona switch
    setError('');
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          personaId: activePersona
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while communicating with the API.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Scaler Mentor Chatbot</h1>
        <p className={styles.subtitle}>Powered by Groq & Llama 3</p>
      </header>

      <div className={styles.personaSwitcher}>
        {(Object.keys(personas) as PersonaId[]).map((id) => (
          <button
            key={id}
            className={`${styles.personaBtn} ${activePersona === id ? styles.personaBtnActive : ''}`}
            onClick={() => handlePersonaChange(id)}
            disabled={isLoading}
          >
            {personas[id].name}
          </button>
        ))}
      </div>

      <div className={styles.chatArea} ref={chatAreaRef}>
        {messages.length === 0 ? (
          <div className={styles.personaIntro}>
            <h2>Chat with {persona.name}</h2>
            <p>{persona.role}</p>
            <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>{persona.description}</p>
            
            <div className={styles.suggestions}>
              {persona.suggestions.map((suggestion, idx) => (
                <button 
                  key={idx} 
                  className={styles.suggestionChip}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div 
              key={m.id} 
              className={`${styles.messageWrapper} ${m.role === 'user' ? styles.messageWrapperUser : styles.messageWrapperAi}`}
            >
              <div className={`${styles.message} ${m.role === 'user' ? styles.messageUser : styles.messageAi}`}>
                {m.content}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className={`${styles.messageWrapper} ${styles.messageWrapperAi}`}>
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.inputArea}>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${persona.name.split(' ')[0]} a question...`}
            disabled={isLoading}
          />
          <button type="submit" className={styles.sendBtn} disabled={isLoading || !input.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </main>
  );
}
