import { Card, Col, Row, Typography, Tag, Button, Space, Switch, message } from 'antd';
import { ApiOutlined, CheckCircleFilled, PlusCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';

type Integration = {
  id: string;
  name: string;
  category: string;
  color: string;
  logo: string;
  description: string;
  official: boolean;
  connected: boolean;
  scopes: string[];
};

const INITIAL: Integration[] = [
  {
    id: 'sidf', name: 'SIDF', category: 'Government Financing', color: '#8b5cf6', logo: '🏦',
    description: 'Push SIRI scores and roadmap to SIDF for financing pre-qualification.',
    official: true, connected: true,
    scopes: ['Submit assessment', 'Receive status updates', 'Approved amount disclosure'],
  },
  {
    id: 'mimr', name: 'MIMR', category: 'Government Registry', color: '#006C35', logo: '🏛',
    description: 'Sync factory CR, licensing, and capacity data with the Ministry registry.',
    official: true, connected: true,
    scopes: ['Validate CR number', 'Push SIRI certification status', 'Pull licensed capacity'],
  },
  {
    id: 'absher', name: 'Absher', category: 'National Identity', color: '#0ea5e9', logo: '🪪',
    description: 'Verify factory owner identity via Saudi National ID / Iqama.',
    official: true, connected: true,
    scopes: ['Verify owner identity', 'Confirm entity authority'],
  },
  {
    id: 'saso', name: 'SASO', category: 'Standards', color: '#f59e0b', logo: '🛡',
    description: 'Validate SASO product certificates and align quality claims.',
    official: true, connected: false,
    scopes: ['Certificate lookup', 'Product conformity check'],
  },
  {
    id: 'zatca', name: 'ZATCA', category: 'Tax Authority', color: '#dc2626', logo: '💰',
    description: 'Future integration with Saudi tax authority for financial data exchange.',
    official: true, connected: false,
    scopes: ['e-Invoicing sync', 'VAT disclosure (opt-in)'],
  },
  {
    id: 'sap', name: 'SAP S/4HANA', category: 'ERP', color: '#0ea5e9', logo: '💼',
    description: 'Pull production, quality, and supply chain data from SAP.',
    official: false, connected: false,
    scopes: ['Production orders', 'Quality notifications', 'Inventory levels'],
  },
  {
    id: 'oracle', name: 'Oracle ERP Cloud', category: 'ERP', color: '#dc2626', logo: '🗄',
    description: 'Connect Oracle ERP for unified manufacturing analytics.',
    official: false, connected: false,
    scopes: ['Financial data', 'Manufacturing operations'],
  },
  {
    id: 'dynamics', name: 'Microsoft Dynamics 365', category: 'ERP', color: '#7c3aed', logo: '⚡',
    description: 'Pull operations data from Dynamics for auto-scoring.',
    official: false, connected: false,
    scopes: ['Operations', 'Finance', 'Supply chain'],
  },
  {
    id: 'power-bi', name: 'Power BI', category: 'Analytics', color: '#eab308', logo: '📊',
    description: 'Export VeeSIRI analytics to your Power BI workspace.',
    official: false, connected: false,
    scopes: ['Dataset export', 'Scheduled refresh'],
  },
  {
    id: 'webhooks', name: 'Webhooks', category: 'Developer', color: '#64748b', logo: '🔗',
    description: 'Get real-time event notifications pushed to your URL.',
    official: false, connected: true,
    scopes: ['assessment.submitted', 'certificate.issued', 'milestone.completed'],
  },
  {
    id: 'rest-api', name: 'REST API', category: 'Developer', color: '#059669', logo: '⚙️',
    description: 'Full programmatic access to VeeSIRI data via OAuth 2.0.',
    official: false, connected: true,
    scopes: ['Read factory data', 'Submit assessments', 'Manage roadmaps'],
  },
  {
    id: 'teams', name: 'Microsoft Teams', category: 'Communication', color: '#4f46e5', logo: '💬',
    description: 'Send SIRI alerts and milestone updates to Teams channels.',
    official: false, connected: false,
    scopes: ['Post messages', 'Weekly digest'],
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(INITIAL);

  const toggle = (id: string) => {
    setIntegrations((list) =>
      list.map((i) => {
        if (i.id !== id) return i;
        const next = { ...i, connected: !i.connected };
        message.success(next.connected ? `${i.name} connected` : `${i.name} disconnected`);
        return next;
      }),
    );
  };

  const connected = integrations.filter((i) => i.connected).length;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <ApiOutlined style={{ fontSize: 26, color: '#006C35' }} />
              <div>
                <Typography.Title level={3} style={{ margin: 0 }}>Integrations</Typography.Title>
                <Typography.Text type="secondary">
                  Connect VeeSIRI to your existing systems.
                </Typography.Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tag color="green" style={{ fontSize: 13, padding: '4px 10px' }}>
                <CheckCircleFilled /> {connected} connected
              </Tag>
              <Tag color="default">{integrations.length - connected} available</Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {integrations.map((i) => (
          <Col xs={24} md={12} lg={8} key={i.id}>
            <Card className="hover-lift" style={{ height: '100%' }}>
              <Space align="start" style={{ width: '100%' }}>
                <div
                  style={{
                    width: 56, height: 56,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${i.color}22 0%, ${i.color}44 100%)`,
                    color: i.color,
                    fontSize: 30,
                    display: 'grid', placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  {i.logo}
                </div>
                <div style={{ flex: 1 }}>
                  <Space>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {i.name}
                    </Typography.Title>
                    {i.official && <Tag color="gold">Official</Tag>}
                  </Space>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{i.category}</div>
                </div>
              </Space>
              <Typography.Paragraph style={{ marginTop: 12, color: 'var(--color-ink-500)' }}>
                {i.description}
              </Typography.Paragraph>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>SCOPES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                {i.scopes.map((s) => <Tag key={s} style={{ fontSize: 10 }}>{s}</Tag>)}
              </div>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Switch
                  checked={i.connected}
                  onChange={() => toggle(i.id)}
                  checkedChildren="Connected"
                  unCheckedChildren="Off"
                />
                {i.connected ? (
                  <Button size="small">Configure</Button>
                ) : (
                  <Button size="small" type="primary" icon={<PlusCircleOutlined />}>
                    Connect
                  </Button>
                )}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}
