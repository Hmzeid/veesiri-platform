import { Button, Tag, Typography, Spin, Progress } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import ReactECharts from 'echarts-for-react';
import { api } from '../../api/client';

const scoreColor = (v: number) =>
  v >= 4 ? '#059669' : v >= 3 ? '#84cc16' : v >= 2 ? '#eab308' : v >= 1 ? '#f97316' : '#dc2626';

export default function GovMinisterialReportPage() {
  const { t, i18n } = useTranslation();

  const { data: summary } = useQuery<any>({ queryKey: ['gov-summary'], queryFn: async () => (await api.get('/gov/dashboard/summary')).data });
  const { data: regions } = useQuery<any[]>({ queryKey: ['gov-regions'], queryFn: async () => (await api.get('/gov/dashboard/regions')).data });
  const { data: sectors } = useQuery<any[]>({ queryKey: ['gov-sectors'], queryFn: async () => (await api.get('/gov/dashboard/sectors')).data });
  const { data: trends } = useQuery<any[]>({ queryKey: ['gov-trends'], queryFn: async () => (await api.get('/gov/dashboard/trends')).data });
  const { data: leaderboard } = useQuery<any[]>({ queryKey: ['gov-leaderboard'], queryFn: async () => (await api.get('/gov/dashboard/leaderboard')).data });

  if (!summary) return <Spin />;

  const trendOption = trends && {
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: trends.map((p: any) => p.label) },
    yAxis: { type: 'value', max: 5 },
    series: [{
      type: 'line', smooth: true, data: trends.map((p: any) => p.avgScore),
      itemStyle: { color: '#006C35' }, lineStyle: { width: 3, color: '#006C35' },
      areaStyle: { color: 'rgba(0,108,53,0.15)' },
    }],
  };

  const sectorOption = sectors && {
    grid: { left: 140, right: 30, top: 16, bottom: 16 },
    xAxis: { type: 'value', max: 5 },
    yAxis: { type: 'category', data: sectors.map((s) => s.industry.replace(/_/g, ' ')), inverse: true },
    series: [{ type: 'bar', data: sectors.map((s) => ({ value: s.avgScore, itemStyle: { color: scoreColor(s.avgScore), borderRadius: [0, 4, 4, 0] } })), label: { show: true, position: 'right' } }],
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#0b1220' }}>
      <div
        className="no-print"
        style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: '#fff', padding: '12px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <div>
          <Tag color="gold">Ministerial Brief</Tag>
          <span style={{ color: '#64748b', fontSize: 13 }}>Confidential · {new Date().toLocaleDateString()}</span>
        </div>
        <Button icon={<PrinterOutlined />} type="primary" onClick={() => window.print()}>Print / Save as PDF</Button>
      </div>

      <div style={{ maxWidth: 920, margin: '0 auto', padding: 40 }}>
        {/* Cover */}
        <div
          className="print-page"
          style={{ background: '#fff', borderRadius: 16, padding: '80px 60px', boxShadow: 'var(--shadow-lg)', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: 0, insetInlineStart: 0, right: 0, height: 120, background: 'var(--gradient-hero)' }} />
          <div style={{ position: 'relative', color: '#fff', paddingTop: 24 }}>
            <Tag color="gold">Vision 2030 · Factories of the Future</Tag>
            <div style={{ fontSize: 14, marginTop: 16, opacity: 0.9 }}>
              Ministry of Industry & Mineral Resources · Saudi Industrial Development Fund
            </div>
          </div>
          <div style={{ marginTop: 100 }}>
            <div className="eyebrow">Confidential Ministerial Brief</div>
            <h1 className="display-1" style={{ marginTop: 12 }}>
              National SIRI Readiness Snapshot
            </h1>
            <Typography.Paragraph style={{ fontSize: 16, color: '#64748b', marginTop: 8 }}>
              Q2 2026 · {summary.totalRegistered.toLocaleString()} factories tracked · powered by VeeSIRI
            </Typography.Paragraph>
          </div>

          <div style={{ marginTop: 60, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            <KpiCell label="Registered factories" value={summary.totalRegistered.toLocaleString()} />
            <KpiCell label="Assessed factories" value={summary.totalAssessed.toLocaleString()} />
            <KpiCell label="National SIRI avg" value={summary.averageNationalSiriScore.toFixed(2)} color={scoreColor(summary.averageNationalSiriScore)} />
            <KpiCell label="At target (≥3.0)" value={summary.factoriesAtTarget.toString()} />
            <KpiCell label="SIDF-financed" value={summary.factoriesSidfFinanced.toString()} />
            <KpiCell label="SIDF deployed (SAR)" value={`${(summary.totalSidfFinancingSar / 1_000_000).toFixed(1)}M`} color="#8b5cf6" />
          </div>

          <div style={{ marginTop: 48 }}>
            <Typography.Text strong>Progress towards Vision 2030 target (4,000 factories):</Typography.Text>
            <Progress
              percent={summary.vision2030ProgressPct}
              strokeColor="#C8A548"
              style={{ marginTop: 8 }}
              format={(p) => `${p?.toFixed(2)}%`}
            />
          </div>

          <div style={{ position: 'absolute', bottom: 28, insetInlineStart: 60, right: 60, fontSize: 11, color: '#94a3b8' }}>
            Prepared by VeeSIRI · Veebase LLC · For official use only
          </div>
        </div>

        {/* Sector + Region */}
        <div
          className="print-page"
          style={{ background: '#fff', borderRadius: 16, padding: '48px 60px', boxShadow: 'var(--shadow-lg)', marginTop: 32 }}
        >
          <div className="eyebrow">Section 1</div>
          <h2 className="display-2">Sector performance</h2>
          <Typography.Paragraph style={{ color: '#64748b', marginTop: 8 }}>
            Average SIRI readiness scores across the 14 industry groups tracked on the platform.
          </Typography.Paragraph>
          {sectorOption && <ReactECharts option={sectorOption} style={{ height: 380 }} />}

          <div style={{ marginTop: 40 }}>
            <div className="eyebrow">Section 2</div>
            <h2 className="display-2">Regional breakdown</h2>
            <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1a2f4e' }}>
                  <th style={{ textAlign: 'start', padding: 8 }}>Region</th>
                  <th style={{ padding: 8 }}>Factories</th>
                  <th style={{ padding: 8 }}>Avg SIRI</th>
                  <th style={{ padding: 8 }}>SIDF financed</th>
                </tr>
              </thead>
              <tbody>
                {(regions ?? []).sort((a: any, b: any) => b.avgScore - a.avgScore).map((r: any) => (
                  <tr key={r.name} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 8, fontWeight: 600 }}>{r.name}</td>
                    <td style={{ padding: 8, textAlign: 'center' }}>{r.totalFactories}</td>
                    <td style={{ padding: 8, textAlign: 'center' }}>
                      <span style={{ background: scoreColor(r.avgScore), color: '#fff', padding: '2px 10px', borderRadius: 999, fontWeight: 700 }}>
                        {r.avgScore.toFixed(2)}
                      </span>
                    </td>
                    <td style={{ padding: 8, textAlign: 'center' }}>{r.sidfFinanced}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trend + Top factories */}
        <div
          className="print-page"
          style={{ background: '#fff', borderRadius: 16, padding: '48px 60px', boxShadow: 'var(--shadow-lg)', marginTop: 32 }}
        >
          <div className="eyebrow">Section 3</div>
          <h2 className="display-2">National SIRI trend</h2>
          <Typography.Paragraph style={{ color: '#64748b', marginTop: 8 }}>
            Average national SIRI score over the last 12 months.
          </Typography.Paragraph>
          {trendOption && <ReactECharts option={trendOption} style={{ height: 300 }} />}

          <div style={{ marginTop: 40 }}>
            <div className="eyebrow">Section 4</div>
            <h2 className="display-2">Top 10 factories</h2>
            <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1a2f4e' }}>
                  <th style={{ textAlign: 'start', padding: 8 }}>#</th>
                  <th style={{ textAlign: 'start', padding: 8 }}>Factory</th>
                  <th style={{ textAlign: 'start', padding: 8 }}>Industry</th>
                  <th style={{ textAlign: 'start', padding: 8 }}>Region</th>
                  <th style={{ padding: 8 }}>SIRI</th>
                  <th style={{ padding: 8 }}>SIDF</th>
                </tr>
              </thead>
              <tbody>
                {(leaderboard ?? []).slice(0, 10).map((f: any, i: number) => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 8 }}>{i + 1}</td>
                    <td style={{ padding: 8, fontWeight: 600 }}>{i18n.language === 'ar' ? f.nameAr : f.nameEn}</td>
                    <td style={{ padding: 8 }}>{t(`industry.${f.industryGroup}`)}</td>
                    <td style={{ padding: 8 }}>{f.region}</td>
                    <td style={{ padding: 8, textAlign: 'center' }}>
                      <span style={{ background: scoreColor(f.overallScore), color: '#fff', padding: '2px 10px', borderRadius: 999, fontWeight: 700 }}>
                        {f.overallScore.toFixed(2)}
                      </span>
                    </td>
                    <td style={{ padding: 8, textAlign: 'center' }}>{f.sidfFinanced ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 50, paddingTop: 20, borderTop: '1px solid #e5e7eb', color: '#94a3b8', fontSize: 11, textAlign: 'center' }}>
            © Veebase LLC · Ministerial Brief · Generated {new Date().toLocaleDateString()} · For official use only
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCell({ label, value, color = '#0b1220' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12 }}>
      <div style={{ fontSize: 32, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}
