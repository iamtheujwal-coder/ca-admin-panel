import { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

export default function AskAssistant() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am your AI Assistant. How can I help you today with your tax, compliance, or portal queries?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { id: Date.now() + 1, text: "I've noted your request. Your dedicated representative will review this shortly. In the meantime, you can check your status tracker for real-time updates.", sender: 'bot' }
      ]);
    }, 1000);
  };

  return (
    <div style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 120px)' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="font-serif" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Ask Assistant <Sparkles size={20} color="var(--color-accent-primary)" />
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Get instant answers about your filings and documents.</p>
      </div>

      <div style={{ flex: 1, backgroundColor: 'var(--color-bg-secondary)', borderRadius: '16px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', gap: '12px', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              {msg.sender === 'bot' && (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7', flexShrink: 0 }}>
                  <Bot size={18} />
                </div>
              )}
              <div style={{ background: msg.sender === 'user' ? 'var(--color-accent-primary)' : 'var(--color-bg-primary)', color: msg.sender === 'user' ? '#fff' : 'var(--color-text-primary)', padding: '16px', borderRadius: '16px', border: msg.sender === 'bot' ? '1px solid var(--color-border)' : 'none', borderTopRightRadius: msg.sender === 'user' ? 0 : '16px', borderTopLeftRadius: msg.sender === 'bot' ? 0 : '16px', lineHeight: 1.5 }}>
                {msg.text}
              </div>
              {msg.sender === 'user' && (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
                  <User size={18} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-primary)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..." 
              style={{ flex: 1, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px 20px', color: 'var(--color-text-primary)', outline: 'none' }}
            />
            <button type="submit" style={{ background: 'var(--color-accent-primary)', color: '#fff', border: 'none', borderRadius: '12px', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
