import { useState } from 'react';
import { Button, Card, Col, Row, Typography, Space, Tag, Progress, Drawer, Grid } from 'antd';
import {
  ArrowRightOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  LineChartOutlined,
  BankOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  NodeIndexOutlined,
  FileSearchOutlined,
  CheckCircleFilled,
  MenuOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import CountUp from '../components/CountUp';
import SaudiMap from '../components/SaudiMap';
import AnnouncementBar from '../components/AnnouncementBar';

const { useBreakpoint } = Grid;

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: stats } = useQuery<any>({
    queryKey: ['public-stats'],
    queryFn: async () => (await axios.get('/api/v1/public/stats')).data,
  });
  const { data: mapData } = useQuery<any[]>({
    queryKey: ['public-map'],
    queryFn: async () => (await axios.get('/api/v1/public/map')).data,
  });

  return (
    <div style={{ background: '#fff' }}>
      <AnnouncementBar variant="public" />
      {/* ====== NAV ====== */}
      <div
        style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Space style={{ flexShrink: 0 }}>
            <div
              style={{
                width: 34, height: 34, background: 'var(--color-primary)', borderRadius: 8,
                color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 16,
              }}
            >V</div>
            <Typography.Title level={4} className="veesiri-brand" style={{ margin: 0 }}>
              {t('brand')}
            </Typography.Title>
          </Space>
          {isMobile ? (
            <Space>
              <Button type="primary" size="small" onClick={() => nav('/register')}>
                {t('auth.register')}
              </Button>
              <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />
            </Space>
          ) : (
            <Space size="middle" wrap>
              <Link to="/siri" style={{ color: '#1a2f4e' }}>SIRI Framework</Link>
              <a href="#features" style={{ color: '#1a2f4e' }}>Features</a>
              <a href="#government" style={{ color: '#1a2f4e' }}>Government</a>
              <Link to="/stories" style={{ color: '#1a2f4e' }}>Stories</Link>
              <a href="#pricing" style={{ color: '#1a2f4e' }}>Pricing</a>
              <Link to="/api-docs" style={{ color: '#1a2f4e' }}>API</Link>
              <Button
                icon={<GlobalOutlined />}
                onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
              >
                {t('common.language')}
              </Button>
              <Button onClick={() => nav('/login')}>{t('auth.login')}</Button>
              <Button type="primary" className="cta-glow" onClick={() => nav('/register')}>
                {t('auth.register')} <ArrowRightOutlined />
              </Button>
            </Space>
          )}
        </div>
      </div>

      <Drawer
        placement={i18n.language === 'ar' ? 'right' : 'left'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={280}
        title={t('brand')}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Link to="/siri" onClick={() => setDrawerOpen(false)} style={{ color: '#0b1220', fontSize: 16 }}>SIRI Framework</Link>
          <a href="#features" onClick={() => setDrawerOpen(false)} style={{ color: '#0b1220', fontSize: 16 }}>Features</a>
          <a href="#government" onClick={() => setDrawerOpen(false)} style={{ color: '#0b1220', fontSize: 16 }}>Government</a>
          <a href="#pricing" onClick={() => setDrawerOpen(false)} style={{ color: '#0b1220', fontSize: 16 }}>Pricing</a>
          <Link to="/api-docs" onClick={() => setDrawerOpen(false)} style={{ color: '#0b1220', fontSize: 16 }}>API Docs</Link>
          <Button
            block
            icon={<GlobalOutlined />}
            onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
          >
            {t('common.language')}
          </Button>
          <Button block onClick={() => { nav('/login'); setDrawerOpen(false); }}>
            {t('auth.login')}
          </Button>
          <Button block type="primary" onClick={() => { nav('/register'); setDrawerOpen(false); }}>
            {t('auth.register')}
          </Button>
          <Button block icon={<BankOutlined />} onClick={() => { nav('/gov/login'); setDrawerOpen(false); }}>
            {t('nav.govPortal')}
          </Button>
        </Space>
      </Drawer>

      {/* ====== HERO ====== */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 40px' }}>
        <div className="veesiri-hero reveal">
          <Row gutter={[48, 32]} align="middle">
            <Col xs={24} md={14}>
              <Tag className="chip chip--gold" style={{ border: 'none', marginBottom: 20, padding: '6px 12px' }}>
                <span className="live-dot" /> Vision 2030 · Factories of the Future
              </Tag>
              <h1 className="display-1" style={{ color: '#fff', marginBottom: 16 }}>
                {i18n.language === 'ar' ? (
                  <>اصعد مستويات جاهزية<br /><span style={{ color: '#FDE68A' }}>الصناعة الذكية</span></>
                ) : (
                  <>Unlock your factory's<br /><span style={{ color: '#FDE68A' }}>Smart Industry future</span></>
                )}
              </h1>
              <Typography.Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, lineHeight: 1.6, maxWidth: 560 }}>
                {i18n.language === 'ar'
                  ? 'منصة VeeSIRI تقيّم مصنعك على 16 بُعدًا من إطار SIRI العالمي، وتولّد خارطة طريق تحوّل رقمية، وتُعدّك لتمويل الصندوق الصناعي — كل ذلك بالعربية والإنجليزية.'
                  : 'VeeSIRI scores your factory across all 16 SIRI dimensions, generates a digital transformation roadmap, and prepares you for SIDF financing — all bilingual (Arabic/English).'}
              </Typography.Paragraph>
              <Space size="middle" wrap style={{ marginTop: 24 }}>
                <Button
                  type="primary"
                  size="large"
                  className="cta-glow"
                  style={{ background: '#fff', color: 'var(--color-primary)', fontWeight: 700, height: 48, padding: '0 28px' }}
                  onClick={() => nav('/register')}
                >
                  {t('onboarding.submit')} <ArrowRightOutlined />
                </Button>
                <Button
                  size="large"
                  ghost
                  style={{ height: 48, borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
                  onClick={() => nav('/gov/login')}
                >
                  <BankOutlined /> {t('nav.govPortal')}
                </Button>
              </Space>
              <Space size="large" style={{ marginTop: 32, color: 'rgba(255,255,255,0.85)', fontSize: 13, flexWrap: 'wrap' }}>
                <span><CheckCircleFilled style={{ color: '#86efac' }} /> PDPL compliant</span>
                <span><CheckCircleFilled style={{ color: '#86efac' }} /> MIMR aligned</span>
                <span><CheckCircleFilled style={{ color: '#86efac' }} /> SIDF ready</span>
                <span><CheckCircleFilled style={{ color: '#86efac' }} /> Bilingual AR/EN</span>
              </Space>
            </Col>
            <Col xs={24} md={10}>
              <div className="glass reveal reveal-delay-2" style={{ borderRadius: 20, padding: 24 }}>
                <Typography.Text style={{ color: 'var(--color-ink-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 11 }}>
                  Live National Snapshot
                </Typography.Text>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
                  <Stat label="Factories" value={stats?.totalRegistered ?? 0} />
                  <Stat label="Assessed" value={stats?.totalAssessed ?? 0} />
                  <Stat label="National SIRI" value={stats?.averageNationalSiriScore ?? 0} decimals={2} />
                  <Stat label="Certificates" value={stats?.certificatesIssued ?? 0} />
                  <Stat label="SIDF-financed" value={stats?.factoriesSidfFinanced ?? 0} />
                  <Stat
                    label="SIDF (SAR M)"
                    value={(stats?.totalSidfFinancingSar ?? 0) / 1_000_000}
                    decimals={1}
                    prefix=""
                  />
                </div>
                <Progress
                  percent={stats?.vision2030ProgressPct ?? 0}
                  strokeColor="var(--color-accent)"
                  showInfo
                  style={{ marginTop: 16 }}
                  format={(p) => `${p?.toFixed(2)}% to 4,000 factories`}
                />
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                  <span className="live-dot" /> Real-time from factories registered on VeeSIRI
                </Typography.Text>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* ====== TRUSTED-BY RIBBON ====== */}
      <div style={{ background: '#fafafa', padding: '24px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
        <div className="marquee" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="marquee-track">
            {['MIMR', 'SIDF', 'SASO', 'Vision 2030', 'Absher', 'SAP', 'Oracle', 'ZATCA',
              'MIMR', 'SIDF', 'SASO', 'Vision 2030', 'Absher', 'SAP', 'Oracle', 'ZATCA'].map((x, i) => (
              <span key={i} style={{ color: '#94a3b8', fontWeight: 700, fontSize: 14, letterSpacing: '0.1em' }}>
                {x}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ====== LIVE MAP SECTION ====== */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <Row gutter={[40, 32]} align="middle">
          <Col xs={24} md={10}>
            <div className="eyebrow">Real-time intelligence</div>
            <h2 className="display-2" style={{ marginTop: 10 }}>
              {i18n.language === 'ar'
                ? 'منظومة صناعية وطنية موحدة'
                : 'One unified national industrial graph'}
            </h2>
            <Typography.Paragraph style={{ fontSize: 16, color: 'var(--color-ink-500)', marginTop: 12 }}>
              {i18n.language === 'ar'
                ? 'كل مصنع مسجّل، كل تقييم SIRI، كل شهادة، وكل مبادرة تحوّل — تتدفق مباشرةً إلى بوابة MIMR وSIDF الحكومية.'
                : 'Every registered factory, SIRI assessment, certificate, and transformation initiative — streaming live into the MIMR & SIDF government portal.'}
            </Typography.Paragraph>
            <Space direction="vertical" size="small" style={{ marginTop: 20 }}>
              <FeatureBullet icon={<RocketOutlined />} text="16 SIRI dimensions auto-scored" />
              <FeatureBullet icon={<NodeIndexOutlined />} text="Transformation roadmap with Gantt timeline" />
              <FeatureBullet icon={<BulbOutlined />} text="AI recommendations per gap" />
              <FeatureBullet icon={<SafetyCertificateOutlined />} text="QR-verifiable SIRI certificates" />
              <FeatureBullet icon={<BankOutlined />} text="SIDF financing eligibility pre-check" />
            </Space>
          </Col>
          <Col xs={24} md={14}>
            <SaudiMap factories={mapData ?? []} height={520} anonymize />
          </Col>
        </Row>
      </div>

      {/* ====== FEATURES ====== */}
      <div id="features" style={{ background: '#f8fafc', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="eyebrow">Factory Portal</div>
            <h2 className="display-2" style={{ marginTop: 10 }}>
              {i18n.language === 'ar' ? 'كل ما يحتاجه المصنع للتحول الرقمي' : 'Everything your factory needs to transform'}
            </h2>
          </div>
          <Row gutter={[24, 24]}>
            <FeatureCard icon={<LineChartOutlined />} title="SIRI Assessment"
              body="Score your factory across all 16 SIRI dimensions with guided industry-specific prompts and evidence uploads." />
            <FeatureCard icon={<FileSearchOutlined />} title="Gap Analysis"
              body="Prioritized matrix of gaps with severity, effort, cost, ROI, and quick-win flags — instantly on submit." />
            <FeatureCard icon={<NodeIndexOutlined />} title="Transformation Roadmap"
              body="Gantt timeline with phased initiatives, milestones, budget, and progress tracking across Foundation → Acceleration → Optimization." />
            <FeatureCard icon={<BulbOutlined />} title="AI Recommendations"
              body="Per-dimension recommended actions, technologies, and vendors with impact, cost, and confidence scoring." />
            <FeatureCard icon={<SafetyCertificateOutlined />} title="SIRI Certificate"
              body="Digitally signed, QR-verifiable certificate on a public URL anyone can check — proof of your maturity level." />
            <FeatureCard icon={<BankOutlined />} title="SIDF-Ready"
              body="One-click package builder combining your score, gap analysis, and roadmap for SIDF financing submission." />
          </Row>
        </div>
      </div>

      {/* ====== SIRI FRAMEWORK PREVIEW ====== */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <Row gutter={[40, 32]} align="middle">
          <Col xs={24} md={10}>
            <div className="eyebrow">The SIRI Framework</div>
            <h2 className="display-2" style={{ marginTop: 10 }}>
              3 Building Blocks · 8 Pillars · 16 Dimensions
            </h2>
            <Typography.Paragraph style={{ fontSize: 16, color: 'var(--color-ink-500)', marginTop: 12 }}>
              The Smart Industry Readiness Index is the global Industry 4.0 framework adopted by Saudi Arabia under Vision 2030. Each dimension is scored 0–5, from <em>Undefined</em> to <em>Intelligent</em>.
            </Typography.Paragraph>
            <Link to="/siri">
              <Button type="primary" ghost size="large">
                Explore the framework <ArrowRightOutlined />
              </Button>
            </Link>
          </Col>
          <Col xs={24} md={14}>
            <Row gutter={[12, 12]}>
              {[
                { block: 'Process', color: '#006C35', items: ['Operations', 'Supply Chain', 'Product Lifecycle'] },
                { block: 'Technology', color: '#0ea5e9', items: ['Automation', 'Connectivity', 'Intelligence'] },
                { block: 'Organization', color: '#8b5cf6', items: ['Talent Readiness', 'Structure & Management'] },
              ].map((b) => (
                <Col xs={24} key={b.block}>
                  <div className="premium-card hover-lift" style={{ padding: 20, borderInlineStart: `6px solid ${b.color}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: b.color, letterSpacing: '0.1em' }}>
                      {b.block.toUpperCase()}
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {b.items.map((p) => (
                        <span key={p} className="chip">{p}</span>
                      ))}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </div>

      {/* ====== CASE STUDIES ====== */}
      <div style={{ background: '#f8fafc', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="eyebrow">Case Studies</div>
            <h2 className="display-2" style={{ marginTop: 10 }}>
              {i18n.language === 'ar' ? 'مصانع رائدة على المنصة' : 'Leading factories on VeeSIRI'}
            </h2>
          </div>
          <Row gutter={[24, 24]}>
            {(stats?.featured ?? []).map((f: any) => (
              <Col xs={24} md={8} key={f.id}>
                <div className="premium-card hover-lift" style={{ padding: 24, height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--color-ink-500)', fontWeight: 600, letterSpacing: '0.08em' }}>
                        {f.industryGroup.replace('_', ' ')}
                      </div>
                      <Typography.Title level={4} style={{ margin: '6px 0 0' }}>
                        {i18n.language === 'ar' ? f.nameAr : f.nameEn}
                      </Typography.Title>
                      <Typography.Text type="secondary">{f.region} · {f.city}</Typography.Text>
                    </div>
                    <span
                      className="score-badge"
                      style={{
                        background: f.score >= 4 ? '#059669' : f.score >= 3 ? '#84cc16' : '#eab308',
                        fontSize: 16, minWidth: 60,
                      }}
                    >
                      {f.score.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                    {f.sidfFinanced ? (
                      <Tag color="purple">
                        SIDF financed · SAR {(f.sidfAmountSar / 1_000_000).toFixed(0)}M
                      </Tag>
                    ) : (
                      <Tag>Independent transformation</Tag>
                    )}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* ====== GOVERNMENT ====== */}
      <div id="government" style={{ background: 'var(--gradient-gov)', color: '#e2e8f0', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[40, 32]} align="middle">
            <Col xs={24} md={12}>
              <div className="eyebrow" style={{ color: 'var(--color-accent)' }}>Government Portal</div>
              <h2 className="display-2" style={{ color: '#fff', marginTop: 10 }}>
                A national command center for MIMR, SIDF & regional authorities
              </h2>
              <Typography.Paragraph style={{ color: '#cbd5e1', fontSize: 16, marginTop: 12 }}>
                Real-time heatmap of all factories. Vision 2030 target tracker. Sector × dimension intelligence. Live activity feed. Ministerial-grade reports in formal Arabic.
              </Typography.Paragraph>
              <Space wrap size="middle" style={{ marginTop: 24 }}>
                <Button type="primary" size="large" className="cta-glow" onClick={() => nav('/gov/login')}>
                  Enter Government Portal <ArrowRightOutlined />
                </Button>
                <Button
                  size="large"
                  ghost
                  style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
                  onClick={() => nav('/siri')}
                >
                  See the framework
                </Button>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                      <CountUp value={stats?.averageNationalSiriScore ?? 0} decimals={2} />
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      National SIRI
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                      <CountUp value={stats?.totalAssessed ?? 0} />
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Assessed factories
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                      SAR <CountUp value={(stats?.totalSidfFinancingSar ?? 0) / 1_000_000} decimals={0} />M
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      SIDF financing deployed
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                      <CountUp value={stats?.certificatesIssued ?? 0} />
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Certificates issued
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* ====== PRICING ====== */}
      <div id="pricing" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="eyebrow">Pricing</div>
          <h2 className="display-2" style={{ marginTop: 10 }}>
            Start free. Scale with your factory.
          </h2>
        </div>
        <Row gutter={[24, 24]}>
          {[
            { tier: 'Basic', price: 'SAR 0', cta: 'Start free', features: ['1 factory', '1 SIRI self-assessment / year', '5 GB documents', 'Email support'] },
            { tier: 'Professional', price: 'SAR 4,900', period: '/ month', featured: true, cta: 'Start 14-day trial',
              features: ['Up to 3 factories', 'Unlimited assessments', 'AI recommendations', 'Full roadmap & Gantt', '25 GB documents', 'SIDF package builder', 'Priority support'] },
            { tier: 'Enterprise', price: 'Contact sales', cta: 'Talk to us',
              features: ['Unlimited factories', 'Assessor-verified assessments', 'Custom branding on certificates', 'ERP integrations (SAP/Oracle/Dynamics)', 'Dedicated CSM', 'Data residency'] },
          ].map((p) => (
            <Col xs={24} md={8} key={p.tier}>
              <div
                className={'premium-card ' + (p.featured ? 'cta-glow' : '')}
                style={{
                  padding: 28,
                  height: '100%',
                  border: p.featured ? '2px solid var(--color-primary)' : undefined,
                  position: 'relative',
                }}
              >
                {p.featured && (
                  <Tag color="green" style={{ position: 'absolute', top: 16, insetInlineEnd: 16 }}>
                    Most popular
                  </Tag>
                )}
                <Typography.Title level={3} style={{ margin: 0 }}>{p.tier}</Typography.Title>
                <div style={{ margin: '16px 0' }}>
                  <span style={{ fontSize: 30, fontWeight: 800 }}>{p.price}</span>
                  {p.period && <span style={{ color: 'var(--color-ink-500)' }}> {p.period}</span>}
                </div>
                <Button type={p.featured ? 'primary' : 'default'} block size="large" onClick={() => nav('/register')}>
                  {p.cta}
                </Button>
                <ul style={{ margin: '20px 0 0', padding: 0, listStyle: 'none' }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: 'flex', gap: 10, padding: '8px 0', alignItems: 'flex-start' }}>
                      <CheckCircleFilled style={{ color: 'var(--color-primary)', marginTop: 3 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* ====== CTA ====== */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div
          style={{
            background: 'var(--gradient-hero)',
            color: '#fff',
            borderRadius: 24,
            padding: '60px 48px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <h2 className="display-2" style={{ color: '#fff' }}>
            Ready to lead your sector?
          </h2>
          <Typography.Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, maxWidth: 680, margin: '12px auto 0' }}>
            Register your factory, complete your first SIRI self-assessment in 45 minutes, and receive your prioritized roadmap — free.
          </Typography.Paragraph>
          <Space size="middle" style={{ marginTop: 24 }}>
            <Button
              type="primary"
              size="large"
              className="cta-glow"
              style={{ background: '#fff', color: 'var(--color-primary)', fontWeight: 700, height: 48, padding: '0 28px' }}
              onClick={() => nav('/register')}
            >
              Get started free <ArrowRightOutlined />
            </Button>
            <Button
              size="large"
              ghost
              style={{ height: 48, borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
              onClick={() => nav('/login')}
            >
              {t('auth.login')}
            </Button>
          </Space>
        </div>
      </div>

      {/* ====== FOOTER ====== */}
      <div style={{ background: '#0b1220', color: '#94a3b8', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Space>
            <div
              style={{
                width: 28, height: 28, background: 'var(--color-primary)', borderRadius: 6,
                color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800,
              }}
            >V</div>
            <span style={{ color: '#fff', fontWeight: 700 }}>VeeSIRI</span>
            <span>·</span>
            <span>© Veebase LLC</span>
          </Space>
          <Space size="large" style={{ flexWrap: 'wrap' }}>
            <Link to="/siri" style={{ color: '#94a3b8' }}>SIRI Framework</Link>
            <a href="#features" style={{ color: '#94a3b8' }}>Features</a>
            <Link to="/stories" style={{ color: '#94a3b8' }}>Success stories</Link>
            <a href="#pricing" style={{ color: '#94a3b8' }}>Pricing</a>
            <Link to="/api-docs" style={{ color: '#94a3b8' }}>API</Link>
            <Link to="/gov/login" style={{ color: '#94a3b8' }}>Government portal</Link>
          </Space>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, decimals = 0, prefix = '' }: { label: string; value: number; decimals?: number; prefix?: string }) {
  return (
    <div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-ink-900)' }}>
        <CountUp value={value} decimals={decimals} prefix={prefix} />
      </div>
      <div style={{ color: 'var(--color-ink-500)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  );
}

function FeatureBullet({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div
        style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'var(--color-primary-50)',
          color: 'var(--color-primary)',
          display: 'grid', placeItems: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ marginTop: 4 }}>{text}</div>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <Col xs={24} sm={12} md={8}>
      <div className="feature-card">
        <div className="feature-icon">{icon}</div>
        <Typography.Title level={4} style={{ margin: 0 }}>{title}</Typography.Title>
        <Typography.Paragraph style={{ margin: '8px 0 0', color: 'var(--color-ink-500)' }}>
          {body}
        </Typography.Paragraph>
      </div>
    </Col>
  );
}
