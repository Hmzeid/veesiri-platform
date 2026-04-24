import { Card, Col, Row, Typography, Space, Progress, Tag, Spin, List } from 'antd';
import {
  BankOutlined,
  SafetyCertificateOutlined,
  AlertOutlined,
  CheckCircleFilled,
  FileDoneOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { api } from '../../api/client';
import CountUp from '../../components/CountUp';
import SaudiMap, { MapFactory } from '../../components/SaudiMap';
import ScoreRing from '../../components/ScoreRing';

type Summary = {
  totalRegistered: number;
  totalAssessed: number;
  averageNationalSiriScore: number;
  factoriesAtTarget: number;
  factoriesSidfFinanced: number;
  totalSidfFinancingSar: number;
  vision2030TargetFactories: number;
  vision2030ProgressPct: number;
};

type RegionRow = { name: string; totalFactories: number; avgScore: number; sidfFinanced: number };
type SectorRow = { industry: string; totalFactories: number; avgScore: number; sidfFinanced: number };
type ScoreBand = { band: string; count: number; min: number; max: number };
type ActivityEvent = {
  type: 'certificate_issued' | 'assessment_submitted' | 'alert_raised';
  at: string;
  factory: { nameAr: string; nameEn: string; region: string; industryGroup: string };
  data: any;
};
type TrendPoint = { label: string; avgScore: number; count: number };
type HeatPoint = { industry: string; dimension: string; score: number; sample: number };

const scoreColor = (v: number | null | undefined) => {
  if (v === null || v === undefined) return '#64748b';
  if (v < 1) return '#dc2626';
  if (v < 2) return '#f97316';
  if (v < 3) return '#eab308';
  if (v < 4) return '#84cc16';
  return '#059669';
};

export default function GovDashboardPage() {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();

  const { data: summary } = useQuery<Summary>({
    queryKey: ['gov-summary'],
    queryFn: async () => (await api.get('/gov/dashboard/summary')).data,
  });
  const { data: mapData } = useQuery<MapFactory[]>({
    queryKey: ['gov-map'],
    queryFn: async () => (await api.get('/gov/dashboard/map')).data,
  });
  const { data: regions } = useQuery<RegionRow[]>({
    queryKey: ['gov-regions'],
    queryFn: async () => (await api.get('/gov/dashboard/regions')).data,
  });
  const { data: sectors } = useQuery<SectorRow[]>({
    queryKey: ['gov-sectors'],
    queryFn: async () => (await api.get('/gov/dashboard/sectors')).data,
  });
  const { data: distribution } = useQuery<ScoreBand[]>({
    queryKey: ['gov-dist'],
    queryFn: async () => (await api.get('/gov/dashboard/score-distribution')).data,
  });
  const { data: trends } = useQuery<TrendPoint[]>({
    queryKey: ['gov-trends'],
    queryFn: async () => (await api.get('/gov/dashboard/trends')).data,
  });
  const { data: activity } = useQuery<ActivityEvent[]>({
    queryKey: ['gov-activity'],
    queryFn: async () => (await api.get('/gov/dashboard/activity')).data,
    refetchInterval: 30_000,
  });
  const { data: heatmap } = useQuery<HeatPoint[]>({
    queryKey: ['gov-heatmap'],
    queryFn: async () => (await api.get('/gov/dashboard/heatmap')).data,
  });
  const { data: leaderboard } = useQuery<any[]>({
    queryKey: ['gov-leaderboard'],
    queryFn: async () => (await api.get('/gov/dashboard/leaderboard')).data,
  });

  if (!summary) return <div style={{ display: 'grid', placeItems: 'center', height: 400 }}><Spin /></div>;

  // Build region score map for the map heatshade
  const regionScores = Object.fromEntries((regions ?? []).map((r) => [r.name, r.avgScore]));

  // Trends line chart
  const trendOption = trends && {
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    tooltip: { trigger: 'axis', backgroundColor: '#1a2f4e', borderColor: '#1a2f4e', textStyle: { color: '#fff' } },
    xAxis: {
      type: 'category',
      data: trends.map((p) => p.label),
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: '#94a3b8' },
    },
    yAxis: {
      type: 'value',
      max: 5,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
    },
    series: [{
      type: 'line',
      data: trends.map((p) => p.avgScore),
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      itemStyle: { color: '#C8A548' },
      lineStyle: { width: 3, color: '#C8A548' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(200,165,72,0.4)' },
            { offset: 1, color: 'rgba(200,165,72,0)' },
          ],
        },
      },
    }],
  };

  // Sector bar chart (horizontal)
  const sectorOption = sectors && {
    grid: { left: 140, right: 30, top: 16, bottom: 16 },
    xAxis: {
      type: 'value', max: 5,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
    },
    yAxis: {
      type: 'category',
      data: sectors.map((s) => t(`industry.${s.industry}`)),
      inverse: true,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: '#e2e8f0', fontSize: 11 },
    },
    tooltip: { trigger: 'axis', backgroundColor: '#1a2f4e', borderColor: '#1a2f4e', textStyle: { color: '#fff' } },
    series: [{
      type: 'bar',
      data: sectors.map((s) => ({
        value: s.avgScore,
        itemStyle: { color: scoreColor(s.avgScore), borderRadius: [0, 6, 6, 0] },
      })),
      label: { show: true, position: 'right', color: '#e2e8f0', formatter: '{c}' },
      barWidth: 16,
    }],
  };

  // Score distribution pie
  const distOption = distribution && {
    tooltip: { trigger: 'item', backgroundColor: '#1a2f4e', borderColor: '#1a2f4e', textStyle: { color: '#fff' } },
    legend: { bottom: 0, textStyle: { color: '#94a3b8' } },
    series: [{
      type: 'pie',
      radius: ['55%', '78%'],
      avoidLabelOverlap: true,
      data: distribution.map((b) => ({
        name: b.band,
        value: b.count,
        itemStyle: {
          color: b.band.startsWith('0') ? '#dc2626'
            : b.band.startsWith('1') ? '#f97316'
            : b.band.startsWith('2') ? '#eab308'
            : b.band.startsWith('3') ? '#84cc16' : '#059669',
        },
      })),
      label: { color: '#e2e8f0', formatter: '{b}\n{c}' },
    }],
  };

  // Heatmap of industry × dimension
  const heatOption = heatmap && (() => {
    const industries = Array.from(new Set(heatmap.map((r) => r.industry)));
    const dims = Array.from(new Set(heatmap.map((r) => r.dimension))).sort();
    const data = heatmap.map((r) => [dims.indexOf(r.dimension), industries.indexOf(r.industry), r.score]);
    return {
      tooltip: {
        backgroundColor: '#1a2f4e',
        borderColor: '#1a2f4e',
        textStyle: { color: '#fff' },
        formatter: (p: any) => `<b>${industries[p.value[1]]}</b><br/>${dims[p.value[0]]}: ${p.value[2].toFixed(2)}`,
      },
      grid: { left: 170, right: 20, top: 40, bottom: 60 },
      xAxis: {
        type: 'category', data: dims,
        axisLabel: { color: '#94a3b8', rotate: 45, fontSize: 10 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      },
      yAxis: {
        type: 'category', data: industries.map((i) => i.replace(/_/g, ' ')),
        axisLabel: { color: '#e2e8f0', fontSize: 10 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      },
      visualMap: {
        min: 0, max: 5,
        orient: 'horizontal',
        left: 'center', bottom: 4,
        textStyle: { color: '#94a3b8' },
        inRange: { color: ['#dc2626', '#f97316', '#eab308', '#84cc16', '#059669'] },
      },
      series: [{
        type: 'heatmap',
        data,
        label: { show: true, color: '#0b1220', fontSize: 9, fontWeight: 600 },
      }],
    };
  })();

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Vision 2030 Hero header */}
      <div
        className="reveal"
        style={{
          padding: '24px 28px',
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(200,165,72,0.15) 0%, rgba(0,108,53,0.15) 100%)',
          border: '1px solid rgba(200,165,72,0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <Tag color="gold" style={{ marginBottom: 10 }}>Vision 2030 · Factories of the Future</Tag>
            <Typography.Title level={3} style={{ color: '#fff', margin: '4px 0' }}>
              {t('gov.tagline')}
            </Typography.Title>
            <Typography.Text style={{ color: '#cbd5e1' }}>
              <span className="live-dot" /> Streaming from {summary.totalRegistered.toLocaleString()} factories across Saudi Arabia
            </Typography.Text>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'end' }}>
            <ScoreRing score={summary.averageNationalSiriScore} label="National SIRI" theme="dark" size={140} />
          </Col>
        </Row>
      </div>

      {/* KPI row */}
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <div className="kpi-tile reveal reveal-delay-1">
            <div className="kpi-value">
              <CountUp value={summary.totalRegistered} />
            </div>
            <div className="kpi-label">{t('gov.summary.totalRegistered')}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="kpi-tile reveal reveal-delay-2">
            <div className="kpi-value">
              <CountUp value={summary.totalAssessed} />
            </div>
            <div className="kpi-label">{t('gov.summary.totalAssessed')}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="kpi-tile reveal reveal-delay-3">
            <div className="kpi-value" style={{ color: scoreColor(summary.averageNationalSiriScore) }}>
              <CountUp value={summary.averageNationalSiriScore} decimals={2} />
            </div>
            <div className="kpi-label">{t('gov.summary.avgScore')}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="kpi-tile reveal reveal-delay-4">
            <div className="kpi-value">
              <CountUp value={summary.factoriesAtTarget} />
            </div>
            <div className="kpi-label">{t('gov.summary.atTarget')}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="kpi-tile">
            <div className="kpi-value">
              <CountUp value={summary.factoriesSidfFinanced} />
            </div>
            <div className="kpi-label">{t('gov.summary.sidfFinanced')}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="kpi-tile">
            <div className="kpi-value">
              SAR <CountUp value={summary.totalSidfFinancingSar / 1_000_000} decimals={1} />M
            </div>
            <div className="kpi-label">{t('gov.summary.sidfTotal')}</div>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div className="kpi-tile">
            <Progress
              percent={summary.vision2030ProgressPct}
              strokeColor="#C8A548"
              trailColor="rgba(255,255,255,0.08)"
              showInfo={false}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
              <div className="kpi-label" style={{ margin: 0 }}>{t('gov.summary.vision2030Pct')}</div>
              <Typography.Text style={{ color: '#C8A548', fontWeight: 700 }}>
                <CountUp value={summary.totalAssessed} /> / {summary.vision2030TargetFactories.toLocaleString()}
              </Typography.Text>
            </div>
          </div>
        </Col>
      </Row>

      {/* Map + Activity ticker + Distribution */}
      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title={<Space><BankOutlined /> {t('gov.map')}</Space>} style={{ height: '100%' }}>
            <SaudiMap
              factories={mapData ?? []}
              regionScores={regionScores}
              onSelect={(id) => nav(`/gov/factories/${id}`)}
              theme="dark"
              height={540}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<Space><span className="live-dot" /> Live activity</Space>} bodyStyle={{ padding: 0, maxHeight: 600, overflow: 'auto' }}>
            <List
              dataSource={activity ?? []}
              renderItem={(e) => <ActivityItem event={e} />}
              locale={{ emptyText: <div style={{ padding: 24, textAlign: 'center' }}>No activity yet</div> }}
            />
          </Card>
        </Col>
      </Row>

      {/* National trend + Score distribution */}
      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="National SIRI trend (last 12 months)">
            {trendOption && <ReactECharts option={trendOption} style={{ height: 300 }} />}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={t('gov.scoreDistribution')}>
            {distOption && <ReactECharts option={distOption} style={{ height: 300 }} />}
          </Card>
        </Col>
      </Row>

      {/* Sectors + Regions */}
      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <Card title={t('gov.sectors')}>
            {sectorOption && <ReactECharts option={sectorOption} style={{ height: 420 }} />}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={t('gov.regions')}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {(regions ?? []).sort((a, b) => b.avgScore - a.avgScore).map((r) => (
                <div
                  key={r.name}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ flex: '0 0 140px', fontSize: 13 }}>{r.name}</div>
                  <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(r.avgScore / 5) * 100}%`,
                        background: scoreColor(r.avgScore),
                        transition: 'width 1s ease',
                      }}
                    />
                  </div>
                  <div style={{ flex: '0 0 60px', textAlign: 'end', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {r.avgScore.toFixed(2)}
                  </div>
                  <div style={{ flex: '0 0 36px', textAlign: 'end', color: '#94a3b8', fontSize: 12 }}>
                    {r.totalFactories}
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Heatmap */}
      <Card title="Industry × Dimension heatmap">
        {heatOption && <ReactECharts option={heatOption} style={{ height: 440 }} />}
      </Card>

      {/* Leaderboard */}
      <Card title={<Space><SafetyCertificateOutlined /> {t('gov.leaderboard')}</Space>}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {(leaderboard ?? []).slice(0, 10).map((f, idx) => (
            <div
              key={f.id}
              onClick={() => nav(`/gov/factories/${f.id}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 14px',
                borderRadius: 10,
                background: idx < 3 ? 'rgba(200,165,72,0.08)' : 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = idx < 3 ? 'rgba(200,165,72,0.08)' : 'rgba(255,255,255,0.03)')}
            >
              <div
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: idx < 3 ? 'linear-gradient(135deg, #C8A548 0%, #b8922f 100%)' : 'rgba(255,255,255,0.08)',
                  color: idx < 3 ? '#0b1220' : '#e2e8f0',
                  display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14,
                }}
              >
                {idx + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{i18n.language === 'ar' ? f.nameAr : f.nameEn}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  {t(`industry.${f.industryGroup}`)} · {f.region}
                </div>
              </div>
              {f.sidfFinanced && <Tag color="purple">SIDF</Tag>}
              <span className="score-badge" style={{ background: scoreColor(f.overallScore), minWidth: 60 }}>
                {f.overallScore.toFixed(2)}
              </span>
            </div>
          ))}
        </Space>
      </Card>
    </Space>
  );
}

