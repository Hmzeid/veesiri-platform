import { Button, Card, Form, Input, Typography, message, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GlobalOutlined } from '@ant-design/icons';
import { api } from '../api/client';
import { useAuth } from '../store/auth';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const setAuth = useAuth((s) => s.setAuth);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const { data } = await api.post('/auth/login', values);
      const me = await api.get('/auth/me', { headers: { Authorization: `Bearer ${data.accessToken}` } });
      setAuth(data.accessToken, me.data);
      nav('/app/dashboard');
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16, background: '#f5f7fa' }}>
      <Card style={{ width: 400, maxWidth: '100%' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ textAlign: 'center' }}>
            <Typography.Title level={2} className="veesiri-brand" style={{ margin: 0 }}>
              {t('brand')}
            </Typography.Title>
            <Typography.Text type="secondary">{t('tagline')}</Typography.Text>
          </div>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="email" label={t('auth.email')} rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="password" label={t('auth.password')} rules={[{ required: true, min: 8 }]}>
              <Input.Password />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
              {t('auth.login')}
            </Button>
          </Form>
          <Typography.Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
            {t('auth.demoCreds')}
          </Typography.Text>
          <div style={{ textAlign: 'center' }}>
            <Typography.Text type="secondary">{t('auth.noAccount')} </Typography.Text>
            <Link to="/register">{t('auth.register')}</Link>
          </div>
          <Link to="/gov/login">
            <Button block>{t('auth.openGov')}</Button>
          </Link>
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
