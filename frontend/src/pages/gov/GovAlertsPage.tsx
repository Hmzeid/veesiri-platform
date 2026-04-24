import { Card, Table, Tag, Button, Space, Typography, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

const SEV_COLOR: Record<string, string> = { HIGH: 'red', MEDIUM: 'orange', LOW: 'gold' };

export default function GovAlertsPage() {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data } = useQuery<any[]>({
    queryKey: ['gov-alerts'],
    queryFn: async () => (await api.get('/gov/alerts')).data,
  });

  const resolve = useMutation({
    mutationFn: async (id: string) => (await api.put(`/gov/alerts/${id}/resolve`)).data,
    onSuccess: () => {
      message.success(t('gov.resolved'));
      qc.invalidateQueries({ queryKey: ['gov-alerts'] });
    },
  });

  return (
    <Card title={<Typography.Title level={4} style={{ margin: 0 }}>{t('gov.alerts')}</Typography.Title>}>
      <Table
        rowKey="id"
        dataSource={data ?? []}
        pagination={{ pageSize: 20 }}
        columns={[
          {
            title: t('gov.alertSeverity.HIGH').replace('High', 'Severity'),
            dataIndex: 'severity',
            render: (v: string) => <Tag color={SEV_COLOR[v]}>{t(`gov.alertSeverity.${v}`)}</Tag>,
          },
          { title: 'Type', dataIndex: 'alertType', render: (v: string) => t(`gov.alertType.${v}`) },
          {
            title: t('onboarding.nameEn'),
            render: (a: any) => (
              <a onClick={() => nav(`/gov/factories/${a.factory.id}`)}>
                {i18n.language === 'ar' ? a.factory.nameAr : a.factory.nameEn}
              </a>
            ),
          },
          { title: t('onboarding.region'), render: (a: any) => a.factory.region },
          { title: 'Description', dataIndex: i18n.language === 'ar' ? 'descriptionAr' : 'descriptionEn' },
          {
            title: '',
            render: (a: any) => (
              <Button type="primary" loading={resolve.isPending} onClick={() => resolve.mutate(a.id)}>
                {t('gov.resolve')}
              </Button>
            ),
          },
        ]}
      />
    </Card>
  );
}
