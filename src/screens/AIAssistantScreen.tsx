import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Loader2, RefreshCw, Bot } from 'lucide-react';
import { BottomNavigation } from '../components/BottomNavigation';
import { api } from '../lib/api';

interface Msg { id: string; text: string; isUser: boolean; typing?: boolean; }

const QUICK = ['How to treat Early Blight?', 'Best fertilizer for tomatoes?', 'How to prevent fungal diseases?', 'When to water crops?'];

export function AIAssistantScreen() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 'w', text: "Hi! I'm AgriVision AI 🌱 Ask me anything about crops, diseases, and farming best practices!", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<{ id: string; role: string; content: string }[]>('/api/chat/history')
      .then(h => {
        if (h.length > 0) setMsgs([
          { id: 'w', text: "Hi! I'm AgriVision AI 🌱 Ask me anything about crops, diseases, and farming best practices!", isUser: false },
          ...h.map(m => ({ id: m.id, text: m.content, isUser: m.role === 'user' }))
        ]);
      }).catch(() => {});
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setMsgs(p => [...p, { id: Date.now().toString(), text: msg, isUser: true }, { id: 'typing', text: '', isUser: false, typing: true }]);
    setInput(''); setLoading(true);
    try {
      const res = await api.post<{ reply: string }>('/api/chat', { message: msg });
      setMsgs(p => [...p.filter(m => m.id !== 'typing'), { id: (Date.now() + 1).toString(), text: res.reply, isUser: false }]);
    } catch {
      setMsgs(p => [...p.filter(m => m.id !== 'typing'), { id: 'err', text: 'Connection error. Please try again.', isUser: false }]);
    }
    setLoading(false);
  };

  return (
    /* Outer container: fixed height, flex column, no own scroll */
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>

      {/* ── HEADER (fixed, doesn't scroll) ─────────────────────────── */}
      <div style={{ padding: '32px 20px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#22c55e,#34d399)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(34,197,94,0.35)' }}>
            <Bot size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>AI Assistant</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 7, height: 7, background: '#22c55e', borderRadius: '50%' }} />
              <span style={{ color: '#6b7280', fontSize: 11 }}>Gemini 2.5 Flash · Online</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setMsgs([{ id: 'w', text: "Hi! I'm AgriVision AI 🌱 Ask me anything!", isUser: false }])}
          style={{ width: 36, height: 36, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <RefreshCw size={15} color="#6b7280" />
        </button>
      </div>

      {/* ── MESSAGES (only scrollable area) ────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px 16px 8px' } as React.CSSProperties}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {msgs.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: m.isUser ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
              {!m.isUser && (
                <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#22c55e,#34d399)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={13} color="#fff" />
                </div>
              )}
              <div style={{
                maxWidth: '78%', padding: '12px 16px',
                borderRadius: m.isUser ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
                background: m.isUser ? 'linear-gradient(135deg,#22c55e,#34d399)' : '#f3f4f6',
                color: m.isUser ? '#fff' : '#111827',
                fontSize: 14, lineHeight: 1.6,
              }}>
                {m.typing ? (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 16 }}>
                    {[0, 150, 300].map(d => (
                      <div key={d} style={{ width: 6, height: 6, background: '#9ca3af', borderRadius: '50%', animation: `bounce 1s ${d}ms infinite` }} />
                    ))}
                  </div>
                ) : m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      {/* ── QUICK CHIPS (only show at start) ───────────────────────── */}
      {msgs.length <= 2 && (
        <div style={{ padding: '6px 16px 4px', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {QUICK.map(q => (
              <button key={q} onClick={() => send(q)}
                style={{ padding: '7px 12px', background: '#f0fdf4', border: '1.5px solid #bbf7d0', color: '#16a34a', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── INPUT BAR — sits just above the bottom nav ──────────────── */}
      {/* marginBottom = 82px (bottom nav height) so it's not hidden under it */}
      <div style={{
        flexShrink: 0,
        marginBottom: 82,
        padding: '10px 16px 10px',
        borderTop: '1px solid #f3f4f6',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        background: '#fff',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about your crops..."
          disabled={loading}
          style={{
            flex: 1, padding: '13px 18px',
            background: '#f9fafb', border: '1.5px solid #e5e7eb',
            borderRadius: 99, fontSize: 14, color: '#111827',
            fontFamily: 'inherit',
          }}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          style={{ width: 46, height: 46, background: 'linear-gradient(135deg,#22c55e,#34d399)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(34,197,94,0.4)', flexShrink: 0 }}>
          {loading ? <Loader2 size={17} color="#fff" style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={17} color="#fff" />}
        </button>
      </div>

      {/* Bottom nav absolute-positioned at very bottom */}
      <BottomNavigation />
    </div>
  );
}
