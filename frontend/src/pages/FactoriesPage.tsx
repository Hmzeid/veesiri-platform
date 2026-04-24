import { Card, Table, Tag, Button, Space, Typography, Empty } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';

type Factory = {
  id: string;
  nameEn: string;
  nameAr: string;
  crNumber: string;
  industryGroup: string;
  sizeClassification: string;
  city?: string;
  region?: string;
  status: string;
  sidfEligible: boolean;
  onboardingCompleted: boolean;
};

export default function FactoriesPage() {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['factories'],
    queryFn: async () => (await api.get<Factory[]>('/factories')).data,
  });

  const startAssessment = useMutation({
    mutationFn: async (factoryId: string) => (await api.post('/assessments', { factoryId })).data,
    onSuccess: (assessment, factoryId) => {
      qc.invalidateQueries({ queryKey: ['factories'] });
      nav(`/app/factories/${factoryId}/assessment/${assessment.id}`);
    },
  });

  const columns = [
    {
      title: t('onboarding.nameEn'),
      key: 'name',
      render: (_: any, f: Factory) => (i18n.language === 'ar' ? f.nameAr : f.nameEn),
    },
    { title: t('onboarding.crNumber'), dataIndex: 'crNumber', key: 'cr' },
    {
      title: t('onboarding.industryGroup'),
      dataIndex: 'industryGroup',
      key: 'ind',
      render: (v: string) => t(`industry.${v}`),
    },
    {
      title: t('onboarding.sizeClassification'),
      dataIndex: 'sizeClassification',
      key: 'size',
      render: (v: string) => t(`size.${v}`),
    },
    { title: t('onboarding.region'), dataIndex: 'region', key: 'region' },
    {
      title: 'SIDF',
      dataIndex: 'sidfEligible',
      key: 'sidf',
      render: (v: boolean) =>
        v ? <Tag color="green">Eligible</Tag> : <Tag>Review</Tag>,
    },
    {
      title: '',
      key: 'actions',
      render: (_: any, f: Factory) => (
        <Space>
          <Button type="primary" onClick={() => startAssessment.mutate(f.id)} loading={startAssessment.isPending}>
            {t('dashboard.startAssessment')}
          </Button>
          <Button onClick={() => nav(`/app/factories/${f.id}/gap-analysis`)}>
            {t('nav.gapAnalysis')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Typography.Title level={3} style={{ margin: 0 }}>{t('nav.factories')}</Typography.Title>
        <Button type="primary" onClick={() => nav('/app/onboarding')}>+ {t('nav.onboarding')}</Button>
      </Space>
      {data && data.length === 0 ? (
        <Empty description={t('dashboard.noAssessment')}>
          <Button type="primary" onClick={() => nav('/app/onboarding')}>{t('onboarding.submit')}</Button>
        </Empty>
      ) : (
        <Table<Factory>
          rowKey="id"
          loading={isLoading}
          dataSource={data}
          columns={columns as any}
          pagination={{ pageSize: 10 }}
        />
      )}
    </Card>
  );
}
