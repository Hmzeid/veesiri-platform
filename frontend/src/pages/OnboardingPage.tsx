import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Typography, message, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';

const INDUSTRY_GROUPS = [
  'AEROSPACE', 'AUTOMOTIVE', 'ELECTRONICS', 'ENERGY_CHEMICALS', 'FOOD_BEVERAGE',
  'GENERAL_MANUFACTURING', 'LOGISTICS', 'OIL_GAS', 'MACHINERY_EQUIPMENT',
  'MEDICAL_TECHNOLOGY', 'PHARMACEUTICALS', 'PRECISION_PARTS', 'SEMICONDUCTORS', 'TEXTILE_CLOTHING',
] as const;

const SIZES = ['MICRO', 'SMALL', 'MEDIUM', 'LARGE'] as const;

const SAUDI_REGIONS = [
  'Riyadh', 'Makkah', 'Madinah', 'Qassim', 'Eastern Province',
  'Asir', 'Tabuk', 'Hail', 'Northern Borders', 'Jazan',
  'Najran', 'Al-Bahah', "Al-Jawf",
];

export default function OnboardingPage() {
  const { t } = useTranslation();
  const nav = useNavigate();

  const onFinish = async (values: any) => {
    try {
      await api.post('/factories', values);
      message.success(t('onboarding.success'));
      nav('/app/factories');
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Card>
      <Typography.Title level={3}>{t('onboarding.title')}</Typography.Title>
      <Typography.Text type="secondary">{t('onboarding.subtitle')}</Typography.Text>
      <Form
        layout="vertical"
        onFinish={onFinish}
        style={{ marginTop: 24 }}
        initialValues={{ sizeClassification: 'SMALL', employeeCount: 25 }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="crNumber"
              label={t('onboarding.crNumber')}
              tooltip={t('onboarding.crHelp')}
              rules={[
                { required: true },
                { pattern: /^\d{10}$/, message: t('onboarding.crHelp') },
              ]}
            >
              <Input maxLength={10} placeholder="1010123456" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="industryGroup" label={t('onboarding.industryGroup')} rules={[{ required: true }]}>
              <Select
                options={INDUSTRY_GROUPS.map((v) => ({ value: v, label: t(`industry.${v}`) }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="nameEn" label={t('onboarding.nameEn')} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="nameAr" label={t('onboarding.nameAr')} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="sizeClassification" label={t('onboarding.sizeClassification')} rules={[{ required: true }]}>
              <Select options={SIZES.map((v) => ({ value: v, label: t(`size.${v}`) }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="employeeCount" label={t('onboarding.employeeCount')} rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="region" label={t('onboarding.region')}>
              <Select options={SAUDI_REGIONS.map((v) => ({ value: v, label: v }))} allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="city" label={t('onboarding.city')}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="governorate" label={t('onboarding.governorate')}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="foundingYear" label={t('onboarding.foundingYear')}>
              <InputNumber min={1900} max={new Date().getFullYear()} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="contactEmail" label={t('onboarding.contactEmail')}>
              <Input type="email" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="contactPhone" label={t('onboarding.contactPhone')}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Space>
          <Button type="primary" htmlType="submit">{t('onboarding.submit')}</Button>
        </Space>
      </Form>
    </Card>
  );
}
