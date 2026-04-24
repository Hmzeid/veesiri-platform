import { Card, Col, Row, Tag, Typography, Space, Button, Empty, message } from 'antd';
import { LikeOutlined, DislikeOutlined, BulbOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';

const TYPE_COLOR: Record<string, string> = {
  ACTION: 'blue', TECHNOLOGY: 'geekblue', VENDOR: 'purple', INITIATIVE: 'green', LEARNING: 'cyan',
};

export default function RecommendationsPage() {
  const { factoryId } = useParams();
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<any[]>({
    queryKey: ['recs', factoryId],
    queryFn: async () => (await api.get(`/recommendations?factoryId=${factoryId}`)).data,
  });

  const feedback = useMutation({
    mutationFn: async (payload: { id: string; value: 'helpful' | 'not_helpful' }) =>
      (await api.put(`/recommendations/${payload.id}/feedback`, { value: payload.value })).data,
    onSuccess: () => {
      message.success(t('recommendations.thankFeedback'));
      qc.invalidateQueries({ queryKey: ['recs', factoryId] });
    },
  });

  if (isLoading) return <Card loading />;
  if (!data || data.length === 0) return <Card><Empty description={t('recommendations.empty')} /></Card>;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space>
          <BulbOutlined style={{ fontSize: 24, color: '#006C35' }} />
          <Typography.Title level={3} style={{ margin: 0 }}>{t('recommendations.title')}</Typography.Title>
          <Tag color="gold">{data.length}</Tag>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {data.map((r: any) => {
          const title = i18n.language === 'ar' ? r.titleAr : r.titleEn;
          const desc = i18n.language === 'ar' ? r.descriptionAr : r.descriptionEn;
          const rationale = i18n.language === 'ar' ? r.rationaleAr : r.rationaleEn;
          const impact = Number(r.estimatedImpactScore);
          const cost = Number(r.estimatedCostSar);
          const confidence = Number(r.confidenceScore);
          return (
            <Col xs={24} md={12} key={r.id}>
              <Card>
                <Space style={{ marginBottom: 8 }}>
                  <Tag color={TYPE_COLOR[r.recommendationType]}>{t(`recommendations.type.${r.recommendationType}`)}</Tag>
                  <Tag>{r.dimensionCode}</Tag>
                </Space>
                <Typography.Title level={5} style={{ marginTop: 4 }}>{title}</Typography.Title>
                <Typography.Paragraph type="secondary">{desc}</Typography.Paragraph>

                <Row gutter={12} style={{ marginTop: 8 }}>
                  <Col span={8}>
                    <Typography.Text type="secondary">{t('recommendations.impact')}</Typography.Text>
                    <div style={{ fontSize: 20, fontWeight: 600, color: '#006C35' }}>+{impact.toFixed(2)}</div>
                  </Col>
                  <Col span={8}>
                    <Typography.Text type="secondary">{t('recommendations.cost')}</Typography.Text>
                    <div style={{ fontSize: 20, fontWeight: 600 }}>SAR {(cost / 1000).toFixed(0)}k</div>
                  </Col>
                  <Col span={8}>
                    <Typography.Text type="secondary">{t('recommendations.confidence')}</Typography.Text>
                    <div style={{ fontSize: 20, fontWeight: 600 }}>{(confidence * 100).toFixed(0)}%</div>
                  </Col>
                </Row>

                {rationale && (
                  <>
                    <Typography.Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
                      {t('recommendations.rationale')}
                    </Typography.Text>
                    <Typography.Paragraph style={{ margin: 0, fontSize: 13, background: '#f9fafb', padding: 8, borderRadius: 4 }}>
                      {rationale}
                    </Typography.Paragraph>
                  </>
                )}

                <Space style={{ marginTop: 12 }}>
                  <Button
                    icon={<LikeOutlined />}
                    type={r.userFeedback === 'helpful' ? 'primary' : 'default'}
                    onClick={() => feedback.mutate({ id: r.id, value: 'helpful' })}
                  >
                    {t('recommendations.helpful')}
                  </Button>
                  <Button
                    icon={<DislikeOutlined />}
                    danger={r.userFeedback === 'not_helpful'}
                    onClick={() => feedback.mutate({ id: r.id, value: 'not_helpful' })}
                  >
                    {t('recommendations.notHelpful')}
                  </Button>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Space>
  );
}
