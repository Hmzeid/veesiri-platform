import { useState } from 'react';
import { Typography, Space, Button, Row, Col, Tag } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const BUILDING_BLOCKS = [
  {
    key: 'PROCESS', color: '#006C35',
    title: 'Process', titleAr: 'العملية',
    description: 'How work flows through your factory — planning, execution, supply chain, product lifecycle.',
    pillars: [
      { key: 'OPERATIONS', title: 'Operations', dims: ['OPS-1 · Operations Planning', 'OPS-2 · Operations Execution'] },
      { key: 'SUPPLY_CHAIN', title: 'Supply Chain', dims: ['SC-1 · Digital Supply Chain', 'SC-2 · Supply Chain Visibility'] },
      { key: 'PRODUCT_LIFECYCLE', title: 'Product Lifecycle', dims: ['PLC-1 · Product Development', 'PLC-2 · Product Lifecycle Management'] },
    ],
  },
  {
    key: 'TECHNOLOGY', color: '#0ea5e9',
    title: 'Technology', titleAr: 'التقنية',
    description: 'The digital backbone — automation, connectivity, and intelligence layers across OT/IT.',
    pillars: [
      { key: 'AUTOMATION', title: 'Automation', dims: ['AUTO-1 · Shop Floor Automation', 'AUTO-2 · Enterprise Automation'] },
      { key: 'CONNECTIVITY', title: 'Connectivity', dims: ['CONN-1 · Machine & System Connectivity', 'CONN-2 · Data Infrastructure'] },
      { key: 'INTELLIGENCE', title: 'Intelligence', dims: ['INT-1 · Data Analytics', 'INT-2 · AI & Advanced Intelligence'] },
    ],
  },
  {
    key: 'ORGANIZATION', color: '#8b5cf6',
    title: 'Organization', titleAr: 'المنظمة',
    description: 'The people side — talent readiness, governance, and transformation strategy.',
    pillars: [
      { key: 'TALENT_READINESS', title: 'Talent Readiness', dims: ['TAL-1 · Workforce L&D', 'TAL-2 · Cross-functional Collaboration'] },
      { key: 'STRUCTURE_MANAGEMENT', title: 'Structure & Management', dims: ['STR-1 · Leadership & Governance', 'STR-2 · Transformation Strategy'] },
    ],
  },
];

const LEVELS = [
  { n: 0, label: 'Undefined', ar: 'غير محدد', desc: 'No documented processes. Tribal knowledge only.', color: '#dc2626' },
  { n: 1, label: 'Defined', ar: 'محدد', desc: 'Documented but manual processes.', color: '#f97316' },
  { n: 2, label: 'Digital', ar: 'رقمي', desc: 'Basic digital systems exist but are siloed.', color: '#eab308' },
  { n: 3, label: 'Integrated', ar: 'متكامل', desc: 'Systems are connected and exchange data end-to-end.', color: '#84cc16' },
  { n: 4, label: 'Automated', ar: 'آلي', desc: 'End-to-end automated with minimal human intervention.', color: '#22c55e' },
  { n: 5, label: 'Intelligent', ar: 'ذكي', desc: 'Self-optimizing AI-driven systems that learn and improve.', color: '#059669' },
];

