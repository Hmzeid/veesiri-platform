import { Card, Typography, Tag, Space, Descriptions, Spin, Result } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import axios from 'axios';

export default function VerifyCertificatePage() {
  const { code } = useParams();

  const { data, isLoading, error } = useQuery<any>({
    queryKey: ['verify', code],
    queryFn: async () => (await axios.get(`/api/v1/certificates/verify/${code}`)).data,
    retry: false,
  });

  if (isLoading) return <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}><Spin /></div>;
  if (error) return (
    <Result status="error" title="Certificate not found" subTitle={`No certificate with code ${code}.`} />
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: 24 }}>
      <Card style={{ maxWidth: 680, margin: '32px auto' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large" align="center">
          <SafetyCertificateOutlined style={{ fontSize: 60, color: data.valid ? '#006C35' : '#dc2626' }} />
          <Typography.Title level={2} style={{ margin: 0, textAlign: 'center' }}>
            VeeSIRI Certificate Verification
          </Typography.Title>
          <Tag color={data.valid ? 'green' : 'red'} style={{ fontSize: 14, padding: '4px 12px' }}>
            {data.valid ? 'VALID' : 'INVALID OR EXPIRED'}
          </Tag>
        </Space>

        <Descriptions bordered column={1} style={{ marginTop: 24 }}>
          <Descriptions.Item label="Factory (EN)">{data.factory.nameEn}</Descriptions.Item>
          <Descriptions.Item label="Factory (AR)">{data.factory.nameAr}</Descriptions.Item>
          <Descriptions.Item label="CR Number">{data.factory.crNumber}</Descriptions.Item>
          <Descriptions.Item label="Region">{data.factory.region}</Descriptions.Item>
          <Descriptions.Item label="Industry">{data.factory.industryGroup}</Descriptions.Item>
          <Descriptions.Item label="SIRI Level Achieved">
            <strong style={{ fontSize: 20, color: '#006C35' }}>
              {Number(data.siriLevelAchieved).toFixed(2)} / 5.00
            </strong>
          </Descriptions.Item>
          <Descriptions.Item label="Issued">{new Date(data.issuedDate).toLocaleDateString()}</Descriptions.Item>
          <Descriptions.Item label="Expires">{new Date(data.expiryDate).toLocaleDateString()}</Descriptions.Item>
          <Descriptions.Item label="Verification Code">
            <code>{data.verificationCode}</code>
          </Descriptions.Item>
        </Descriptions>

        <Typography.Paragraph type="secondary" style={{ marginTop: 24, textAlign: 'center', fontSize: 12 }}>
          Verified by Veebase LLC • VeeSIRI Platform
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
