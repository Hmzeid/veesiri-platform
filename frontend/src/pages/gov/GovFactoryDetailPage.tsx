import { Card, Col, Row, Tag, Descriptions, Typography, Space, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactECharts from 'echarts-for-react';
import { api } from '../../api/client';

const scoreColor = (v: number) => v >= 4 ? '#059669' : v >= 3 ? '#84cc16' : v >= 2 ? '#eab308' : v >= 1 ? '#f97316' : '#dc2626';

export default function GovFactoryDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery<any>({
    queryKey: ['gov-factory', id],
    queryFn: async () => (await api.get(`/gov/factories/${id}`)).data,
  });

  if (isLoading || !data) return <Spin />;

  const latest = data.assessments?.[0];
  const overall = latest ? Number(latest.overallScore) : 0;
  const processS = latest ? Number(latest.processScore) : 0;
  const technology = latest ? Number(latest.technologyScore) : 0;
  const organization = latest ? Number(latest.organizationScore) : 0;

  const radarOption = latest && {
    radar: { indicator: [
      { name: t('dashboard.process'), max: 5 },
      { name: t('dashboard.technology'), max: 5 },
      { name: t('dashboard.organization'), max: 5 },
    ] },
    series: [{ type: 'radar', data: [{ value: [processS, technology, organization], name: 'Factory',
      areaStyle: { color: 'rgba(0,108,53,0.3)' }, lineStyle: { color: '#006C35' } }] }],
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {i18n.language === 'ar' ? data.nameAr : data.nameEn}
        </Typography.Title>
        <Space style={{ marginTop: 8 }}>
          <Tag>CR: {data.crNumber}</Tag>
          <Tag color="blue">{t(`industry.${data.industryGroup}`)}</Tag>
          <Tag>{t(`size.${data.sizeClassification}`)}</Tag>
          <Tag color="cyan">{data.region}</Tag>
          {data.sidfFinanced && <Tag color="purple">SIDF Financed</Tag>}
        </Space>
      </Card>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <div className="kpi-tile">
            <div className="kpi-value" style={{ color: scoreColor(overall) }}>{overall.toFixed(2)}</div>
            <div className="kpi-label">{t('dashboard.overallScore')}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="kpi-tile"><div className="kpi-value">{processS.toFixed(2)}</div><div className="kpi-label">{t('dashboard.process')}</div></div>
        </Col>
        <Col xs={12} md={6}>
          <div className="kpi-tile"><div className="kpi-value">{technology.toFixed(2)}</div><div className="kpi-label">{t('dashboard.technology')}</div></div>
        </Col>
        <Col xs={12} md={6}>
          <div className="kpi-tile"><div className="kpi-value">{organization.toFixed(2)}</div><div className="kpi-label">{t('dashboard.organization')}</div></div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card title={t('dashboard.overallScore')}>
            {radarOption && <ReactECharts option={radarOption} style={{ height: 320 }} />}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Factory Profile">
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label="Employees">{data.employeeCount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Revenue (SAR)">{data.annualRevenueSar ? Number(data.annualRevenueSar).toLocaleString() : '—'}</Descriptions.Item>
              <Descriptions.Item label="Founded">{data.foundingYear ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Region">{data.region}</Descriptions.Item>
              <Descriptions.Item label="City">{data.city}</Descriptions.Item>
              <Descriptions.Item label="Governorate">{data.governorate}</Descriptions.Item>
              <Descriptions.Item label="SIDF Eligible">{data.sidfEligible ? 'Yes' : 'No'}</Descriptions.Item>
              <Descriptions.Item label="SIDF Financing (SAR)">
                {data.sidfAmountSar ? Number(data.sidfAmountSar).toLocaleString() : '—'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {latest && (
        <Card title="Dimension Scores">
          <Row gutter={[8, 8]}>
            {latest.responses.map((r: any) => (
              <Col xs={12} md={6} key={r.dimensionCode}>
                <div style={{
                  padding: 12, borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#e2e8f0',
                }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>
                    {r.dimensionCode}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                    <div style={{
                      width: 32, height: 32,
                      background: scoreColor(r.rawScore), color: '#fff',
                      borderRadius: 6, display: 'grid', placeItems: 'center',
                      fontWeight: 700, fontSize: 14,
                    }}>
                      {r.rawScore}
                    </div>
                    <div style={{ fontSize: 12, color: '#cbd5e1' }}>
                      {t(`buildingBlock.${r.buildingBlock}`)}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {data.certificates?.length > 0 && (
        <Card title={t('certificate.title')}>
          <Typography.Paragraph>
            Code: <code>{data.certificates[0].verificationCode}</code> • Level {Number(data.certificates[0].siriLevelAchieved).toFixed(2)} •{' '}
            Valid until {new Date(data.certificates[0].expiryDate).toLocaleDateString()}
          </Typography.Paragraph>
        </Card>
      )}
    </Space>
  );
}
