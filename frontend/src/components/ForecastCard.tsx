import { Card, Space, Typography, Tag, Empty } from 'antd';
import { RiseOutlined, ClockCircleOutlined, AimOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { api } from '../api/client';

type Forecast = {
  currentScore: number;
  targetScore: number;
  gap: number;
  velocityMilestonesPerMonth: number;
  monthlyScoreGain: number;
  monthsToTarget: number | null;
  completedMilestones: number;
  totalMilestones: number;
  projected: { month: string; withRoadmap: number; withoutRoadmap: number }[];
  confidence: number;
};

export default function ForecastCard({ factoryId }: { factoryId: string }) {
  const { data } = useQuery<Forecast | null>({
    queryKey: ['forecast', factoryId],
    queryFn: async () => (await api.get(`/audit/forecast?factoryId=${factoryId}`)).data,
    enabled: !!factoryId,
  });

  if (!data) return null;

  const targetDate = data.monthsToTarget
    ? new Date(Date.now() + data.monthsToTarget * 30 * 24 * 3600 * 1000)
    : null;
  const targetLabel = targetDate
    ? targetDate.toLocaleString('en', { month: 'short', year: 'numeric' })
    : '—';

  const option = {
    grid: { left: 36, right: 16, top: 8, bottom: 24 },
    tooltip: { trigger: 'axis' },
    legend: {
      bottom: 0,
      data: ['With current roadmap', 'Without action'],
      itemHeight: 8, itemWidth: 14,
      textStyle: { fontSize: 11 },
    },
    xAxis: {
      type: 'category',
      data: data.projected.map((p) => p.month),
      axisLabel: { fontSize: 10, interval: 2 },
    },
    yAxis: { type: 'value', max: 5, axisLabel: { fontSize: 10 } },
    series: [
      {
        name: 'With current roadmap',
        type: 'line', smooth: true, symbol: 'none',
        data: data.projected.map((p) => p.withRoadmap),
        lineStyle: { color: '#006C35', width: 3 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0,108,53,0.3)' },
              { offset: 1, color: 'rgba(0,108,53,0)' },
            ],
          },
        },
      },
      {
        name: 'Without action',
        type: 'line', smooth: true, symbol: 'none',
        data: data.projected.map((p) => p.withoutRoadmap),
        lineStyle: { color: '#94a3b8', width: 2, type: 'dashed' },
      },
      {
        type: 'line',
        data: data.projected.map(() => data.targetScore),
        symbol: 'none',
        lineStyle: { color: '#C8A548', width: 1.5, type: 'dotted' },
        tooltip: { show: false },
        silent: true,
      },
    ],
  };

  return (
    <Card
      title={
        <Space>
          <RiseOutlined style={{ color: '#006C35' }} />
          <span>Predictive SIRI forecast</span>
          <Tag color="gold">AI</Tag>
        </Space>
      }
    >
      {data.totalMilestones === 0 ? (
        <Empty description="Generate a roadmap to see your forecast." />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
            <Stat
              icon={<AimOutlined />}
              label="Projected target date"
              value={targetLabel}
              color="#006C35"
            />
            <Stat
              icon={<ClockCircleOutlined />}
              label="Months to Level 3.5"
              value={data.monthsToTarget !== null ? `${data.monthsToTarget} mo` : '—'}
              color="#0ea5e9"
            />
            <Stat
              icon={<RiseOutlined />}
              label="Monthly score gain"
              value={`+${data.monthlyScoreGain.toFixed(3)}`}
              color="#C8A548"
            />
          </div>
          <ReactECharts option={option} style={{ height: 220 }} />
          <div style={{ marginTop: 8, fontSize: 12, color: '#64748b', textAlign: 'center' }}>
            Based on {data.completedMilestones}/{data.totalMilestones} milestones completed at{' '}
            {data.velocityMilestonesPerMonth.toFixed(1)} per month. Confidence: {data.confidence}%.
          </div>
        </>
      )}
    </Card>
  );
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ padding: 10, background: '#f8fafc', borderRadius: 8 }}>
      <div style={{ color, fontSize: 18, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}
