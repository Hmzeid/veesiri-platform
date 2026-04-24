import { useMemo, useState } from 'react';
import { Card, Col, Row, Slider, Typography, Space, Button, Empty, Tag } from 'antd';
import { ThunderboltOutlined, UndoOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import ReactECharts from 'echarts-for-react';
import { api } from '../api/client';
import ScoreRing from '../components/ScoreRing';

const scoreColor = (v: number) =>
  v >= 4 ? '#059669' : v >= 3 ? '#84cc16' : v >= 2 ? '#eab308' : v >= 1 ? '#f97316' : '#dc2626';

type Response = {
  dimensionCode: string;
  buildingBlock: 'PROCESS' | 'TECHNOLOGY' | 'ORGANIZATION';
  pillar: string;
  rawScore: number;
};

export default function SimulatorPage() {
  const { factoryId } = useParams();
  const { t, i18n } = useTranslation();

  const { data: factory } = useQuery<any>({
    queryKey: ['factory', factoryId],
    queryFn: async () => (await api.get(`/factories/${factoryId}`)).data,
  });
  const latest = factory?.assessments?.[0];
  const assessmentId = latest?.id;
  const { data: assessment } = useQuery<any>({
    queryKey: ['assessment', assessmentId],
    enabled: !!assessmentId,
    queryFn: async () => (await api.get(`/assessments/${assessmentId}`)).data,
  });

  const responses: Response[] = assessment?.responses ?? [];
  const questions: any[] = assessment?.questions ?? [];
  const initial = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of responses) m[r.dimensionCode] = r.rawScore;
    return m;
  }, [responses]);
  const [scenario, setScenario] = useState<Record<string, number>>({});

  const current: Record<string, number> = { ...initial, ...scenario };
  const byBlock = { PROCESS: [] as number[], TECHNOLOGY: [] as number[], ORGANIZATION: [] as number[] };
  for (const r of responses) byBlock[r.buildingBlock].push(current[r.dimensionCode] ?? r.rawScore);
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const processS = avg(byBlock.PROCESS);
  const technology = avg(byBlock.TECHNOLOGY);
  const organization = avg(byBlock.ORGANIZATION);
  const overall = (processS + technology + organization) / 3;

  const originalBlock = { PROCESS: [] as number[], TECHNOLOGY: [] as number[], ORGANIZATION: [] as number[] };
  for (const r of responses) originalBlock[r.buildingBlock].push(r.rawScore);
  const origOverall = (avg(originalBlock.PROCESS) + avg(originalBlock.TECHNOLOGY) + avg(originalBlock.ORGANIZATION)) / 3;
  const delta = overall - origOverall;

  const radarOption = {
    radar: {
      indicator: [
        { name: 'Process', max: 5 },
        { name: 'Technology', max: 5 },
        { name: 'Organization', max: 5 },
      ],
      splitArea: { areaStyle: { color: ['rgba(0,108,53,0.02)', 'rgba(0,108,53,0.05)'] } },
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [avg(originalBlock.PROCESS), avg(originalBlock.TECHNOLOGY), avg(originalBlock.ORGANIZATION)],
          name: 'Current',
          lineStyle: { color: '#94a3b8', type: 'dashed', width: 2 },
          itemStyle: { color: '#94a3b8' },
        },
        {
          value: [processS, technology, organization],
          name: 'Scenario',
          areaStyle: { color: 'rgba(0,108,53,0.3)' },
          lineStyle: { color: '#006C35', width: 3 },
          itemStyle: { color: '#006C35' },
        },
      ],
    }],
    legend: { bottom: 0 },
  };

  if (!assessment) return <Card loading />;
  if (responses.length === 0) return <Card><Empty description="No assessment data" /></Card>;

  const dimsByBlock = {
    PROCESS: responses.filter((r) => r.buildingBlock === 'PROCESS'),
    TECHNOLOGY: responses.filter((r) => r.buildingBlock === 'TECHNOLOGY'),
    ORGANIZATION: responses.filter((r) => r.buildingBlock === 'ORGANIZATION'),
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <ThunderboltOutlined style={{ fontSize: 24, color: '#006C35' }} />
              <div>
                <Typography.Title level={3} style={{ margin: 0 }}>What-if Simulator</Typography.Title>
                <Typography.Text type="secondary">
                  Drag any dimension to see how your overall SIRI score would change.
                </Typography.Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Button icon={<UndoOutlined />} onClick={() => setScenario({})}>
              Reset to current
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={10}>
          <Card>
            <Row gutter={16} align="middle">
              <Col span={12}>
                <Typography.Text type="secondary" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Current
                </Typography.Text>
                <div style={{ fontSize: 40, fontWeight: 800, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
                  {origOverall.toFixed(2)}
                </div>
              </Col>
              <Col span={12} style={{ textAlign: 'center' }}>
                <ScoreRing score={overall} label="Scenario" size={140} />
              </Col>
            </Row>
            <div style={{ marginTop: 16, padding: 16, background: delta >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: 10 }}>
              <Typography.Text style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                PROJECTED DELTA
              </Typography.Text>
              <div style={{ fontSize: 28, fontWeight: 700, color: delta >= 0 ? '#059669' : '#dc2626' }}>
                {delta >= 0 ? '+' : ''}{delta.toFixed(2)}
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {delta > 0
                  ? `Achieving this scenario would raise SIRI by ${delta.toFixed(2)} points.`
                  : delta < 0
                    ? `This scenario would drop your SIRI by ${Math.abs(delta).toFixed(2)} points.`
                    : 'No change from current assessment.'}
              </Typography.Text>
            </div>
            <div style={{ marginTop: 20 }}>
              <Row gutter={8}>
                <Col span={8}>
                  <BlockStat label="Process" value={processS} orig={avg(originalBlock.PROCESS)} />
                </Col>
                <Col span={8}>
                  <BlockStat label="Technology" value={technology} orig={avg(originalBlock.TECHNOLOGY)} />
                </Col>
                <Col span={8}>
                  <BlockStat label="Organization" value={organization} orig={avg(originalBlock.ORGANIZATION)} />
                </Col>
              </Row>
            </div>
          </Card>
          <Card style={{ marginTop: 16 }}>
            <ReactECharts option={radarOption} style={{ height: 340 }} />
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          {(['PROCESS', 'TECHNOLOGY', 'ORGANIZATION'] as const).map((b) => (
            <Card
              key={b}
              title={<Tag color={b === 'PROCESS' ? 'green' : b === 'TECHNOLOGY' ? 'blue' : 'purple'}>{b}</Tag>}
              style={{ marginBottom: 16 }}
              size="small"
            >
              {dimsByBlock[b].map((r) => {
                const q = questions.find((x) => x.dimensionCode === r.dimensionCode);
                const val = current[r.dimensionCode] ?? r.rawScore;
                const orig = initial[r.dimensionCode];
                const changed = val !== orig;
                return (
                  <div key={r.dimensionCode} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div>
                        <Typography.Text strong style={{ fontSize: 13 }}>{r.dimensionCode}</Typography.Text>
                        <Typography.Text type="secondary" style={{ marginInlineStart: 8, fontSize: 12 }}>
                          {q ? (i18n.language === 'ar' ? q.dimensionNameAr : q.dimensionNameEn) : ''}
                        </Typography.Text>
                      </div>
                      <Space size={4}>
                        {changed && (
                          <Tag color={val > orig ? 'green' : 'red'}>
                            {val > orig ? '+' : ''}{val - orig}
                          </Tag>
                        )}
                        <span
                          style={{
                            background: scoreColor(val), color: '#fff',
                            padding: '2px 10px', borderRadius: 999, fontWeight: 700, fontSize: 12,
                          }}
                        >
                          {val}
                        </span>
                      </Space>
                    </div>
                    <Slider
                      min={0} max={5} step={1}
                      value={val}
                      marks={{ 0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }}
                      onChange={(v) => setScenario((s) => ({ ...s, [r.dimensionCode]: v as number }))}
                    />
                  </div>
                );
              })}
            </Card>
          ))}
        </Col>
      </Row>
    </Space>
  );
}

function BlockStat({ label, value, orig }: { label: string; value: number; orig: number }) {
  const delta = value - orig;
  return (
    <div style={{ padding: 10, background: '#f8fafc', borderRadius: 8, textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: scoreColor(value), fontVariantNumeric: 'tabular-nums' }}>
        {value.toFixed(2)}
      </div>
      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      {delta !== 0 && (
        <div style={{ fontSize: 11, color: delta > 0 ? '#059669' : '#dc2626', fontWeight: 600, marginTop: 2 }}>
          {delta > 0 ? '+' : ''}{delta.toFixed(2)}
        </div>
      )}
    </div>
  );
}
