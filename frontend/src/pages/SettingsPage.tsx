import { Card, Col, Row, Typography, Form, Input, Button, Space, Switch, Radio, Divider, Tag, message, Avatar } from 'antd';
import { UserOutlined, BellOutlined, GlobalOutlined, SafetyOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/auth';

export default function SettingsPage() {
  const user = useAuth((s) => s.user);
  const { i18n, t } = useTranslation();
  const [hijri, setHijri] = useState(false);
  const [notifs, setNotifs] = useState({
    assessmentExpiry: true,
    milestoneDue: true,
    documentExpiry: true,
    sidfUpdate: true,
    complianceAlert: true,
    weeklyDigest: false,
  });
  const [channels, setChannels] = useState({ inApp: true, email: true, sms: false, whatsapp: false });
  const [quietHours, setQuietHours] = useState(false);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space align="center">
          <Avatar size={56} style={{ background: '#1A2F4E' }}>
            {(user?.nameEn || user?.email || '?').charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>Settings</Typography.Title>
            <Typography.Text type="secondary">
              Manage your profile, notifications, and preferences.
            </Typography.Text>
          </div>
        </Space>
      </Card>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card title={<Space><UserOutlined /> Profile</Space>}>
            <Form layout="vertical" initialValues={user ?? {}}>
              <Form.Item name="nameEn" label="Full name (English)">
                <Input />
              </Form.Item>
              <Form.Item name="nameAr" label="Full name (Arabic)">
                <Input />
              </Form.Item>
              <Form.Item name="email" label="Email">
                <Input disabled />
              </Form.Item>
              <Form.Item name="phone" label="Phone">
                <Input placeholder="+966 5x xxx xxxx" />
              </Form.Item>
              <Button type="primary" onClick={() => message.success('Profile updated (demo)')}>
                Save changes
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title={<Space><GlobalOutlined /> Preferences</Space>}>
            <div style={{ marginBottom: 16 }}>
              <Typography.Text strong>Language</Typography.Text>
              <div style={{ marginTop: 6 }}>
                <Radio.Group
                  value={i18n.language}
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                >
                  <Radio.Button value="en">English</Radio.Button>
                  <Radio.Button value="ar">العربية</Radio.Button>
                </Radio.Group>
              </div>
            </div>
            <Divider />
            <div style={{ marginBottom: 16 }}>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <div>
                  <Typography.Text strong>Hijri calendar</Typography.Text>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Display Hijri dates alongside Gregorian in reports.
                  </div>
                </div>
                <Switch checked={hijri} onChange={setHijri} />
              </Space>
            </div>
            <Divider />
            <div style={{ marginBottom: 16 }}>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <div>
                  <Typography.Text strong>Prayer-time quiet hours</Typography.Text>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Delay non-critical notifications during the 5 daily prayer times.
                  </div>
                </div>
                <Switch checked={quietHours} onChange={setQuietHours} />
              </Space>
            </div>
          </Card>

          <Card title={<Space><BellOutlined /> Notifications</Space>} style={{ marginTop: 16 }}>
            <Typography.Text strong>Channels</Typography.Text>
            <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
              {[
                { k: 'inApp', label: 'In-app' },
                { k: 'email', label: 'Email' },
                { k: 'sms', label: 'SMS' },
                { k: 'whatsapp', label: 'WhatsApp' },
              ].map((c) => (
                <div key={c.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{c.label}</span>
                  <Switch
                    checked={(channels as any)[c.k]}
                    onChange={(v) => setChannels((s) => ({ ...s, [c.k]: v }))}
                  />
                </div>
              ))}
            </div>
            <Divider />
            <Typography.Text strong>Event types</Typography.Text>
            <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
              {Object.entries(notifs).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}</span>
                  <Switch checked={v} onChange={(v2) => setNotifs((s) => ({ ...s, [k]: v2 }))} />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card title={<Space><SafetyOutlined /> Security</Space>}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Typography.Text strong>Multi-factor authentication</Typography.Text>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Add an extra layer of security via Absher-linked OTP.
                </div>
                <Button type="primary" style={{ marginTop: 8 }}>Enable MFA</Button>
              </div>
              <Divider />
              <div>
                <Typography.Text strong>Active sessions</Typography.Text>
                <div
                  style={{
                    marginTop: 8, padding: 10, background: '#f8fafc', borderRadius: 8,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13 }}>Chrome on Windows · Riyadh, KSA</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Started now · This device</div>
                  </div>
                  <Tag color="green">Current</Tag>
                </div>
              </div>
              <Divider />
              <div>
                <Typography.Text strong>Change password</Typography.Text>
                <div style={{ marginTop: 8 }}>
                  <Button>Request password reset</Button>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title={<Space><CreditCardOutlined /> Subscription</Space>}>
            <Tag color="green" style={{ fontSize: 13, padding: '4px 10px' }}>Professional Plan</Tag>
            <div style={{ marginTop: 16 }}>
              <Typography.Text type="secondary">Billing period</Typography.Text>
              <div style={{ fontSize: 20, fontWeight: 700 }}>SAR 4,900 / month</div>
            </div>
            <div style={{ marginTop: 16 }}>
              <Typography.Text type="secondary">Usage this cycle</Typography.Text>
              <div style={{ marginTop: 6, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                <UsageRow label="Factories" used={3} limit={3} />
                <UsageRow label="Active assessments" used={2} limit={10} />
                <UsageRow label="Documents (GB)" used={8.4} limit={25} />
                <UsageRow label="AI chat queries" used={47} limit={500} />
              </div>
            </div>
            <Space style={{ marginTop: 16 }}>
              <Button type="primary">Upgrade to Enterprise</Button>
              <Button>Download invoice</Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

function UsageRow({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = (used / limit) * 100;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600 }}>{used} / {limit}</span>
      </div>
      <div style={{ background: '#e5e7eb', height: 6, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, pct)}%`,
          background: pct > 85 ? '#dc2626' : pct > 60 ? '#f97316' : '#006C35',
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}
