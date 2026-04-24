import { Card, Typography, Tag, Button, Space, Empty, Row, Col } from 'antd';
import { PrinterOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';

export default function CertificatePage() {
  const { factoryId } = useParams();
  const { t, i18n } = useTranslation();

  const { data, isLoading } = useQuery<any>({
    queryKey: ['cert', factoryId],
    queryFn: async () => (await api.get(`/certificates/latest?factoryId=${factoryId}`)).data,
  });

  if (isLoading) return <Card loading />;
  if (!data) return <Card><Empty description={t('assessment.incomplete')} /></Card>;

  const verifyUrl = `${window.location.origin}/verify/${data.verificationCode}`;
  const level = Number(data.siriLevelAchieved).toFixed(2);
  const name = i18n.language === 'ar' ? data.factory.nameAr : data.factory.nameEn;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card extra={<Button icon={<PrinterOutlined />} onClick={() => window.print()}>{t('common.print')}</Button>}>
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            border: '8px double #006C35',
            padding: 40,
            textAlign: 'center',
            fontFamily: 'serif',
            position: 'relative',
          }}
        >
          <SafetyCertificateOutlined style={{ fontSize: 60, color: '#006C35' }} />
          <Typography.Title level={2} style={{ marginTop: 8, marginBottom: 4, color: '#1A2F4E' }}>
            Smart Industry Readiness Index
          </Typography.Title>
          <Typography.Text type="secondary">Official Certificate of Compliance</Typography.Text>

          <Typography.Paragraph style={{ fontSize: 14, marginTop: 24 }}>
            {t('certificate.issuedTo')}
          </Typography.Paragraph>
          <Typography.Title level={3} style={{ margin: 0 }}>{name}</Typography.Title>
          <Typography.Text type="secondary">CR: {data.factory.crNumber}</Typography.Text>

          <div style={{ margin: '30px 0' }}>
            <Typography.Text type="secondary" style={{ fontSize: 14 }}>
              {t('certificate.level')}
            </Typography.Text>
            <div
              style={{
                display: 'inline-block',
                padding: '12px 36px',
                background: '#006C35',
                color: '#fff',
                borderRadius: 8,
                fontSize: 48,
                fontWeight: 700,
                marginTop: 8,
              }}
            >
              {level} / 5.00
            </div>
          </div>

          <Row gutter={16} justify="center" style={{ marginTop: 16 }}>
            <Col>
              <Typography.Text type="secondary">{t('certificate.issuedDate')}</Typography.Text>
              <div>{new Date(data.issuedDate).toLocaleDateString()}</div>
            </Col>
            <Col>
              <Typography.Text type="secondary">{t('certificate.expiryDate')}</Typography.Text>
              <div>{new Date(data.expiryDate).toLocaleDateString()}</div>
            </Col>
          </Row>

          <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
            <div>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {t('certificate.verificationCode')}
              </Typography.Text>
              <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700 }}>
                {data.verificationCode}
              </div>
            </div>
            <QRPlaceholder code={data.verificationCode} />
            <div style={{ fontSize: 11 }}>
              <Tag color={data.isValid ? 'green' : 'red'}>{data.isValid ? t('certificate.valid') : t('certificate.invalid')}</Tag>
              <div style={{ marginTop: 4 }}>
                <a href={verifyUrl} target="_blank" rel="noreferrer" style={{ fontSize: 10 }}>
                  {verifyUrl}
                </a>
              </div>
            </div>
          </div>

          <Typography.Paragraph style={{ marginTop: 32, fontSize: 10, color: '#6b7280' }}>
            Issued by Veebase LLC • Signed {data.digitalSignature.slice(0, 16)}…
          </Typography.Paragraph>
        </div>
      </Card>
    </Space>
  );
}

// Visual QR placeholder — deterministic 12×12 grid from hash of code
function QRPlaceholder({ code }: { code: string }) {
  const size = 12;
  const cells: boolean[][] = [];
  // simple deterministic "hash" grid
  let seed = 0;
  for (const c of code) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      row.push((seed & 0x1) === 1);
    }
    cells.push(row);
  }
  // Finder squares in corners
  const setFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cells[r0 + r][c0 + c] = true;
  };
  setFinder(0, 0); setFinder(0, size - 3); setFinder(size - 3, 0);
  return (
    <svg width={96} height={96} viewBox={`0 0 ${size} ${size}`} style={{ background: '#fff', border: '1px solid #ddd' }}>
      {cells.map((row, r) =>
        row.map((on, c) => (on ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#000" /> : null)),
      )}
    </svg>
  );
}
