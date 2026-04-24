import { Card, Row, Col, Typography, Tag, Space, Button } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function SuccessStoriesPage() {
  const nav = useNavigate();
  const { i18n } = useTranslation();

  const { data } = useQuery<any>({
    queryKey: ['public-stats'],
    queryFn: async () => (await axios.get('/api/v1/public/stats')).data,
  });

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ color: 'var(--color-ink-800)' }}><ArrowLeftOutlined /> Back to home</Link>
          <Space>
            <Button onClick={() => nav('/login')}>Log in</Button>
            <Button type="primary" className="cta-glow" onClick={() => nav('/register')}>
              Register <ArrowRightOutlined />
            </Button>
          </Space>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 40px' }}>
        <Tag className="chip chip--brand" style={{ marginBottom: 16 }}>Case studies</Tag>
        <h1 className="display-1">Saudi manufacturers leading on SIRI</h1>
        <Typography.Paragraph style={{ fontSize: 17, color: 'var(--color-ink-500)', maxWidth: 720, marginTop: 12 }}>
          How three factories used VeeSIRI to assess, plan, and transform — with measurable impact on their SIRI readiness and SIDF-backed investment.
        </Typography.Paragraph>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 64px' }}>
        <Row gutter={[24, 24]}>
          {(data?.featured ?? []).map((f: any, i: number) => (
            <Col xs={24} md={8} key={f.id}>
              <div className="premium-card hover-lift" style={{ padding: 0, overflow: 'hidden', height: '100%' }}>
                <div
                  style={{
                    background: i === 0 ? 'linear-gradient(135deg, #006C35 0%, #004a24 100%)'
                      : i === 1 ? 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)'
                      : 'linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%)',
                    padding: 32, color: '#fff', height: 180,
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: 13, opacity: 0.85, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {f.industryGroup.replace(/_/g, ' ')}
                  </div>
                  <div>
                    <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1 }}>
                      {f.score.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>SIRI Level achieved</div>
                  </div>
                </div>
                <div style={{ padding: 22 }}>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {i18n.language === 'ar' ? f.nameAr : f.nameEn}
                  </Typography.Title>
                  <Typography.Text type="secondary">{f.region} · {f.city}</Typography.Text>
                  <div style={{ marginTop: 12 }}>
                    {f.sidfFinanced ? (
                      <Tag color="purple" style={{ padding: '4px 10px' }}>
                        SIDF-financed · SAR {(f.sidfAmountSar / 1_000_000).toFixed(0)}M
                      </Tag>
                    ) : (
                      <Tag>Independent transformation</Tag>
                    )}
                  </div>
                  <Typography.Paragraph style={{ marginTop: 12, color: 'var(--color-ink-500)' }}>
                    {i === 0 && 'Led their sector in OT/IT convergence, connecting every asset to a unified namespace and unlocking AI-driven predictive maintenance.'}
                    {i === 1 && 'Deployed MES + APS across five lines, cutting changeover time and lifting supply-chain visibility from Level 1 to Level 4.'}
                    {i === 2 && 'Used their SIDF package to fund a cross-factory data lake, enabling real-time analytics across all production facilities.'}
                  </Typography.Paragraph>
                  <Link to={`/stories/${f.id}`}>
                    <Button type="primary" block>
                      Read the story <ArrowRightOutlined />
                    </Button>
                  </Link>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <div style={{ background: 'var(--gradient-hero-soft)', padding: '64px 24px', textAlign: 'center' }}>
        <h2 className="display-2">Be the next story</h2>
        <Typography.Paragraph style={{ fontSize: 17, color: 'var(--color-ink-500)', maxWidth: 640, margin: '12px auto 24px' }}>
          Register your factory, finish your first SIRI assessment in under an hour, and start your transformation roadmap.
        </Typography.Paragraph>
        <Button type="primary" size="large" className="cta-glow" onClick={() => nav('/register')}>
          Get started free <ArrowRightOutlined />
        </Button>
      </div>
    </div>
  );
}
