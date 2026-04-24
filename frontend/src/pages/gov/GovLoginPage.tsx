import { Button, Card, Form, Input, Typography, message, Space, Tag } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GlobalOutlined, BankOutlined } from '@ant-design/icons';
import { useGovAuth } from '../../store/gov';

export default function GovLoginPage() {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const login = useGovAuth((s) => s.login);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password);
      nav('/gov/dashboard');
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        background: 'linear-gradient(135deg, #1A2F4E 0%, #0d1a2e 100%)',
      }}
    >
      <Card style={{ width: 460, maxWidth: '100%' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ textAlign: 'center' }}>
            <BankOutlined style={{ fontSize: 40, color: '#006C35' }} />
            <Typography.Title level={3} style={{ margin: '12px 0 4px' }}>
              {t('gov.title')}
            </Typography.Title>
            <Typography.Text type="secondary">{t('gov.tagline')}</Typography.Text>
            <div style={{ marginTop: 8 }}>
              <Tag color="gold">Vision 2030</Tag>
              <Tag color="green">MIMR</Tag>
              <Tag color="blue">SIDF</Tag>
            </div>
          </div>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="email" label={t('auth.email')} rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="password" label={t('auth.password')} rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
              {t('auth.login')}
            </Button>
          </Form>
          <Typography.Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
            {t('auth.govCreds')}
          </Typography.Text>
          <div style={{ textAlign: 'center' }}>
            <Link to="/login">{t('auth.backToFactory')}</Link>
          </div>
          <Button
            type="text"
            icon={<GlobalOutlined />}
            onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
            block
          >
            {t('common.language')}
          </Button>
        </Space>
      </Card>
    </div>
  );
}