export default function SiriFrameworkPage() {
  const nav = useNavigate();
  const { i18n } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState(3);

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div
        style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ color: 'var(--color-ink-800)' }}>
            <ArrowLeftOutlined /> Back to home
          </Link>
          <Space>
            <Button onClick={() => nav('/login')}>Log in</Button>
            <Button type="primary" className="cta-glow" onClick={() => nav('/register')}>
              Register factory <ArrowRightOutlined />
            </Button>
          </Space>
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 40px' }}>
        <Tag className="chip chip--brand" style={{ marginBottom: 20 }}>Framework Reference</Tag>
        <h1 className="display-1">The SIRI Framework</h1>
        <Typography.Paragraph style={{ fontSize: 18, maxWidth: 720, marginTop: 16, color: 'var(--color-ink-500)' }}>
          The <strong>Smart Industry Readiness Index</strong> is the global Industry 4.0 framework adopted by Saudi Arabia
          under Vision 2030. It structures manufacturing transformation into <strong>3 building blocks</strong>,{' '}
          <strong>8 pillars</strong>, and <strong>16 measurable dimensions</strong>, each scored from 0 to 5.
        </Typography.Paragraph>
      </div>

      {/* Maturity Ladder */}
      <div style={{ background: '#f8fafc', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="eyebrow">Maturity Levels</div>
          <h2 className="display-2" style={{ marginTop: 10 }}>From Undefined to Intelligent</h2>
          <Typography.Paragraph style={{ fontSize: 16, color: 'var(--color-ink-500)', marginTop: 8, maxWidth: 720 }}>
            Every dimension is scored on the same 6-level maturity ladder. Hover or click a level to see what it means.
          </Typography.Paragraph>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginTop: 24 }}>
            {LEVELS.map((lv) => (
              <div
                key={lv.n}
                onMouseEnter={() => setSelectedLevel(lv.n)}
                onClick={() => setSelectedLevel(lv.n)}
                style={{
                  cursor: 'pointer',
                  padding: '16px 12px',
                  borderRadius: 12,
                  background: selectedLevel === lv.n ? lv.color : '#fff',
                  color: selectedLevel === lv.n ? '#fff' : 'var(--color-ink-800)',
                  border: `2px solid ${selectedLevel === lv.n ? lv.color : '#e5e7eb'}`,
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: 28, fontWeight: 800 }}>{lv.n}</div>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>
                  {lv.label}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 20,
              padding: '20px 24px',
              borderRadius: 12,
              background: '#fff',
              borderInlineStart: `6px solid ${LEVELS[selectedLevel].color}`,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Space size="small" style={{ marginBottom: 6 }}>
              <Tag color="green">Level {selectedLevel}</Tag>
              <Typography.Text strong>{LEVELS[selectedLevel].label}</Typography.Text>
              <Typography.Text type="secondary">· {LEVELS[selectedLevel].ar}</Typography.Text>
            </Space>
            <Typography.Paragraph style={{ margin: 0, fontSize: 15 }}>
              {LEVELS[selectedLevel].desc}
            </Typography.Paragraph>
          </div>
        </div>
      </div>

      {/* Building Blocks */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div className="eyebrow">The three building blocks</div>
        <h2 className="display-2" style={{ marginTop: 10 }}>3 building blocks, 8 pillars, 16 dimensions</h2>
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {BUILDING_BLOCKS.map((bb) => (
            <div
              key={bb.key}
              className="premium-card hover-lift"
              style={{ padding: 28, borderInlineStart: `8px solid ${bb.color}` }}
            >
              <Row gutter={[28, 20]}>
                <Col xs={24} md={6}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', color: bb.color, textTransform: 'uppercase' }}>
                    Building Block
                  </div>
                  <Typography.Title level={3} style={{ margin: '8px 0 6px' }}>{bb.title}</Typography.Title>
                  <Typography.Text type="secondary">{bb.titleAr}</Typography.Text>
                  <Typography.Paragraph style={{ fontSize: 14, marginTop: 12 }}>
                    {bb.description}
                  </Typography.Paragraph>
                </Col>
                <Col xs={24} md={18}>
                  <Row gutter={[12, 12]}>
                    {bb.pillars.map((p) => (
                      <Col xs={24} sm={12} key={p.key}>
                        <div
                          style={{
                            background: '#fafafa',
                            border: '1px solid #e5e7eb',
                            borderRadius: 12,
                            padding: 16,
                            height: '100%',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <span
                              style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: bb.color, display: 'inline-block',
                              }}
                            />
                            <Typography.Text strong>{p.title}</Typography.Text>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {p.dims.map((d) => (
                              <div
                                key={d}
                                style={{
                                  background: '#fff',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: 8,
                                  padding: '8px 12px',
                                  fontSize: 13,
                                }}
                              >
                                {d}
                              </div>
                            ))}
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Col>
              </Row>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ background: 'var(--gradient-hero-soft)', padding: '64px 24px', textAlign: 'center' }}>
        <h2 className="display-2">Ready to get your score?</h2>
        <Typography.Paragraph style={{ fontSize: 18, color: 'var(--color-ink-500)', maxWidth: 640, margin: '12px auto 24px' }}>
          Register your factory and complete your first SIRI self-assessment in under an hour.
        </Typography.Paragraph>
        <Space size="middle">
          <Button type="primary" size="large" className="cta-glow" onClick={() => nav('/register')}>
            Start free <ArrowRightOutlined />
          </Button>
          <Link to="/"><Button size="large">Back to home</Button></Link>
        </Space>
      </div>
    </div>
  );
}