function ActivityItem({ event }: { event: ActivityEvent }) {
  const { i18n } = useTranslation();
  const name = i18n.language === 'ar' ? event.factory.nameAr : event.factory.nameEn;
  const when = new Date(event.at);
  const diff = Math.round((Date.now() - when.getTime()) / 60000);
  const rel = diff < 60 ? `${diff}m ago` : diff < 1440 ? `${Math.round(diff / 60)}h ago` : `${Math.round(diff / 1440)}d ago`;

  let icon = <FileDoneOutlined />;
  let iconBg = '#006C35';
  let title = '';
  let detail = '';

  if (event.type === 'certificate_issued') {
    icon = <SafetyCertificateOutlined />;
    iconBg = '#C8A548';
    title = `Certificate issued — Level ${event.data.level.toFixed(2)}`;
    detail = `Code ${event.data.code}`;
  } else if (event.type === 'assessment_submitted') {
    icon = <FileDoneOutlined />;
    iconBg = '#006C35';
    title = `Assessment submitted`;
    detail = `SIRI ${event.data.score.toFixed(2)}`;
  } else if (event.type === 'alert_raised') {
    icon = <AlertOutlined />;
    iconBg = '#dc2626';
    title = `Alert — ${event.data.kind.replace(/_/g, ' ')}`;
    detail = i18n.language === 'ar' ? event.data.descriptionAr : event.data.descriptionEn;
  }

  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: iconBg, color: '#fff',
          display: 'grid', placeItems: 'center', flexShrink: 0,
          boxShadow: `0 4px 16px ${iconBg}33`,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
          {event.factory.region} · {detail} · {rel}
        </div>
      </div>
    </div>
  );
}
