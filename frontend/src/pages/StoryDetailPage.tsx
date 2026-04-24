import { Button, Col, Row, Tag, Typography, Space, Spin } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, BankOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from 'react-i18next';

const STORY_NARRATIVE: Record<number, { chapters: { title: string; body: string }[]; initiatives: string[]; outcomes: { metric: string; value: string; delta: string }[] }> = {
  0: {
    chapters: [
      { title: 'The challenge', body: 'Operating 30+ production units across Saudi Arabia, the factory had pockets of automation but no unified data layer. OT/IT teams worked in silos, and leadership lacked a single view of operational performance.' },
      { title: 'The approach', body: 'A SIRI self-assessment exposed a 2.6-point connectivity gap. The team prioritized a unified namespace, backed by a SAR 120M SIDF-financed transformation program.' },
      { title: 'The result', body: 'Within 14 months, connectivity rose from Level 2 to Level 4, intelligence from Level 1 to Level 3, and predictive maintenance reduced unplanned downtime by 23%.' },
    ],
    initiatives: [
      'OT/IT convergence with unified namespace (MQTT/Sparkplug)',
      'Industrial Wi-Fi 6 + private-5G-ready LAN',
      'Time-series data lake with Power BI + Grafana dashboards',
      'AI predictive maintenance pilot on top 5 critical assets',
      'Cross-functional digital squad (8 members) reporting to CDO',
    ],
    outcomes: [
      { metric: 'Overall SIRI', value: '4.11', delta: '+1.8' },
      { metric: 'Unplanned downtime', value: '−23%', delta: 'vs. baseline' },
      { metric: 'Energy use', value: '−11%', delta: 'vs. baseline' },
      { metric: 'SIDF financing', value: 'SAR 120M', delta: 'deployed' },
    ],
  },
  1: {
    chapters: [
      { title: 'The challenge', body: 'Core production ran on a fragmented mix of legacy MES and spreadsheets. Schedulers couldn\'t see live line status, and changeovers frequently exceeded two hours.' },
      { title: 'The approach', body: 'SIRI gap analysis flagged Operations Execution and Supply Chain Visibility as critical. The team invested in SAP S/4HANA + APS and an EDI supplier portal.' },
      { title: 'The result', body: 'Changeover time halved, supply-chain visibility climbed from Level 1 to Level 4, and the factory qualified for accelerated SIDF financing.' },
    ],
    initiatives: [
      'SAP S/4HANA + Advanced Planning & Scheduling',
      'EDI supplier portal covering top 80% spend',
      'Real-time track-and-trace across inbound, WIP, outbound',
      'RPA for invoice matching + PO approvals',
      'SPC on top 3 production lines with automated defect capture',
    ],
    outcomes: [
      { metric: 'Overall SIRI', value: '4.06', delta: '+1.5' },
      { metric: 'Changeover time', value: '−52%', delta: 'vs. baseline' },
      { metric: 'On-time delivery', value: '+14pp', delta: 'vs. baseline' },
      { metric: 'SIDF financing', value: 'SAR 90M', delta: 'approved' },
    ],
  },
  2: {
    chapters: [
      { title: 'The challenge', body: 'Three plants, three systems, zero unified analytics. Quality data took days to aggregate across sites, and leadership couldn\'t run like-for-like comparisons.' },
      { title: 'The approach', body: 'VeeSIRI helped scope a cross-facility data lake, eligible for SIDF co-financing. The roadmap sequenced connectivity upgrades before analytics.' },
      { title: 'The result', body: 'A single source of truth across plants, enabling real-time quality benchmarking and a 19% reduction in cost-of-poor-quality.' },
    ],
    initiatives: [
      'Factory data lake + BI dashboards',
      'Connectivity upgrade across three plants',
      'CAD/PLM integration',
      'SIRI Foundation training for all managers',
      'Quarterly cross-plant digital steering committee',
    ],
    outcomes: [
      { metric: 'Overall SIRI', value: '4.06', delta: '+1.4' },
      { metric: 'Cost of poor quality', value: '−19%', delta: 'vs. baseline' },
      { metric: 'Time to insight', value: 'minutes', delta: 'from days' },
      { metric: 'SIDF financing', value: 'SAR 75M', delta: 'co-financed' },
    ],
  },
};

