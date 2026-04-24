import { Card, Table, Tag, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

const scoreColor = (v: number) => v >= 4 ? '#059669' : v >= 3 ? '#84cc16' : v >= 2 ? '#eab308' : v >= 1 ? '#f97316' : '#dc2626';

export default function GovLeaderboardPage() {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();

  const { data } = useQuery<any[]>({
    queryKey: ['gov-leaderboard-full'],
    queryFn: async () => (await api.get('/gov/dashboard/leaderboard')).data,
  });

  return (
    <Card title={<Typography.Title level={4} style={{ margin: 0 }}>{t('gov.leaderboard')}</Typography.Title>}>
      <Table
        rowKey="id"
        dataSource={data ?? []}
        pagination={{ pageSize: 25 }}
        columns={[
          { title: '#', width: 50, render: (_: any, __: any, idx: number) => idx + 1 },
          {
            title: t('onboarding.nameEn'),
            render: (f: any) => (
              <a onClick={() => nav(`/gov/factories/${f.id}`)}>
                {i18n.language === 'ar' ? f.nameAr : f.nameEn}
              </a>
            ),
          },
          { title: t('onboarding.crNumber'), dataIndex: 'crNumber' },
          { title: t('onboarding.industryGroup'), dataIndex: 'industryGroup', render: (v: string) => t(`industry.${v}`) },
          { title: t('onboarding.region'), dataIndex: 'region' },
          {
            title: t('dashboard.overallScore'), dataIndex: 'overallScore',
            sorter: (a: any, b: any) => b.overallScore - a.overallScore,
            render: (v: number) => <Tag style={{ background: scoreColor(v), color: '#fff', fontWeight: 600 }}>{v.toFixed(2)}</Tag>,
          },
          { title: 'SIDF', dataIndex: 'sidfFinanced', render: (v: boolean) => (v ? <Tag color="green">Financed</Tag> : <Tag>—</Tag>) },
        ]}
      />
    </Card>
  );
}
