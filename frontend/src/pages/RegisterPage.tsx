import { Button, Card, Form, Input, Typography, message, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { useAuth } from '../store/auth';

export default function RegisterPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const setAuth = useAuth((s) => s.setAuth);

  const onFinish = async (values: any) => {
    try {
      const { data } = await api.post('/auth/register', values);
      const me = await api.get('/auth/me', { headers: { Authorization: `Bearer ${data.accessToken}` } });
      setAuth(data.accessToken, me.data);
      nav('/app/onboarding');
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16, background: '#f5f7fa' }}>
      <Card style={{ width: 480, maxWidth: '100%' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Typography.Title level={3} className="veesiri-brand" style={{ margin: 0, textAlign: 'center' }}>
            {t('auth.register')}
          </Typography.Title>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="nameEn" label={t('auth.nameEn')}>
              <Input />
            </Form.Item>
            <Form.Item name="nameAr" label={t('auth.nameAr')}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label={t('auth.email')} rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label={t('auth.phone')}>
              <Input />
            </Form.Item>
            <Form.Item name="password" label={t('auth.password')} rules={[{ required: true, min: 8 }]}>
              <Input.Password />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
              {t('auth.register')}
            </Button>
          </Form>
          <div style={{ textAlign: 'center' }}>
            <Typography.Text type="secondary">{t('auth.haveAccount')} </Typography.Text>
            <Link to="/login">{t('auth.login')}</Link>
          </div>
        </Space>
      </Card>
    </div>
  );
}
