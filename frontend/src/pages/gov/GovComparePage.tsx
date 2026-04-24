import { Card, Row, Col, Typography, Tag, Spin, Empty } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import ReactECharts from 'echarts-for-react';
import { api } from '../../api/client';
import ScoreRing from '../../components/ScoreRing';

const scoreColor = (v: number) => v >= 4 ? '#059669' : v >= 3 ? '#84cc16' : v >= 2 ? '#eab308' : v >= 1 ? '#f97316' : '#dc2626';
const PALETTE = ['#006C35', '#0ea5e9', '#8b5cf6'];

export default function GovComparePage() {
  const [params] = useSearchParams();
  const { t, i18n } = useTranslation();
  const ids = (params.get('ids') ?? '').split(',').filter(Boolean);

  const { data, isLoading } = useQuery<any[]>({
    queryKey: ['gov-compare', ids.join(',')],
    enabled: ids.length >= 2,
    queryFn: async () => (await api.post('/gov/compare', { ids })).data,
  });

  if (isLoading) return <Spin />;
  if (!data || data.length < 2) return <Card><Empty description="Select 2+ factories from search to compare" /></Card>;

  const allDims = Array.from(new Set(data.flatMap((f) => f.assessments?.[0]?.responses?.map((r: any) => r.dimensionCode) ?? []))).sort();

  const radarOption = {
    legend: { bottom: 0, textStyle: { color: '#e2e8f0' } },
    radar: {
      indicator: allDims.map((d) => ({ name: d, max: 5 })),
      splitArea: { areaStyle: { color: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.04)'] } },
      axisName: { color: '#94a3b8', fontSize: 10 },
    },
    series: [{
      type: 'radar',
      data: data.map((f, i) => {
        const map = new Map<string, number>();
        for (const r of f.assessments?.[0]?.responses ?? []) map.set(r.dimensionCode, r.rawScore);
        return {
          name: i18n.language === 'ar' ? f.nameAr : f.nameEn,
          value: allDims.map((d) => map.get(d) ?? 0),
          lineStyle: { color: PALETTE[i % PALETTE.length], width: 2 },
          areaStyle: { color: PALETTE[i % PALETTE.length] + '33' },
          itemStyle: { color: PALETTE[i % PALETTE.length] },
        };
      }),
    }],
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Factory Comparison</Typography.Title>
        <Typography.Text type="secondary">Side-by-side analysis · {data.length} factories</Typography.Text>
      </Card>

      <Row gutter={16}>
        {data.map((f, i) => {
          const a = f.assessments?.[0];
          const score = a ? Number(a.overallScore) : 0;
          return (
            <Col xs={24} md={24 / data.length} key={f.id}>
              <Card
                style={{
                  height: '100%',
                  borderTop: `4px solid ${PALETTE[i % PALETTE.length]}`,
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {i18n.language === 'ar' ? f.nameAr : f.nameEn}
                  </Typography.Title>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {t(`industry.${f.industryGroup}`)} · {f.region}
                  </Typography.Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                  <ScoreRing score={score} label="SIRI" size={120} theme="dark" />
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <KV k="CR" v={f.crNumber} />
                  <KV k="Size" v={f.sizeClassification} />
                  <KV k="Employees" v={f.employeeCount.toLocaleString()} />
                  <KV k="Revenue (SAR)" v={f.annualRevenueSar ? (Number(f.annualRevenueSar) / 1_000_000).toFixed(1) + 'M' : '—'} />
                  <KV k="SIDF" v={f.sidfFinanced ? <Tag color="purple">Financed</Tag> : <Tag>—</Tag>} />
                  <KV k="Process" v={a ? Number(a.processScore).toFixed(2) : '—'} />
                  <KV k="Technology" v={a ? Number(a.technologyScore).toFixed(2) : '—'} />
                  <KV k="Organization" v={a ? Number(a.organizationScore).toFixed(2) : '—'} />
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Card title="Dimension profile" style={{ marginTop: 16 }}>
        <ReactECharts option={radarOption} style={{ height: 480 }} />
      </Card>

      <Card title="Dimension-level comparison" style={{ marginTop: 16 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ textAlign: 'start', padding: 8 }}>Dimension</th>
                {data.map((f) => (
                  <th key={f.id} style={{ padding: 8, textAlign: 'center' }}>
                    {i18n.language === 'ar' ? f.nameAr : f.nameEn}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allDims.map((d) => (
                <tr key={d} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 8, fontWeight: 600 }}>{d}</td>
                  {data.map((f) => {
                    const r = f.assessments?.[0]?.responses?.find((x: any) => x.dimensionCode === d);
                    const s = r?.rawScore ?? 0;
                    return (
                      <td key={f.id} style={{ padding: 8, textAlign: 'center' }}>
                        <span style={{ background: scoreColor(s), color: '#fff', padding: '2px 10px', borderRadius: 999, fontWeight: 700 }}>
                          {s}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function KV({ k, v }: { k: string; v: any }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
      <span style={{ color: '#94a3b8' }}>{k}</span>
      <span style={{ fontWeight: 600 }}>{v}</span>
    </div>
  );
}
