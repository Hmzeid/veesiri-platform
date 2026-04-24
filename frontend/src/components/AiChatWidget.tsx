import { useState, useRef, useEffect } from 'react';
import { Button, Input, Space, Typography, Spin, Tag } from 'antd';
import { MessageOutlined, CloseOutlined, SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelectedFactory } from '../store/selectedFactory';
import { api } from '../api/client';

type Msg = { role: 'user' | 'assistant'; text: string; at: number };

export default function AiChatWidget() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const factoryId = useSelectedFactory((s) => s.factoryId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          text: i18n.language === 'ar'
            ? 'أهلًا! أنا مساعد VeeSIRI. اسألني عن درجة SIRI الخاصة بك، الفجوات، خارطة الطريق، أو تمويل SIDF.'
            : "Hi! I'm the VeeSIRI assistant. Ask me about your SIRI score, gaps, roadmap, or SIDF financing.",
          at: Date.now(),
        },
      ]);
      setSuggestions(i18n.language === 'ar'
        ? ['ما درجة SIRI الحالية؟', 'ما أكبر 3 فجوات لدي؟', 'هل أنا مؤهل لتمويل SIDF؟']
        : ["What's my SIRI score?", 'What are my 3 biggest gaps?', 'Am I SIDF-eligible?']);
    }
  }, [open, i18n.language]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, sending]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: 'user', text, at: Date.now() }]);
    setInput('');
    setSending(true);
    try {
      const { data } = await api.post('/ai/chat', {
        factoryId: factoryId ?? undefined,
        message: text,
        lang: i18n.language === 'ar' ? 'ar' : 'en',
      });
      setMessages((m) => [...m, { role: 'assistant', text: data.reply, at: Date.now() }]);
      if (data.suggestions) setSuggestions(data.suggestions);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: 'Service temporarily unavailable.', at: Date.now() }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating trigger */}
      <Button
        shape="circle"
        type="primary"
        size="large"
        icon={open ? <CloseOutlined /> : <RobotOutlined />}
        onClick={() => setOpen((o) => !o)}
        className="cta-glow"
        style={{
          position: 'fixed',
          bottom: 24,
          insetInlineEnd: 24,
          width: 56, height: 56,
          zIndex: 1000,
          background: 'var(--gradient-hero)',
          border: 'none',
        }}
      />
      {!open && (
        <div
          style={{
            position: 'fixed',
            bottom: 90, insetInlineEnd: 24,
            background: '#fff',
            padding: '6px 12px',
            borderRadius: 14,
            boxShadow: 'var(--shadow-md)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--color-ink-800)',
            zIndex: 999,
            pointerEvents: 'none',
            animation: 'fadeSlide 0.4s ease both',
          }}
        >
          <span className="live-dot" /> Ask the AI assistant
        </div>
      )}

      {/* Panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 96, insetInlineEnd: 24,
            width: 380, maxWidth: 'calc(100vw - 48px)',
            height: 560, maxHeight: 'calc(100vh - 120px)',
            background: '#fff',
            borderRadius: 18,
            boxShadow: 'var(--shadow-xl)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid var(--color-ink-200)',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              background: 'var(--gradient-hero)',
              color: '#fff',
            }}
          >
            <Space style={{ justifyContent: 'space-between', width: '100%' }}>
              <Space>
                <div
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(255,255,255,0.15)',
                    display: 'grid', placeItems: 'center',
                  }}
                >
                  <RobotOutlined style={{ fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>VeeSIRI AI</div>
                  <div style={{ fontSize: 11, opacity: 0.85 }}>
                    <span className="live-dot" /> Online · bilingual
                  </div>
                </div>
              </Space>
              <Button
                type="text"
                icon={<CloseOutlined style={{ color: '#fff' }} />}
                onClick={() => setOpen(false)}
              />
            </Space>
          </div>

          <div
            ref={scrollRef}
            style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#f8fafc' }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: 14,
                    background: m.role === 'user' ? '#006C35' : '#fff',
                    color: m.role === 'user' ? '#fff' : 'var(--color-ink-800)',
                    border: m.role === 'user' ? 'none' : '1px solid var(--color-ink-200)',
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '10px 14px', borderRadius: 14, background: '#fff', border: '1px solid var(--color-ink-200)' }}>
                  <Spin size="small" />
                </div>
              </div>
            )}
          </div>

          {suggestions.length > 0 && !sending && (
            <div style={{ padding: '8px 16px', borderTop: '1px solid var(--color-ink-200)' }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>Suggested:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {suggestions.slice(0, 3).map((s, i) => (
                  <Tag
                    key={i}
                    color="green"
                    style={{ cursor: 'pointer', margin: 0 }}
                    onClick={() => send(s)}
                  >
                    {s}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: 12, borderTop: '1px solid var(--color-ink-200)', background: '#fff' }}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder={i18n.language === 'ar' ? 'اكتب سؤالك...' : 'Ask anything...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={() => send(input)}
                disabled={sending}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => send(input)}
                loading={sending}
              />
            </Space.Compact>
          </div>
        </div>
      )}
    </>
  );
}
