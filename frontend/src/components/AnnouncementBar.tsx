import { useState, useEffect } from 'react';
import { CloseOutlined, NotificationFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const ANNOUNCEMENTS = [
  {
    id: 'launch-ksa',
    en: 'VeeSIRI is live across Saudi Arabia — onboard your factory today.',
    ar: 'VeeSIRI تعمل الآن في المملكة العربية السعودية — سجّل مصنعك اليوم.',
    cta: { en: 'Register free', ar: 'سجّل مجانًا', href: '/register' },
  },
  {
    id: 'gov-partner',
    en: 'New: Live ministerial report for MIMR and SIDF.',
    ar: 'جديد: تقرير وزاري فوري لوزارة الصناعة وصندوق التنمية الصناعية.',
    cta: { en: 'Open portal', ar: 'افتح البوابة', href: '/gov/login' },
  },
  {
    id: 'ai',
    en: 'Meet our AI assistant — answers contextual questions about your factory.',
    ar: 'قابل مساعد الذكاء الاصطناعي الخاص بنا — أجوبة سياقية عن مصنعك.',
    cta: { en: 'Try now', ar: 'جرب الآن', href: '/login' },
  },
];

export default function AnnouncementBar({ variant = 'public' }: { variant?: 'public' | 'app' }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof sessionStorage === 'undefined') return false;
    return sessionStorage.getItem('vee-announcement') === '1';
  });
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (dismissed) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % ANNOUNCEMENTS.length), 6000);
    return () => clearInterval(id);
  }, [dismissed]);

  if (dismissed) return null;
  const a = ANNOUNCEMENTS[idx];

  const close = () => {
    sessionStorage.setItem('vee-announcement', '1');
    setDismissed(true);
  };

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #006C35 0%, #C8A548 100%)',
        color: '#fff',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 13,
        fontWeight: 500,
        position: variant === 'public' ? 'relative' : 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <NotificationFilled />
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {isAr ? a.ar : a.en}
        </span>
        <a
          href={a.cta.href}
          style={{
            color: '#fff',
            textDecoration: 'underline',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {isAr ? a.cta.ar : a.cta.en} →
        </a>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {ANNOUNCEMENTS.map((_, i) => (
            <span
              key={i}
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: i === idx ? '#fff' : 'rgba(255,255,255,0.4)',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>
        <CloseOutlined style={{ cursor: 'pointer' }} onClick={close} />
      </div>
    </div>
  );
}
