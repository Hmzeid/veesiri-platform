import { useState, useEffect } from 'react';
import { Modal, Button, Space, Typography, Steps, Tag } from 'antd';
import {
  DashboardOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  NodeIndexOutlined,
  SafetyCertificateOutlined,
  RobotOutlined,
  RocketOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelectedFactory } from '../store/selectedFactory';

const KEY = 'veesiri-tour-completed-v1';

export default function ProductTour() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const nav = useNavigate();
  const fid = useSelectedFactory((s) => s.factoryId);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    if (!localStorage.getItem(KEY)) {
      const timer = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const finish = () => {
    localStorage.setItem(KEY, '1');
    setOpen(false);
    setStep(0);
  };

  const steps = [
    {
      icon: <DashboardOutlined />,
      color: '#006C35',
      title: isAr ? 'مرحبًا بك في VeeSIRI' : 'Welcome to VeeSIRI',
      body: isAr
        ? 'نصنع هنا تقييم SIRI الخاص بمصنعك، ونولّد تحليل الفجوات، وخارطة طريق التحول، وكل ما تحتاجه للحصول على شهادة SIRI وتمويل SIDF.'
        : 'This platform walks your factory through its SIRI assessment, generates a prioritized gap matrix, produces a full transformation roadmap, and prepares you for SIRI certification and SIDF financing.',
      tag: 'Overview',
    },
    {
      icon: <BarChartOutlined />,
      color: '#0ea5e9',
      title: isAr ? 'ابدأ بتقييم SIRI' : 'Start with the SIRI assessment',
      body: isAr
        ? '١٦ بُعدًا عبر ٨ ركائز و ٣ لبنات. كل بُعد يُقيَّم من 0 إلى 5. يستغرق التقييم الأول عادةً 45-60 دقيقة.'
        : '16 dimensions across 8 pillars and 3 building blocks. Each dimension scored 0–5. Your first self-assessment typically takes 45–60 minutes.',
      tag: 'Step 1',
      cta: fid ? { label: 'Open Factories', path: '/app/factories' } : null,
    },
    {
      icon: <ThunderboltOutlined />,
      color: '#C8A548',
      title: isAr ? 'حلّل الفجوات وسيناريوهات "ماذا لو"' : 'Analyze gaps & run what-if',
      body: isAr
        ? 'بعد التسليم، سنُولّد مصفوفة فجوات مرتبة بالأولوية. استخدم المحاكي لرؤية "كم سترتفع درجتي إذا أغلقت هذه الفجوات؟".'
        : 'On submit we auto-generate a prioritized gap matrix. Use the What-if Simulator to see "how much would my score rise if I close these gaps?"',
      tag: 'Step 2',
      cta: fid ? { label: 'Open Simulator', path: `/app/factories/${fid}/simulator` } : null,
    },
    {
      icon: <NodeIndexOutlined />,
      color: '#8b5cf6',
      title: isAr ? 'نفّذ خارطة الطريق' : 'Execute your roadmap',
      body: isAr
        ? 'ثلاث مراحل: التأسيس → التسريع → التحسين. عرض جانت وKanban وتقويم. عيّن ميزانيات ومسؤولين، وتتبّع المبادرات.'
        : '3 phases (Foundation → Acceleration → Optimization) with Gantt, Kanban, and Calendar views. Assign budgets, owners, and track initiative progress.',
      tag: 'Step 3',
      cta: fid ? { label: 'Open Roadmap', path: `/app/factories/${fid}/roadmap` } : null,
    },
    {
      icon: <SafetyCertificateOutlined />,
      color: '#059669',
      title: isAr ? 'احصل على شهادة SIRI قابلة للتحقق' : 'Earn a verifiable SIRI certificate',
      body: isAr
        ? 'كل تقييم معتمد يمنحك شهادة موقعة رقميًا برمز QR — أي شخص يمكنه التحقق منها عبر رابط عام.'
        : 'Every certified assessment earns you a digitally-signed, QR-verifiable certificate. Anyone can confirm it at a public URL.',
      tag: 'Step 4',
      cta: fid ? { label: 'View Certificate', path: `/app/factories/${fid}/certificate` } : null,
    },
    {
      icon: <RobotOutlined />,
      color: '#0ea5e9',
      title: isAr ? 'مساعد الذكاء الاصطناعي' : 'Your AI assistant is always there',
      body: isAr
        ? 'انقر على الأيقونة في الزاوية السفلية لسؤال المساعد عن درجتك والفجوات وأهلية تمويل SIDF. ثنائي اللغة.'
        : 'Click the green bubble in the bottom-right corner any time. Ask about your score, biggest gaps, SIDF eligibility — in Arabic or English.',
      tag: 'Always on',
    },
  ];

  const cur = steps[step];
  const last = step === steps.length - 1;

  return (
    <Modal
      open={open}
      footer={null}
      onCancel={finish}
      closable
      width={600}
      centered
      styles={{ body: { padding: 0 } }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${cur.color}18 0%, ${cur.color}04 100%)`,
          padding: '32px 32px 20px',
          borderBottom: `3px solid ${cur.color}`,
        }}
      >
        <Space align="start" style={{ width: '100%' }}>
          <div
            style={{
              width: 54, height: 54, borderRadius: 14,
              background: cur.color, color: '#fff',
              display: 'grid', placeItems: 'center', fontSize: 26,
              boxShadow: `0 10px 24px ${cur.color}44`,
            }}
          >
            {cur.icon}
          </div>
          <div>
            <Tag color="default" style={{ marginBottom: 8 }}>{cur.tag}</Tag>
            <Typography.Title level={3} style={{ margin: 0 }}>{cur.title}</Typography.Title>
          </div>
        </Space>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.65, minHeight: 110 }}>
          {cur.body}
        </Typography.Paragraph>

        {cur.cta && (
          <Button
            type="primary"
            onClick={() => {
              if (cur.cta) nav(cur.cta.path);
              finish();
            }}
            style={{ marginBottom: 20 }}
          >
            {cur.cta.label} →
          </Button>
        )}

        <Steps
          size="small"
          current={step}
          items={steps.map(() => ({ title: '' }))}
          style={{ marginTop: 16 }}
        />

        <Space style={{ marginTop: 24, justifyContent: 'space-between', width: '100%' }}>
          <Button type="text" onClick={finish} style={{ color: '#94a3b8' }}>
            Skip tour
          </Button>
          <Space>
            {step > 0 && (
              <Button onClick={() => setStep((s) => s - 1)}>Back</Button>
            )}
            {!last ? (
              <Button type="primary" onClick={() => setStep((s) => s + 1)}>
                Next
              </Button>
            ) : (
              <Button type="primary" icon={<CheckCircleFilled />} onClick={finish}>
                Got it
              </Button>
            )}
          </Space>
        </Space>
      </div>
    </Modal>
  );
}
