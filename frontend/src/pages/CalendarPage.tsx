import { useMemo, useState } from 'react';
import { Card, Typography, Badge, Button, Space, Tag, Empty, Popover } from 'antd';
import { LeftOutlined, RightOutlined, CalendarOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';

type Event = {
  id: string;
  titleAr: string;
  titleEn: string;
  date: Date;
  status: string;
  phase: number;
  initiativeTitleEn: string;
  initiativeTitleAr: string;
};

export default function CalendarPage() {
  const { factoryId } = useParams();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [cursor, setCursor] = useState(new Date());

  const { data: roadmap } = useQuery<any>({
    queryKey: ['roadmap', factoryId],
    queryFn: async () => (await api.get(`/roadmaps/latest?factoryId=${factoryId}`)).data,
  });

  const events: Event[] = useMemo(() => {
    const out: Event[] = [];
    for (const p of roadmap?.phases ?? []) {
      for (const i of p.initiatives ?? []) {
        for (const m of i.milestones ?? []) {
          out.push({
            id: m.id,
            titleAr: m.titleAr,
            titleEn: m.titleEn,
            date: new Date(m.dueDate),
            status: m.status,
            phase: p.phaseNumber,
            initiativeTitleEn: i.titleEn,
            initiativeTitleAr: i.titleAr,
          });
        }
      }
    }
    return out;
  }, [roadmap]);

  // Build month grid
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const startDayOfWeek = firstOfMonth.getDay();
  const daysInMonth = lastOfMonth.getDate();

  const cells: { date: Date | null; events: Event[] }[] = [];
  for (let i = 0; i < startDayOfWeek; i++) cells.push({ date: null, events: [] });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dayEvents = events.filter((e) => e.date.toDateString() === date.toDateString());
    cells.push({ date, events: dayEvents });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, events: [] });

  const monthLabel = cursor.toLocaleString(i18n.language === 'ar' ? 'ar' : 'en', { month: 'long', year: 'numeric' });

  const statusColor = (s: string) => s === 'COMPLETED' ? '#059669' : s === 'OVERDUE' ? '#dc2626' : '#0ea5e9';

  const upcoming = events
    .filter((e) => e.status === 'PENDING' && e.date > new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Space>
            <CalendarOutlined style={{ fontSize: 24, color: '#006C35' }} />
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>Milestone Calendar</Typography.Title>
              <Typography.Text type="secondary">
                {events.length} milestones · {events.filter((e) => e.status === 'COMPLETED').length} completed
              </Typography.Text>
            </div>
          </Space>
          <Space>
            <Button icon={<LeftOutlined />} onClick={() => setCursor(new Date(year, month - 1, 1))} />
            <Typography.Text strong style={{ minWidth: 150, textAlign: 'center', display: 'inline-block' }}>
              {monthLabel}
            </Typography.Text>
            <Button icon={<RightOutlined />} onClick={() => setCursor(new Date(year, month + 1, 1))} />
            <Button onClick={() => setCursor(new Date())}>Today</Button>
          </Space>
        </Space>
      </Card>

      {!roadmap ? (
        <Card><Empty description="No roadmap — generate one from the Gap Analysis page first." /></Card>
      ) : (
        <>
          <Card bodyStyle={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e5e7eb' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} style={{ padding: 10, fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center' }}>
                  {d}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {cells.map((c, i) => {
                const isToday = c.date && c.date.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={i}
                    style={{
                      minHeight: 110,
                      padding: 8,
                      border: '1px solid #f1f5f9',
                      background: c.date ? '#fff' : '#fafafa',
                      position: 'relative',
                    }}
                  >
                    {c.date && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div
                          style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: isToday ? '#006C35' : 'transparent',
                            color: isToday ? '#fff' : '#0b1220',
                            display: 'grid', placeItems: 'center',
                            fontWeight: 700, fontSize: 12,
                          }}
                        >
                          {c.date.getDate()}
                        </div>
                        {c.events.length > 0 && (
                          <span style={{ fontSize: 10, color: '#64748b' }}>
                            {c.events.length} events
                          </span>
                        )}
                      </div>
                    )}
                    {c.events.slice(0, 3).map((e) => (
                      <Popover
                        key={e.id}
                        title={isAr ? e.titleAr : e.titleEn}
                        content={
                          <div style={{ maxWidth: 260 }}>
                            <div style={{ fontSize: 12, color: '#64748b' }}>Initiative:</div>
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>
                              {isAr ? e.initiativeTitleAr : e.initiativeTitleEn}
                            </div>
                            <Tag color="blue">Phase {e.phase}</Tag>
                            <Tag color={e.status === 'COMPLETED' ? 'green' : 'orange'}>{e.status}</Tag>
                          </div>
                        }
                      >
                        <div
                          style={{
                            padding: '3px 6px',
                            borderRadius: 4,
                            background: statusColor(e.status) + '22',
                            borderInlineStart: `3px solid ${statusColor(e.status)}`,
                            fontSize: 11,
                            marginBottom: 3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                          }}
                        >
                          {e.status === 'COMPLETED' && <CheckCircleFilled style={{ color: '#059669', marginInlineEnd: 4 }} />}
                          {isAr ? e.titleAr : e.titleEn}
                        </div>
                      </Popover>
                    ))}
                    {c.events.length > 3 && (
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                        +{c.events.length - 3} more
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Next 5 milestones">
            {upcoming.length === 0 ? (
              <Empty description="No upcoming milestones" />
            ) : (
              <Space direction="vertical" style={{ width: '100%' }}>
                {upcoming.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: 12, background: '#f8fafc', borderRadius: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 46, height: 46, borderRadius: 10,
                        background: '#fff', border: '1px solid #e5e7eb',
                        display: 'grid', placeItems: 'center',
                      }}
                    >
                      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>
                        {e.date.toLocaleString('en', { month: 'short' }).toUpperCase()}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>
                        {e.date.getDate()}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{isAr ? e.titleAr : e.titleEn}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {isAr ? e.initiativeTitleAr : e.initiativeTitleEn}
                      </div>
                    </div>
                    <Tag>Phase {e.phase}</Tag>
                    <Badge status="processing" text={Math.ceil((e.date.getTime() - Date.now()) / 86400000) + 'd'} />
                  </div>
                ))}
              </Space>
            )}
          </Card>
        </>
      )}
    </Space>
  );
}
