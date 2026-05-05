'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Menu, Plus, MessageSquare, Sparkles, X } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    if (isLoading) return;
    setMessages([]);
    setError('');
    setInput('');
    setSidebarOpen(false);
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
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while communicating with the API.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.appContainer}>
      <div 
        className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.open : ''}`} 
        onClick={() => setSidebarOpen(false)} 
      />
      
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <Sparkles className={styles.brandIcon} />
            <h2>Scaler AI</h2>
          </div>
          <button className={styles.closeSidebarBtn} onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <button className={styles.newChatBtn} onClick={handleNewChat} disabled={isLoading}>
          <Plus size={18} /> New Chat
        </button>

        <div className={styles.personaList}>
          <h3 className={styles.sidebarTitle}>Select Mentor</h3>
          {(Object.keys(personas) as PersonaId[]).map((id) => (
            <button
              key={id}
              className={`${styles.personaCard} ${activePersona === id ? styles.personaCardActive : ''}`}
              onClick={() => handlePersonaChange(id)}
              disabled={isLoading}
            >
              <div className={styles.personaAvatar}>{personas[id].name.charAt(0)}</div>
              <div className={styles.personaInfo}>
                <span className={styles.personaName}>{personas[id].name}</span>
                <span className={styles.personaRole}>{personas[id].role.split(',')[0]}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className={styles.mainContent}>
        <header className={styles.mobileHeader}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h2>{persona.name}</h2>
          <div style={{ width: 24 }} /> {/* Spacer for balance */}
        </header>

        <div className={styles.chatArea} ref={chatAreaRef}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyAvatar}>{persona.name.charAt(0)}</div>
              <h1>{persona.name}</h1>
              <p>{persona.description}</p>
              
              <div className={styles.suggestionsGrid}>
                {persona.suggestions.map((suggestion, idx) => (
                  <button 
                    key={idx} 
                    className={styles.suggestionCard}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <MessageSquare size={16} className={styles.suggestionIcon} />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.messagesContainer}>
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`${styles.messageRow} ${m.role === 'user' ? styles.rowUser : styles.rowAi}`}
                >
                  <div className={`${styles.messageBubble} ${m.role === 'user' ? styles.bubbleUser : styles.bubbleAi}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className={`${styles.messageRow} ${styles.rowAi}`}>
                  <div className={`${styles.messageBubble} ${styles.bubbleAi} ${styles.typingBubble}`}>
                    <div className="typing-indicator" style={{boxShadow: 'none', background: 'transparent', padding: '8px 12px', border: 'none'}}>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.inputContainer}>
          <div className={styles.inputWrapper}>
             {error && <div className={styles.errorBanner}>{error}</div>}
             <form onSubmit={handleSubmit} className={styles.form}>
               <input 
                 type="text" 
                 className={styles.input} 
                 value={input} 
                 onChange={(e) => setInput(e.target.value)} 
                 placeholder={`Message ${persona.name.split(' ')[0]}...`} 
                 disabled={isLoading} 
               />
               <button type="submit" className={styles.sendBtn} disabled={isLoading || !input.trim()}>
                 <Send size={18} />
               </button>
             </form>
             <p className={styles.footerDisclaimer}>AI can make mistakes. Verify important information.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
