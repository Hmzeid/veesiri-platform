import { Card, List, Typography, Tag, Button, Space, Empty } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const PRI: Record<string, string> = { CRITICAL: 'red', HIGH: 'orange', MEDIUM: 'blue', LOW: 'default' };

export default function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const nav = useNavigate();

  const { data } = useQuery<any[]>({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
  });

  const markAll = useMutation({
    mutationFn: async () => (await api.put('/notifications/read-all')).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) && qc.invalidateQueries({ queryKey: ['notif-count'] }) && qc.invalidateQueries({ queryKey: ['notif-recent'] }),
  });
  const markOne = useMutation({
    mutationFn: async (id: string) => (await api.put(`/notifications/${id}/read`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) && qc.invalidateQueries({ queryKey: ['notif-count'] }) && qc.invalidateQueries({ queryKey: ['notif-recent'] }),
  });

  const unreadCount = (data ?? []).filter((n) => !n.readAt).length;

  return (
    <Card
      title={
        <Space>
          <Typography.Title level={4} style={{ margin: 0 }}>{t('notifications.title')}</Typography.Title>
          <Tag color="blue">{unreadCount} {t('notifications.unread')}</Tag>
        </Space>
      }
      extra={<Button onClick={() => markAll.mutate()}>{t('notifications.markAllRead')}</Button>}
    >
      {!data || data.length === 0 ? (
        <Empty description={t('notifications.empty')} />
      ) : (
        <List
          dataSource={data}
          renderItem={(n) => (
            <List.Item
              style={{ background: n.readAt ? '#fff' : '#e6f3ec', padding: 12, borderRadius: 4, cursor: 'pointer' }}
              onClick={() => {
                if (!n.readAt) markOne.mutate(n.id);
                if (n.actionUrl) nav(n.actionUrl);
              }}
              actions={[
                <Tag color={PRI[n.priority] as any}>{n.priority}</Tag>,
                <Typography.Text type="secondary">{new Date(n.sentAt).toLocaleString()}</Typography.Text>,
              ]}
            >
              <List.Item.Meta
                title={i18n.language === 'ar' ? n.titleAr : n.titleEn}
                description={i18n.language === 'ar' ? n.bodyAr : n.bodyEn}
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}