export default function StoryDetailPage() {
  const { factoryId } = useParams();
  const nav = useNavigate();
  const { i18n } = useTranslation();

  const { data } = useQuery<any>({
    queryKey: ['public-stats'],
    queryFn: async () => (await axios.get('/api/v1/public/stats')).data,
  });

  const idx = (data?.featured ?? []).findIndex((f: any) => f.id === factoryId);
  const factory = data?.featured?.[idx];
  const story = STORY_NARRATIVE[idx];

  if (!data) return <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}><Spin /></div>;
  if (!factory || !story) {
    return (
      <div style={{ padding: 40 }}>
        <Link to="/stories"><ArrowLeftOutlined /> Back to stories</Link>
        <p style={{ marginTop: 20 }}>Story not found.</p>
      </div>
    );
  }

  const accent = idx === 0 ? '#006C35' : idx === 1 ? '#0ea5e9' : '#8b5cf6';

  // Before/after chart
  const before = Math.max(1, factory.score - 1.6);
  const chartOption = {
    grid: { left: 30, right: 20, top: 20, bottom: 30 },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    xAxis: {
      type: 'category',
      data: ['Before', 'Phase 1', 'Phase 2', 'Phase 3 (Today)'],
    },
    yAxis: { type: 'value', max: 5 },
    series: [
      {
        name: 'SIRI Score',
        type: 'line', smooth: true,
        data: [before, before + 0.6, before + 1.2, factory.score],
        itemStyle: { color: accent },
        lineStyle: { color: accent, width: 3 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: accent + '40' }, { offset: 1, color: accent + '05' }],
          },
        },
      },
      {
        name: 'Industry median',
        type: 'line', smooth: true,
        data: [2.2, 2.3, 2.4, 2.5],
        itemStyle: { color: '#94a3b8' },
        lineStyle: { color: '#94a3b8', type: 'dashed' },
      },
    ],
  };

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/stories" style={{ color: 'var(--color-ink-800)' }}>
            <ArrowLeftOutlined /> All stories
          </Link>
          <Button type="primary" onClick={() => nav('/register')}>
            Start your story <ArrowRightOutlined />
          </Button>
        </div>
      </div>

      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(135deg, ${accent}18 0%, ${accent}04 100%)`,
          borderBottom: `3px solid ${accent}`,
          padding: '64px 24px',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Tag style={{ background: accent, color: '#fff', border: 'none', marginBottom: 16, padding: '4px 10px' }}>
            {factory.industryGroup.replace(/_/g, ' ')}
          </Tag>
          <h1 className="display-1" style={{ marginTop: 10 }}>
            {i18n.language === 'ar' ? factory.nameAr : factory.nameEn}
          </h1>
          <Typography.Text type="secondary" style={{ fontSize: 16 }}>
            {factory.region} · {factory.city}
          </Typography.Text>

          <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
            {story.outcomes.map((o) => (
              <Col xs={12} md={6} key={o.metric}>
                <div style={{ padding: 18, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 11, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                    {o.metric}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: accent, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
                    {o.value}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{o.delta}</div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '56px 24px' }}>
        {/* Chart */}
        <div style={{ marginBottom: 48 }}>
          <div className="eyebrow">Transformation curve</div>
          <h2 className="display-2" style={{ marginTop: 8 }}>Before → After</h2>
          <div className="premium-card" style={{ padding: 20, marginTop: 16 }}>
            <ReactECharts option={chartOption} style={{ height: 320 }} />
          </div>
        </div>

        {story.chapters.map((c, i) => (
          <div key={i} style={{ marginBottom: 40 }}>
            <div className="eyebrow">Chapter {i + 1}</div>
            <h2 className="display-2" style={{ marginTop: 8 }}>{c.title}</h2>
            <Typography.Paragraph style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--color-ink-700)', marginTop: 12 }}>
              {c.body}
            </Typography.Paragraph>
          </div>
        ))}

        <div style={{ marginTop: 40 }}>
          <div className="eyebrow">Initiatives deployed</div>
          <h2 className="display-2" style={{ marginTop: 8 }}>What they actually did</h2>
          <ul style={{ marginTop: 16, padding: 0, listStyle: 'none' }}>
            {story.initiatives.map((s) => (
              <li key={s} style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <CheckCircleFilled style={{ color: accent, fontSize: 18, marginTop: 2 }} />
                <span style={{ fontSize: 16 }}>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {factory.sidfFinanced && (
          <div
            style={{
              marginTop: 40, padding: '24px 28px',
              background: 'linear-gradient(135deg, #8b5cf615 0%, #8b5cf605 100%)',
              border: '1px solid #8b5cf640',
              borderRadius: 14,
              display: 'flex', alignItems: 'center', gap: 16,
            }}
          >
            <BankOutlined style={{ fontSize: 32, color: '#8b5cf6' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Funded by SIDF</div>
              <div style={{ color: '#64748b' }}>
                SAR {(factory.sidfAmountSar / 1_000_000).toFixed(0)}M co-financed through the Saudi Industrial Development Fund's SIRI-aligned program.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ background: 'var(--gradient-hero-soft)', padding: '64px 24px', textAlign: 'center' }}>
        <h2 className="display-2">Ready to write your own story?</h2>
        <Typography.Paragraph style={{ fontSize: 17, color: 'var(--color-ink-500)', maxWidth: 640, margin: '12px auto 24px' }}>
          Register your factory and take your first SIRI assessment — free.
        </Typography.Paragraph>
        <Space size="middle">
          <Button type="primary" size="large" className="cta-glow" onClick={() => nav('/register')}>
            Start free <ArrowRightOutlined />
          </Button>
          <Link to="/stories"><Button size="large">Read other stories</Button></Link>
        </Space>
      </div>
    </div>
  );
}
