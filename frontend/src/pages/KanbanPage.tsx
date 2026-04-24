import { useState, useEffect } from 'react';
import { Card, Typography, Tag, Space, Button, message, Empty, Progress } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';

const COLUMNS = [
  { id: 'PLANNED', label: 'Planned', color: '#94a3b8' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: '#0ea5e9' },
  { id: 'COMPLETED', label: 'Completed', color: '#059669' },
] as const;

type Initiative = {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  dimensionCode: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  completionPercentage: number;
  budgetSar: string;
  sidfEligible: boolean;
  phaseNumber: number;
};

export default function KanbanPage() {
  const { factoryId } = useParams();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const qc = useQueryClient();
  const [dragId, setDragId] = useState<string | null>(null);

  const { data: roadmap } = useQuery<any>({
    queryKey: ['roadmap', factoryId],
    queryFn: async () => (await api.get(`/roadmaps/latest?factoryId=${factoryId}`)).data,
  });

  const [cards, setCards] = useState<Initiative[]>([]);
  useEffect(() => {
    if (!roadmap) return;
    const all: Initiative[] = [];
    for (const p of roadmap.phases ?? []) {
      for (const i of p.initiatives ?? []) {
        all.push({ ...i, phaseNumber: p.phaseNumber });
      }
    }
    setCards(all);
  }, [roadmap]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' }) => {
      const percent = status === 'COMPLETED' ? 100 : status === 'IN_PROGRESS' ? Math.max(25, (cards.find(c => c.id === id)?.completionPercentage ?? 25)) : 0;
      return (await api.put(`/roadmaps/initiatives/${id}/progress`, { percent })).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roadmap', factoryId] });
      message.success('Status updated');
    },
    onError: () => message.error('Failed to update'),
  });

  const moveCard = (id: string, to: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED') => {
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, status: to } : c)));
    updateStatus.mutate({ id, status: to });
  };

  if (!roadmap) return <Card><Empty description="No roadmap yet." /></Card>;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space>
          <AppstoreOutlined style={{ fontSize: 24, color: '#006C35' }} />
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>Initiatives Board</Typography.Title>
            <Typography.Text type="secondary">
              Drag an initiative across columns to update its status.
            </Typography.Text>
          </div>
        </Space>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLUMNS.length}, 1fr)`, gap: 16 }}>
        {COLUMNS.map((col) => {
          const colCards = cards.filter((c) => c.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) {
                  moveCard(dragId, col.id);
                  setDragId(null);
                }
              }}
              style={{
                background: '#f8fafc',
                borderRadius: 14,
                padding: 12,
                minHeight: 400,
                border: `2px dashed ${col.color}33`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', marginBottom: 10 }}>
                <Space>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: col.color }} />
                  <Typography.Text strong>{col.label}</Typography.Text>
                </Space>
                <Tag>{colCards.length}</Tag>
              </div>
              {colCards.length === 0 ? (
                <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
                  No initiatives
                </div>
              ) : (
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  {colCards.map((c) => (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={() => setDragId(c.id)}
                      onDragEnd={() => setDragId(null)}
                      style={{
                        background: '#fff',
                        borderRadius: 10,
                        padding: 14,
                        boxShadow: dragId === c.id ? '0 0 0 2px #006C35' : 'var(--shadow-xs)',
                        cursor: 'grab',
                        borderInlineStart: `4px solid ${col.color}`,
                        opacity: dragId === c.id ? 0.6 : 1,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Space style={{ marginBottom: 6 }}>
                        <Tag color="blue">{c.dimensionCode}</Tag>
                        <Tag>P{c.phaseNumber}</Tag>
                        {c.sidfEligible && <Tag color="purple">SIDF</Tag>}
                      </Space>
                      <Typography.Text strong style={{ display: 'block', marginBottom: 4 }}>
                        {isAr ? c.titleAr : c.titleEn}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                        SAR {(Number(c.budgetSar) / 1000).toFixed(0)}k
                      </Typography.Text>
                      <Progress percent={c.completionPercentage} size="small" style={{ marginTop: 8 }} />
                      <Space size={4} style={{ marginTop: 10 }}>
                        {COLUMNS.filter((x) => x.id !== col.id).map((x) => (
                          <Button
                            key={x.id}
                            size="small"
                            onClick={() => moveCard(c.id, x.id as any)}
                            style={{ fontSize: 10, padding: '0 8px', height: 22 }}
                          >
                            → {x.label}
                          </Button>
                        ))}
                      </Space>
                    </div>
                  ))}
                </Space>
              )}
            </div>
          );
        })}
      </div>
    </Space>
  );
}
