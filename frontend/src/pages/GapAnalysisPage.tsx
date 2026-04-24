import { useParams, useNavigate } from 'react-router-dom';
import { Card, Col, Row, Tag, Table, Typography, Button, Space, Empty, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { api } from '../api/client';

type DimensionGap = {
  id: string;
  dimensionCode: string;
  currentScore: string;
  targetScore: string;
  gapMagnitude: string;
  priorityRank: number;
  severity: 'CRITICAL' | 'MODERATE' | 'MINOR' | 'ON_TRACK';
  estimatedEffortMonths: number;
  estimatedCostSar: string;
  isQuickWin: boolean;
  isSidfRelevant: boolean;
  narrativeEn: string;
  narrativeAr: string;
};

type GapAnalysis = {
  id: string;
  overallGap: string;
  processGap: string;
  technologyGap: string;
  organizationGap: string;
  targetOverallScore: string;
  generatedAt: string;
  dimensionGaps: DimensionGap[];
  assessment: { id: string; overallScore: string };
};

const SEVERITY_COLOR: Record<DimensionGap['severity'], string> = {
  CRITICAL: 'red',
  MODERATE: 'orange',
  MINOR: 'gold',
  ON_TRACK: 'green',
};

export default function GapAnalysisPage() {
  const { factoryId } = useParams();
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const isAr = i18n.language === 'ar';

  const { data, isLoading, refetch } = useQuery<GapAnalysis | null>({
    queryKey: ['gap-latest', factoryId],
    queryFn: async () => (await api.get(`/gap-analysis/latest?factoryId=${factoryId}`)).data,
  });

  const { data: factory } = useQuery<any>({
    queryKey: ['factory', factoryId],
    queryFn: async () => (await api.get(`/factories/${factoryId}`)).data,
  });

  const generateMut = useMutation({
    mutationFn: async () => {
      const latest = factory?.assessments?.find((a: any) => a.status === 'SUBMITTED' || a.status === 'CERTIFIED');
      if (!latest) throw new Error('No submitted assessment');
      return (await api.post('/gap-analysis', { assessmentId: latest.id })).data;
    },
    onSuccess: () => {
      message.success('Gap analysis generated');
      refetch();
    },
    onError: (e: any) => message.error(e.message || 'Generate failed'),
  });

  if (isLoading) return <Card loading />;

  if (!data) {
    const canGenerate = factory?.assessments?.some((a: any) => a.status === 'SUBMITTED' || a.status === 'CERTIFIED');
    return (
      <Card>
        <Empty description={t('gap.noData')}>
          {canGenerate ? (
            <Button type="primary" onClick={() => generateMut.mutate()} loading={generateMut.isPending}>
              {t('gap.generate')}
            </Button>
          ) : (
            <Button type="primary" onClick={() => nav(`/app/factories`)}>
              {t('nav.factories')}
            </Button>
          )}
        </Empty>
      </Card>
    );
  }

  const quickWins = data.dimensionGaps.filter((g) => g.isQuickWin).length;
  const sidfRelevant = data.dimensionGaps.filter((g) => g.isSidfRelevant).length;

  const barOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 80, right: 24, top: 24, bottom: 32 },
    xAxis: { type: 'value', max: 5 },
    yAxis: {
      type: 'category',
      data: data.dimensionGaps.map((g) => g.dimensionCode),
      inverse: true,
    },
    series: [
      {
        name: t('gap.current'),
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#006C35' },
        data: data.dimensionGaps.map((g) => Number(g.currentScore)),
      },
      {
        name: t('gap.gap'),
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#f59e0b' },
        data: data.dimensionGaps.map((g) => Number(g.gapMagnitude)),
      },
    ],
    legend: { data: [t('gap.current'), t('gap.gap')], bottom: 0 },
  };

  const columns = [
    { title: '#', dataIndex: 'priorityRank', key: 'rank', width: 60 },
    { title: t('gap.dimension'), dataIndex: 'dimensionCode', key: 'code' },
    {
      title: t('gap.current'),
      dataIndex: 'currentScore',
      key: 'current',
      render: (v: string) => Number(v).toFixed(2),
    },
    {
      title: t('gap.gap'),
      dataIndex: 'gapMagnitude',
      key: 'gap',
      render: (v: string) => Number(v).toFixed(2),
    },
    {
      title: t('gap.severity'),
      dataIndex: 'severity',
      key: 'sev',
      render: (v: DimensionGap['severity']) => (
        <Tag color={SEVERITY_COLOR[v]}>{t(`severity.${v}`)}</Tag>
      ),
    },
    { title: t('gap.effort'), dataIndex: 'estimatedEffortMonths', key: 'effort' },
    {
      title: t('gap.cost'),
      dataIndex: 'estimatedCostSar',
      key: 'cost',
      render: (v: string) => `SAR ${Number(v).toLocaleString()}`,
    },
    {
      title: '',
      key: 'flags',
      render: (_: any, r: DimensionGap) => (
        <Space>
          {r.isQuickWin && <Tag color="blue">{t('gap.quickWins')}</Tag>}
          {r.isSidfRelevant && <Tag color="purple">SIDF</Tag>}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Typography.Title level={3} style={{ margin: 0 }}>{t('gap.title')}</Typography.Title>
          <Button onClick={() => generateMut.mutate()} loading={generateMut.isPending}>
            {t('gap.generate')}
          </Button>
        </Space>
      </Card>

      <Row gutter={16}>
        <Col xs={12} md={6}>
          <div className="kpi-tile">
            <div className="kpi-value">{Number(data.assessment.overallScore).toFixed(2)}</div>
            <div className="kpi-label">{t('dashboard.overallScore')}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="kpi-tile">
            <div className="kpi-value">{Number(data.targetOverallScore).toFixed(2)}</div>
            <div className="kpi-label">{t('gap.target')}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="kpi-tile">
            <div className="kpi-value">{Number(data.overallGap).toFixed(2)}</div>
            <div className="kpi-label">{t('gap.overallGap')}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="kpi-tile">
            <div className="kpi-value">
              {quickWins} <Typography.Text type="secondary" style={{ fontSize: 14 }}>/ {sidfRelevant} {t('gap.sidfRelevant')}</Typography.Text>
            </div>
            <div className="kpi-label">{t('gap.quickWins')}</div>
          </div>
        </Col>
      </Row>

      <Card title={t('gap.title')}>
        <ReactECharts option={barOption} style={{ height: 420 }} />
      </Card>

      <Card>
        <Table<DimensionGap>
          rowKey="id"
          dataSource={data.dimensionGaps}
          columns={columns as any}
          pagination={false}
          expandable={{
            expandedRowRender: (r) => (
              <Typography.Paragraph style={{ margin: 0 }}>
                {isAr ? r.narrativeAr : r.narrativeEn}
              </Typography.Paragraph>
            ),
          }}
        />
      </Card>
    </Space>
  );
}
