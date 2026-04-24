import { Card, Typography, Space, Spin, Empty } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactECharts from 'echarts-for-react';
import { api } from '../api/client';

export default function BenchmarksPage() {
  const { factoryId } = useParams();
  const { t } = useTranslation();

  const { data: factory } = useQuery<any>({
    queryKey: ['factory', factoryId],
    queryFn: async () => (await api.get(`/factories/${factoryId}`)).data,
  });

  const industry = factory?.industryGroup;
  const { data: benchmarks, isLoading } = useQuery<any[]>({
    queryKey: ['benchmarks', industry],
    enabled: !!industry,
    queryFn: async () => (await api.get(`/benchmarks/${industry}`)).data,
  });

  const latestAssessment = factory?.assessments?.find((a: any) => a.status === 'SUBMITTED' || a.status === 'CERTIFIED');
  const responsesByCode = new Map<string, number>();
  // assessment from list view doesn't include responses, so we fetch from gap? Simpler: use benchmarks only.

  if (isLoading) return <Spin />;
  if (!benchmarks || benchmarks.length === 0) return <Card><Empty description="No benchmark data" /></Card>;

  const dims = benchmarks.map((b) => b.dimensionCode).sort();

  const option = {
    legend: { data: [t('benchmarks.median'), t('benchmarks.p75'), t('benchmarks.p90')] },
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 24, top: 36, bottom: 40 },
    xAxis: { type: 'category', data: dims, axisLabel: { rotate: 45 } },
    yAxis: { type: 'value', max: 5 },
    series: [
      { name: t('benchmarks.median'), type: 'bar', data: dims.map((c) => benchmarks.find((b) => b.dimensionCode === c)?.medianScore ?? 0), itemStyle: { color: '#006C35' } },
      { name: t('benchmarks.p75'), type: 'bar', data: dims.map((c) => benchmarks.find((b) => b.dimensionCode === c)?.p75Score ?? 0), itemStyle: { color: '#84cc16' } },
      { name: t('benchmarks.p90'), type: 'bar', data: dims.map((c) => benchmarks.find((b) => b.dimensionCode === c)?.p90Score ?? 0), itemStyle: { color: '#f59e0b' } },
    ],
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Typography.Title level={3} style={{ margin: 0 }}>{t('benchmarks.title')}</Typography.Title>
        <Typography.Text type="secondary">
          {t('benchmarks.subtitle')} — {industry && t(`industry.${industry}`)}
        </Typography.Text>
      </Card>
      <Card>
        <ReactECharts option={option} style={{ height: 440 }} />
      </Card>
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: 8, textAlign: 'start' }}>Dim</th>
              <th>Sample</th>
              <th>Mean</th>
              <th>P25</th>
              <th>P50</th>
              <th>P75</th>
              <th>P90</th>
            </tr>
          </thead>
          <tbody>
            {benchmarks.sort((a, b) => a.dimensionCode.localeCompare(b.dimensionCode)).map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: 8 }}><b>{b.dimensionCode}</b></td>
                <td style={{ textAlign: 'center' }}>{b.sampleSize}</td>
                <td style={{ textAlign: 'center' }}>{Number(b.meanScore).toFixed(2)}</td>
                <td style={{ textAlign: 'center' }}>{Number(b.p25Score).toFixed(2)}</td>
                <td style={{ textAlign: 'center' }}>{Number(b.medianScore).toFixed(2)}</td>
                <td style={{ textAlign: 'center' }}>{Number(b.p75Score).toFixed(2)}</td>
                <td style={{ textAlign: 'center' }}>{Number(b.p90Score).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Space>
  );
}
