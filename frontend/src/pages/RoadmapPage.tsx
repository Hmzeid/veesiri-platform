import { Card, Col, Row, Tag, Typography, Space, Progress, Button, message, Empty, Timeline } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';

const STATUS_COLOR: Record<string, string> = {
  PLANNED: 'default',
  IN_PROGRESS: 'processing',
  COMPLETED: 'success',
  DELAYED: 'error',
  ACTIVE: 'processing',
  PENDING: 'default',
  OVERDUE: 'error',
  APPROVED: 'success',
  DRAFT: 'default',
};

export default function RoadmapPage() {
  const { factoryId } = useParams();
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const isAr = i18n.language === 'ar';

  const { data, isLoading } = useQuery<any>({
    queryKey: ['roadmap', factoryId],
    queryFn: async () => (await api.get(`/roadmaps/latest?factoryId=${factoryId}`)).data,
  });

  const approve = useMutation({
    mutationFn: async () => (await api.post(`/roadmaps/${data.id}/approve`)).data,
    onSuccess: () => {
      message.success(t('roadmap.approved_action'));
      qc.invalidateQueries({ queryKey: ['roadmap', factoryId] });
    },
  });

  const completeMs = useMutation({
    mutationFn: async (msId: string) => (await api.put(`/roadmaps/milestones/${msId}/complete`)).data,
    onSuccess: () => {
      message.success('Milestone completed');
      qc.invalidateQueries({ queryKey: ['roadmap', factoryId] });
    },
  });

  if (isLoading) return <Card loading />;
  if (!data) return <Card><Empty description={t('gap.noData')} /></Card>;

  const phases = data.phases ?? [];
  const allInitiatives = phases.flatMap((p: any) => p.initiatives);
  const totalBudget = Number(data.totalBudgetSar);
  const avgProgress = allInitiatives.length
    ? allInitiatives.reduce((a: number, b: any) => a + b.completionPercentage, 0) / allInitiatives.length
    : 0;

  // Gantt-style view using horizontal bars
  const roadmapStart = new Date(data.startDate).getTime();
  const roadmapEnd = new Date(data.endDate).getTime();
  const span = Math.max(1, roadmapEnd - roadmapStart);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Typography.Title level={3} style={{ margin: 0 }}>{t('roadmap.title')}</Typography.Title>
            <Typography.Text type="secondary">
              {new Date(data.startDate).toLocaleDateString()} → {new Date(data.endDate).toLocaleDateString()}
            </Typography.Text>
          </Col>
          <Col>
            <Space>
              <Tag color={STATUS_COLOR[data.status] as any}>{t(`roadmap.${data.status.toLowerCase()}`, { defaultValue: data.status })}</Tag>
              {data.status === 'DRAFT' && (
                <Button type="primary" loading={approve.isPending} onClick={() => approve.mutate()}>
                  {t('roadmap.approve')}
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col xs={12} md={6}>
          <div className="kpi-tile">
            <div className="kpi-value">{phases.length}</div>
            <div className="kpi-label">{t('roadmap.phase')}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="kpi-tile">
            <div className="kpi-value">{allInitiatives.length}</div>
            <div className="kpi-label">{t('roadmap.initiatives')}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="kpi-tile">
            <div className="kpi-value">SAR {(totalBudget / 1_000_000).toFixed(2)}M</div>
            <div className="kpi-label">{t('roadmap.totalBudget')}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="kpi-tile">
            <Progress type="circle" percent={Math.round(avgProgress)} size={60} />
            <div className="kpi-label" style={{ marginTop: 8 }}>{t('roadmap.progress')}</div>
          </div>
        </Col>
      </Row>

      {/* Gantt-style timeline */}
      <Card title="Timeline">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {phases.map((phase: any) => {
            return phase.initiatives.map((init: any) => {
              const s = new Date(init.startDate).getTime();
              const e = new Date(init.endDate).getTime();
              const leftPct = Math.max(0, ((s - roadmapStart) / span) * 100);
              const widthPct = Math.min(100 - leftPct, ((e - s) / span) * 100);
              const phaseColor = phase.phaseNumber === 1 ? '#006C35' : phase.phaseNumber === 2 ? '#0ea5e9' : '#8b5cf6';
              return (
                <div key={init.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: '0 0 260px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Tag color={phaseColor} style={{ marginInlineEnd: 6 }}>P{phase.phaseNumber}</Tag>
                    <Typography.Text ellipsis>{isAr ? init.titleAr : init.titleEn}</Typography.Text>
                  </div>
                  <div style={{ flex: 1, position: 'relative', height: 26, background: '#f3f4f6', borderRadius: 4 }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        height: '100%',
                        background: phaseColor,
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingInlineEnd: 6,
                      }}
                    >
                      <Typography.Text style={{ color: '#fff', fontSize: 11 }}>
                        {init.completionPercentage}%
                      </Typography.Text>
                    </div>
                  </div>
                  <div style={{ flex: '0 0 100px', fontSize: 11, color: '#6b7280', textAlign: 'end' }}>
                    SAR {(Number(init.budgetSar) / 1000).toFixed(0)}k
                  </div>
                </div>
              );
            });
          })}
        </div>
      </Card>

      {/* Phases */}
      {phases.map((phase: any) => (
        <Card
          key={phase.id}
          title={
            <Space>
              <Tag>{t('roadmap.phase')} {phase.phaseNumber}</Tag>
              <Typography.Text strong>{isAr ? phase.nameAr : phase.nameEn}</Typography.Text>
              <Tag color={STATUS_COLOR[phase.status] as any}>{t(`roadmap.statusLabels.${phase.status}`)}</Tag>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            {phase.initiatives.map((init: any) => (
              <Col xs={24} md={12} key={init.id}>
                <Card size="small" style={{ background: '#fafafa' }}>
                  <Typography.Text strong>{isAr ? init.titleAr : init.titleEn}</Typography.Text>
                  <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
                    {isAr ? init.descriptionAr : init.descriptionEn}
                  </div>
                  <Space style={{ marginTop: 8 }}>
                    <Tag>{init.dimensionCode}</Tag>
                    <Tag color={STATUS_COLOR[init.status] as any}>{t(`roadmap.statusLabels.${init.status}`)}</Tag>
                    {init.sidfEligible && <Tag color="purple">SIDF</Tag>}
                    <Tag color="blue">SAR {(Number(init.budgetSar) / 1000).toFixed(0)}k</Tag>
                  </Space>
                  <Progress percent={init.completionPercentage} size="small" style={{ marginTop: 8 }} />
                  <Timeline
                    style={{ marginTop: 12 }}
                    items={init.milestones.map((ms: any) => ({
                      color: ms.status === 'COMPLETED' ? 'green' : ms.status === 'OVERDUE' ? 'red' : 'gray',
                      children: (
                        <Space>
                          <Typography.Text delete={ms.status === 'COMPLETED'}>
                            {isAr ? ms.titleAr : ms.titleEn}
                          </Typography.Text>
                          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                            {new Date(ms.dueDate).toLocaleDateString()}
                          </Typography.Text>
                          {ms.status !== 'COMPLETED' && (
                            <Button size="small" type="link" onClick={() => completeMs.mutate(ms.id)}>
                              {t('roadmap.markComplete')}
                            </Button>
                          )}
                        </Space>
                      ),
                    }))}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      ))}
    </Space>
  );
}
