import { Card, Col, Row, Tag, Typography, Space, Table, Button, Empty, List } from 'antd';
import { FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';

export default function DocumentsPage() {
  const { factoryId } = useParams();
  const { t, i18n } = useTranslation();

  const { data: docs } = useQuery<any[]>({
    queryKey: ['docs', factoryId],
    queryFn: async () => (await api.get(`/documents?factoryId=${factoryId}`)).data,
  });
  const { data: folders } = useQuery<any[]>({
    queryKey: ['folders', factoryId],
    queryFn: async () => (await api.get(`/documents/folders?factoryId=${factoryId}`)).data,
  });
  const { data: expiring } = useQuery<any[]>({
    queryKey: ['expiring', factoryId],
    queryFn: async () => (await api.get(`/documents/expiring?factoryId=${factoryId}&days=90`)).data,
  });

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Typography.Title level={3} style={{ margin: 0 }}>{t('documents.title')}</Typography.Title>
      </Card>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Card title={t('documents.folders')}>
            <List
              size="small"
              dataSource={folders ?? []}
              renderItem={(f: any) => (
                <List.Item>
                  <FileTextOutlined style={{ marginInlineEnd: 8 }} />
                  {i18n.language === 'ar' ? f.nameAr : f.nameEn}
                  {f.isSystemFolder && <Tag style={{ marginInlineStart: 'auto' }}>system</Tag>}
                </List.Item>
              )}
            />
          </Card>

          {expiring && expiring.length > 0 && (
            <Card title={<Space><ClockCircleOutlined /> {t('documents.expiringSoon')}</Space>} style={{ marginTop: 16 }}>
              <List
                size="small"
                dataSource={expiring}
                renderItem={(d: any) => (
                  <List.Item>
                    <Typography.Text ellipsis>{d.nameEn}</Typography.Text>
                    <Tag color="orange">{new Date(d.expiryDate).toLocaleDateString()}</Tag>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Col>

        <Col xs={24} md={18}>
          <Card>
            {docs && docs.length > 0 ? (
              <Table
                rowKey="id"
                dataSource={docs}
                pagination={{ pageSize: 15 }}
                columns={[
                  {
                    title: t('documents.type'), dataIndex: 'documentType', width: 140,
                    render: (v: string) => <Tag>{v}</Tag>,
                  },
                  {
                    title: t('onboarding.nameEn'),
                    render: (d: any) => (
                      <a href={d.fileUrl} target="_blank" rel="noreferrer">
                        {i18n.language === 'ar' ? (d.nameAr || d.nameEn) : d.nameEn}
                      </a>
                    ),
                  },
                  { title: t('documents.size'), dataIndex: 'fileSizeBytes', width: 100, render: (v: number) => `${Math.round(v / 1024)} KB` },
                  {
                    title: t('documents.tags'), dataIndex: 'dimensionTags',
                    render: (tags: string[]) => tags.map((x) => <Tag key={x}>{x}</Tag>),
                  },
                  {
                    title: t('documents.expiry'), dataIndex: 'expiryDate',
                    render: (v: string) => v ? new Date(v).toLocaleDateString() : '—',
                  },
                  {
                    title: t('documents.uploadedAt'), dataIndex: 'uploadedAt',
                    render: (v: string) => new Date(v).toLocaleDateString(),
                  },
                ]}
              />
            ) : (
              <Empty description={t('documents.empty')} />
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
