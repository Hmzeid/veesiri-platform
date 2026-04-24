import { Card, Row, Col, Space, Tag, Typography, Empty } from 'antd';
import { EnvironmentOutlined, TeamOutlined, BankOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

type S = {
  composite: number;
  environmental: number;
  social: number;
  governance: number;
  estimatedCo2ReductionPct: number;
  estimatedEnergyReductionPct: number;
  peerMedian: number;
  peerTop25: number;
  rating: string;
};

const RATING_COLOR: Record<string, string> = {
  AAA: '#059669', AA: '#22c55e', A: '#84cc16', BBB: '#eab308', BB: '#f97316', B: '#dc2626',
};

export default function SustainabilityCard({ factoryId }: { factoryId: string }) {
  const { data } = useQuery<S | null>({
    queryKey: ['sustainability', factoryId],
    queryFn: async () => (await api.get(`/audit/sustainability?factoryId=${factoryId}`)).data,
    enabled: !!factoryId,
  });

  if (!data) return null;

  return (
    <Card
      title={
        <Space>
          <EnvironmentOutlined style={{ color: '#059669' }} />
          <span>ESG Sustainability Score</span>
          <Tag color="green">Companion metric</Tag>
        </Space>
      }
    >
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={8}>
          <div style={{
            padding: 18, background: `linear-gradient(135deg, ${RATING_COLOR[data.rating]}18 0%, ${RATING_COLOR[data.rating]}08 100%)`,
            borderRadius: 12, textAlign: 'center',
            border: `1px solid ${RATING_COLOR[data.rating]}40`,
          }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Rating
            </div>
            <div style={{
              fontSize: 52, fontWeight: 800, lineHeight: 1,
              color: RATING_COLOR[data.rating], marginTop: 4,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {data.rating}
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: '#0b1220', fontWeight: 600 }}>
              {data.composite.toFixed(2)} / 5.00
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
              Peer median {data.peerMedian.toFixed(2)} · Top 25% {data.peerTop25.toFixed(2)}
            </div>
          </div>
        </Col>
        <Col xs={24} md={16}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Pillar
              icon={<EnvironmentOutlined />}
              label="Environmental"
              value={data.environmental}
              color="#059669"
              tip="Digital efficiency + supply-chain + connectivity"
            />
            <Pillar
              icon={<TeamOutlined />}
              label="Social"
              value={data.social}
              color="#0ea5e9"
              tip="Talent readiness + cross-functional collaboration"
            />
            <Pillar
              icon={<BankOutlined />}
              label="Governance"
              value={data.governance}
              color="#8b5cf6"
              tip="Leadership + strategy + automation rigor"
            />
          </Space>
        </Col>
      </Row>

      <div style={{ marginTop: 16, padding: 12, background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
        <Typography.Text strong style={{ color: '#059669' }}>Estimated impact from closing SIRI gaps</Typography.Text>
        <Row gutter={16} style={{ marginTop: 8 }}>
          <Col span={12}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              CO₂e reduction potential
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>
              −{data.estimatedCo2ReductionPct}%
            </div>
          </Col>
          <Col span={12}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Energy use reduction potential
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>
              −{data.estimatedEnergyReductionPct}%
            </div>
          </Col>
        </Row>
      </div>
    </Card>
  );
}

function Pillar({ icon, label, value, color, tip }: { icon: React.ReactNode; label: string; value: number; color: string; tip: string }) {
  const pct = (value / 5) * 100;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ color, fontSize: 16 }}>{icon}</span>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{label}</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{value.toFixed(2)}</span>
      </div>
      <div style={{ background: '#f1f5f9', height: 6, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width 1s ease' }} />
      </div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{tip}</div>
    </div>
  );
}
