import { useState, useMemo } from 'react';
import { Card, Typography, Tag, Space, Empty, Input, Select, Timeline, Button } from 'antd';
import {
  AuditOutlined, SearchOutlined, DownloadOutlined,
  FileDoneOutlined, BarChartOutlined, NodeIndexOutlined, CheckCircleOutlined,
  SafetyCertificateOutlined, BulbOutlined, BellOutlined, FolderOpenOutlined, TeamOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSelectedFactory } from '../store/selectedFactory';
import { api } from '../api/client';

type Event = {
  at: string;
  type: string;
  actor: string;
  details: string;
  category: 'assessment' | 'gap' | 'roadmap' | 'milestone' | 'certificate' | 'recommendation' | 'notification' | 'document' | 'team';
  severity: 'info' | 'success' | 'warning' | 'critical';
};

const CAT_ICON: Record<string, React.ReactNode> = {
  assessment: <FileDoneOutlined />,
  gap: <BarChartOutlined />,
  roadmap: <NodeIndexOutlined />,
  milestone: <CheckCircleOutlined />,
  certificate: <SafetyCertificateOutlined />,
  recommendation: <BulbOutlined />,
  notification: <BellOutlined />,
  document: <FolderOpenOutlined />,
  team: <TeamOutlined />,
};

const SEV_COLOR: Record<string, string> = {
  info: 'blue',
  success: 'green',
  warning: 'orange',
  critical: 'red',
};

export default function AuditLogPage() {
  const fid = useSelectedFactory((s) => s.factoryId);
  const { i18n } = useTranslation();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string | undefined>();

  const { data, isLoading } = useQuery<Event[]>({
    queryKey: ['audit-log', fid],
    enabled: !!fid,
    queryFn: async () => (await api.get(`/audit/log?factoryId=${fid}`)).data,
  });

  const filtered = useMemo(() => {
    let f = data ?? [];
    if (category) f = f.filter((e) => e.category === category);
    if (q.trim()) {
      const n = q.toLowerCase();
      f = f.filter((e) => (e.details + ' ' + e.type + ' ' + e.actor).toLowerCase().includes(n));
    }
    return f;
  }, [data, q, category]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!fid) return <Card><Empty description="Select a factory first." /></Card>;
  if (isLoading) return <Card loading />;

  // Group by date for readability
  const groups = new Map<string, Event[]>();
  for (const e of filtered) {
    const date = new Date(e.at).toLocaleDateString(i18n.language === 'ar' ? 'ar' : 'en', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
    });
    if (!groups.has(date)) groups.set(date, []);
    groups.get(date)!.push(e);
  }

  const categories = Array.from(new Set((data ?? []).map((e) => e.category)));

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Space>
            <AuditOutlined style={{ fontSize: 24, color: '#006C35' }} />
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>Audit Log</Typography.Title>
              <Typography.Text type="secondary">
                Every recorded action on this factory · PDPL-aligned
              </Typography.Text>
            </div>
          </Space>
          <Space wrap>
            <Tag color="blue">{filtered.length} events</Tag>
            <Button icon={<DownloadOutlined />} onClick={exportJson}>Export JSON</Button>
          </Space>
        </Space>
      </Card>

      <Card>
        <Space wrap style={{ width: '100%' }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search events..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            placeholder="Category"
            style={{ width: 180 }}
            value={category}
            onChange={setCategory}
            allowClear
            options={categories.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
          />
        </Space>
      </Card>

      {filtered.length === 0 ? (
        <Card><Empty description="No audit events match your filters." /></Card>
      ) : (
        Array.from(groups.entries()).map(([date, events]) => (
          <Card
            key={date}
            title={<span style={{ color: '#0b1220' }}>{date}</span>}
            size="small"
          >
            <Timeline
              items={events.map((e) => {
                const time = new Date(e.at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
                return {
                  dot: (
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: e.severity === 'success' ? '#d1fae5'
                        : e.severity === 'warning' ? '#fed7aa'
                        : e.severity === 'critical' ? '#fecaca' : '#dbeafe',
                      color: e.severity === 'success' ? '#059669'
                        : e.severity === 'warning' ? '#ea580c'
                        : e.severity === 'critical' ? '#dc2626' : '#2563eb',
                      display: 'grid', placeItems: 'center',
                    }}>
                      {CAT_ICON[e.category]}
                    </div>
                  ),
                  children: (
                    <div>
                      <Space wrap style={{ marginBottom: 4 }}>
                        <Tag color={SEV_COLOR[e.severity]} style={{ margin: 0 }}>{e.type}</Tag>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {time} · by {e.actor}
                        </Typography.Text>
                      </Space>
                      <div style={{ fontSize: 14 }}>{e.details}</div>
                    </div>
                  ),
                };
              })}
            />
          </Card>
        ))
      )}
    </Space>
  );
}
