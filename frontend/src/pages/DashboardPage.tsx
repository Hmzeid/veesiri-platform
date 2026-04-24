import { Card, Col, Row, Typography, Space, Button, Tag, Empty, Spin, Progress, List } from 'antd';
import {
  BulbOutlined,
  NodeIndexOutlined,
  SafetyCertificateOutlined,
  RocketOutlined,
  BarChartOutlined,
  BellOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactECharts from 'echarts-for-react';
import { api } from '../api/client';
import { useAuth } from '../store/auth';
import { useSelectedFactory } from '../store/selectedFactory';
import Achievements from '../components/Achievements';
import ForecastCard from '../components/ForecastCard';
import SustainabilityCard from '../components/SustainabilityCard';

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const user = useAuth((s) => s.user);
  const selectedId = useSelectedFactory((s) => s.factoryId);

  const { data: factories, isLoading } = useQuery<any[]>({
    queryKey: ['factories'],
    queryFn: async () => (await api.get('/factories')).data,
  });

  const fid = selectedId ?? factories?.[0]?.id;

  const { data: factory } = useQuery<any>({
    queryKey: ['factory', fid],
    enabled: !!fid,
    queryFn: async () => (await api.get(`/factories/${fid}`)).data,
  });

  const { data: roadmap } = useQuery<any>({
    queryKey: ['roadmap', fid],
    enabled: !!fid,
    queryFn: async () => (await api.get(`/roadmaps/latest?factoryId=${fid}`)).data,
  });

  const { data: recs } = useQuery<any[]>({
    queryKey: ['recs', fid],
    enabled: !!fid,
    queryFn: async () => (await api.get(`/recommendations?factoryId=${fid}`)).data,
  });

  const { data: cert } = useQuery<any>({
    queryKey: ['cert', fid],
    enabled: !!fid,
    queryFn: async () => (await api.get(`/certificates/latest?factoryId=${fid}`)).data,
  });

  const { data: notifs } = useQuery<any[]>({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
  });

  if (isLoading) return <Spin />;

  if (!factories || factories.length === 0) {
    return (
      <Card>
        <Empty description={t('dashboard.noAssessment')}>
          <Button type="primary" onClick={() => nav('/app/onboarding')}>{t('onboarding.submit')}</Button>
        </Empty>
      </Card>
    );
  }

  const latest = factory?.assessments?.[0];
  const scored = latest && latest.overallScore
    ? {
        overall: Number(latest.overallScore),
        process: Number(latest.processScore),
        technology: Number(latest.technologyScore),
        organization: Number(latest.organizationScore),
      }
    : null;

  const radarOption = scored ? {
    tooltip: {},
    radar: { indicator: [
      { name: t('dashboard.process'), max: 5 },
      { name: t('dashboard.technology'), max: 5 },
      { name: t('dashboard.organization'), max: 5 },
    ] },
    series: [{
      type: 'radar',
      data: [{
        value: [scored.process, scored.technology, scored.organization],
        name: t('dashboard.overallScore'),
        areaStyle: { color: 'rgba(0,108,53,0.3)' },
        lineStyle: { color: '#006C35' },
      }],
    }],
  } : null;

  const allInitiatives = (roadmap?.phases ?? []).flatMap((p: any) => p.initiatives ?? []);
  const activeInits = allInitiatives.filter((i: any) => i.status === 'IN_PROGRESS').length;
  const nextMilestone = allInitiatives
    .flatMap((i: any) => (i.milestones ?? []).map((m: any) => ({ ...m, initiativeName: i.titleEn })))
    .filter((m: any) => m.status === 'PENDING')
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const unreadNotifs = (notifs ?? []).filter((n: any) => !n.readAt).slice(0, 3);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t('dashboard.welcome')}, {user?.nameEn || user?.email}
        </Typography.Title>
        <Typography.Text type="secondary">
          {factory ? (i18n.language === 'ar' ? factory.nameAr : factory.nameEn) : ''}
          {factory?.region && ` • ${factory.region}`}
        </Typography.Text>
      </Card>

      {/* KPI row */}
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <div className="kpi-tile">
            <div className="kpi-value" style={{ color: '#006C35' }}>{scored ? scored.overall.toFixed(2) : '—'}</div>
            <div className="kpi-label">{t('dashboard.overallScore')}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="kpi-tile">
            <div className="kpi-value">{activeInits}</div>
            <div className="kpi-label">{t('dashboard.activeInitiatives')}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="kpi-tile">
            <div className="kpi-value">{recs?.length ?? 0}</div>
            <div className="kpi-label">{t('nav.recommendations')}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="kpi-tile">
            {factory?.sidfFinanced
              ? <Tag color="purple" style={{ fontSize: 13, padding: '4px 10px' }}>{t('dashboard.sidfFinanced')}</Tag>
              : factory?.sidfEligible
                ? <Tag color="green" style={{ fontSize: 13, padding: '4px 10px' }}>{t('dashboard.sidfEligible')}</Tag>
                : <Tag style={{ fontSize: 13, padding: '4px 10px' }}>{t('dashboard.sidfNotEligible')}</Tag>
            }
            <div className="kpi-label" style={{ marginTop: 8 }}>{t('dashboard.complianceStatus')}</div>
          </div>
        </Col>
      </Row>

      {/* Score radar + Latest assessment */}
      <Row gutter={16}>
        <Col xs={24} md={14}>
          <Card title={t('dashboard.overallScore')}>
            {radarOption ? (
              <ReactECharts option={radarOption} style={{ height: 340 }} />
            ) : (
              <Empty description={t('dashboard.noAssessment')}>
                <Button type="primary" onClick={() => nav('/app/factories')}>
                  {t('dashboard.startAssessment')}
                </Button>
              </Empty>
            )}
          </Card>
        </Col>

        <Col xs={24} md={10}>
          <Card title={t('dashboard.latestAssessment')}>
            {latest ? (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Tag color={latest.status === 'CERTIFIED' ? 'green' : latest.status === 'SUBMITTED' ? 'blue' : 'orange'}>
                    {t(`dashboard.${latest.status.toLowerCase()}`, { defaultValue: latest.status })}
                  </Tag>
                  <span style={{ marginInlineStart: 8 }}>v{latest.version}</span>
                  {cert && (
                    <Tag color="gold" style={{ marginInlineStart: 8 }}>
                      Certificate: {cert.verificationCode}
                    </Tag>
                  )}
                </div>

                <Space wrap>
                  <Button icon={<BarChartOutlined />} onClick={() => nav(`/app/factories/${fid}/gap-analysis`)}>
                    {t('dashboard.viewGapAnalysis')}
                  </Button>
                  <Button icon={<NodeIndexOutlined />} onClick={() => nav(`/app/factories/${fid}/roadmap`)}>
                    {t('dashboard.viewRoadmap')}
                  </Button>
                  <Button icon={<BulbOutlined />} onClick={() => nav(`/app/factories/${fid}/recommendations`)}>
                    {t('dashboard.viewRecommendations')}
                  </Button>
                  <Button icon={<SafetyCertificateOutlined />} onClick={() => nav(`/app/factories/${fid}/certificate`)}>
                    {t('dashboard.viewCertificate')}
                  </Button>
                  <Button icon={<RocketOutlined />} onClick={() => nav(`/app/factories/${fid}/benchmarks`)}>
                    {t('nav.benchmarks')}
                  </Button>
                  <Button
                    type="primary"
                    icon={<FileDoneOutlined />}
                    onClick={() => window.open(`/app/factories/${fid}/report`, '_blank')}
                  >
                    Executive Report
                  </Button>
                </Space>
              </Space>
            ) : (
              <Button type="primary" onClick={() => nav('/app/factories')}>
                {t('dashboard.startAssessment')}
              </Button>
            )}
          </Card>
        </Col>
      </Row>

      {/* Forecast + Sustainability */}
      {fid && scored && (
        <Row gutter={16}>
          <Col xs={24} lg={14}>
            <ForecastCard factoryId={fid} />
          </Col>
          <Col xs={24} lg={10}>
            <SustainabilityCard factoryId={fid} />
          </Col>
        </Row>
      )}

      {/* Achievements */}
      <Card>
        <Achievements
          factory={factory}
          assessmentsCount={factory?.assessments?.length ?? 0}
          hasRoadmap={!!roadmap}
          recsCount={recs?.length ?? 0}
          hasCertificate={!!cert}
          score={scored?.overall ?? null}
        />
      </Card>

      {/* Next milestone + recent notifications */}
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card title={<Space><NodeIndexOutlined /> {t('dashboard.nextMilestone')}</Space>}>
            {nextMilestone ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Typography.Text strong>
                  {i18n.language === 'ar' ? nextMilestone.titleAr : nextMilestone.titleEn}
                </Typography.Text>
                <Typography.Text type="secondary">
                  {t('roadmap.dueDate')}: {new Date(nextMilestone.dueDate).toLocaleDateString()}
                </Typography.Text>
                {roadmap && (
                  <Progress
                    percent={Math.round(
                      allInitiatives.reduce((a: number, b: any) => a + b.completionPercentage, 0) / (allInitiatives.length || 1),
                    )}
                  />
                )}
              </Space>
            ) : (
              <Empty description="No milestones" />
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title={<Space><BellOutlined /> {t('notifications.title')}</Space>} extra={<a onClick={() => nav('/app/notifications')}>View all</a>}>
            {unreadNotifs.length > 0 ? (
              <List
                dataSource={unreadNotifs}
                renderItem={(n: any) => (
                  <List.Item>
                    <List.Item.Meta
                      title={i18n.language === 'ar' ? n.titleAr : n.titleEn}
                      description={i18n.language === 'ar' ? n.bodyAr : n.bodyEn}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description={t('notifications.empty')} />
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
