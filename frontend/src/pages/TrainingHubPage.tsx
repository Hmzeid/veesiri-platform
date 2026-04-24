import { Card, Col, Row, Typography, Space, Tag, Progress, Button } from 'antd';
import { PlayCircleOutlined, SafetyCertificateOutlined, BookOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const COURSES = [
  {
    id: '1',
    titleEn: 'SIRI Foundation — Industry 4.0 Essentials',
    titleAr: 'أساسيات SIRI — الصناعة 4.0',
    level: 'Awareness', levelColor: 'green',
    industryEn: 'All Industries',
    duration: 120,
    progress: 100,
    certificate: true,
    modules: 8,
    featured: true,
    thumbnail: '🏭',
  },
  {
    id: '2',
    titleEn: 'Preparing Your Factory for SIRI Assessment',
    titleAr: 'إعداد مصنعك لتقييم SIRI',
    level: 'Intermediate', levelColor: 'blue',
    industryEn: 'All Industries',
    duration: 180,
    progress: 65,
    certificate: true,
    modules: 12,
    thumbnail: '📋',
  },
  {
    id: '3',
    titleEn: 'OT/IT Convergence for Saudi Manufacturers',
    titleAr: 'دمج OT/IT للمصنعين السعوديين',
    level: 'Advanced', levelColor: 'purple',
    industryEn: 'Energy & Chemicals, Oil & Gas',
    duration: 240,
    progress: 0,
    certificate: true,
    modules: 16,
    thumbnail: '🔌',
  },
  {
    id: '4',
    titleEn: 'Predictive Maintenance with Machine Learning',
    titleAr: 'الصيانة التنبؤية بالتعلم الآلي',
    level: 'Advanced', levelColor: 'purple',
    industryEn: 'Automotive, Aerospace, Machinery',
    duration: 300,
    progress: 0,
    certificate: true,
    modules: 14,
    thumbnail: '🤖',
  },
  {
    id: '5',
    titleEn: 'SIDF Financing: How to Build a Winning Application',
    titleAr: 'تمويل صندوق التنمية الصناعية: كيف تبني طلبًا ناجحًا',
    level: 'Awareness', levelColor: 'green',
    industryEn: 'All Industries',
    duration: 90,
    progress: 40,
    certificate: true,
    modules: 6,
    thumbnail: '🏦',
  },
  {
    id: '6',
    titleEn: 'Supply Chain Digitization for Food & Beverage',
    titleAr: 'رقمنة سلسلة التوريد للأغذية والمشروبات',
    level: 'Intermediate', levelColor: 'blue',
    industryEn: 'Food & Beverage, Pharmaceuticals',
    duration: 210,
    progress: 0,
    certificate: true,
    modules: 10,
    thumbnail: '📦',
  },
];

export default function TrainingHubPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const stats = {
    enrolled: COURSES.filter((c) => c.progress > 0).length,
    completed: COURSES.filter((c) => c.progress === 100).length,
    certificates: COURSES.filter((c) => c.progress === 100 && c.certificate).length,
    totalMinutes: COURSES.reduce((a, c) => a + c.duration * (c.progress / 100), 0),
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <BookOutlined style={{ fontSize: 28, color: '#006C35' }} />
              <div>
                <Typography.Title level={3} style={{ margin: 0 }}>Training Hub</Typography.Title>
                <Typography.Text type="secondary">
                  Bilingual SIRI-aligned courses to upskill your team.
                </Typography.Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space size="large">
              <MiniStat label="Enrolled" value={stats.enrolled} />
              <MiniStat label="Completed" value={stats.completed} />
              <MiniStat label="Certificates" value={stats.certificates} />
              <MiniStat label="Hours studied" value={Math.round(stats.totalMinutes / 60)} />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Featured */}
      {COURSES.filter((c) => c.featured).map((c) => (
        <div
          key={c.id}
          style={{
            position: 'relative',
            borderRadius: 16,
            overflow: 'hidden',
            background: 'var(--gradient-hero)',
            color: '#fff',
            padding: 40,
          }}
        >
          <Row align="middle" gutter={24}>
            <Col xs={24} md={16}>
              <Tag color="gold" style={{ border: 'none', marginBottom: 16 }}>Featured course</Tag>
              <Typography.Title level={2} style={{ color: '#fff', margin: 0 }}>
                {isAr ? c.titleAr : c.titleEn}
              </Typography.Title>
              <Space style={{ marginTop: 14, color: 'rgba(255,255,255,0.85)' }}>
                <Tag color={c.levelColor}>{c.level}</Tag>
                <span><ClockCircleOutlined /> {Math.round(c.duration / 60)} hours · {c.modules} modules</span>
                {c.certificate && <span><SafetyCertificateOutlined /> Certificate included</span>}
              </Space>
              <div style={{ marginTop: 20 }}>
                <Button type="primary" size="large" style={{ background: '#fff', color: 'var(--color-primary)', fontWeight: 700 }}>
                  <PlayCircleOutlined /> {c.progress > 0 ? 'Continue' : 'Start course'}
                </Button>
              </div>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 140, lineHeight: 1 }}>{c.thumbnail}</div>
            </Col>
          </Row>
        </div>
      ))}

      {/* Course grid */}
      <Row gutter={[16, 16]}>
        {COURSES.filter((c) => !c.featured).map((c) => (
          <Col xs={24} md={12} lg={8} key={c.id}>
            <Card
              className="hover-lift"
              style={{ height: '100%' }}
              cover={
                <div
                  style={{
                    background: `linear-gradient(135deg, ${c.level === 'Advanced' ? '#7c3aed' : c.level === 'Intermediate' ? '#0ea5e9' : '#006C35'} 0%, ${c.level === 'Advanced' ? '#4c1d95' : c.level === 'Intermediate' ? '#0369a1' : '#064e3b'} 100%)`,
                    padding: '36px 20px',
                    textAlign: 'center',
                    color: '#fff',
                    position: 'relative',
                  }}
                >
                  <div style={{ fontSize: 64 }}>{c.thumbnail}</div>
                  {c.progress === 100 && (
                    <Tag color="gold" style={{ position: 'absolute', top: 12, insetInlineEnd: 12 }}>
                      Completed
                    </Tag>
                  )}
                </div>
              }
            >
              <Tag color={c.levelColor}>{c.level}</Tag>
              <Typography.Title level={5} style={{ marginTop: 8, marginBottom: 4 }}>
                {isAr ? c.titleAr : c.titleEn}
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {c.industryEn}
              </Typography.Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginTop: 12 }}>
                <span><ClockCircleOutlined /> {Math.round(c.duration / 60)}h</span>
                <span>{c.modules} modules</span>
                {c.certificate && <span><SafetyCertificateOutlined /> Certificate</span>}
              </div>
              {c.progress > 0 && (
                <Progress percent={c.progress} size="small" style={{ marginTop: 8 }} />
              )}
              <Button block type={c.progress === 0 ? 'primary' : 'default'} style={{ marginTop: 12 }}>
                <PlayCircleOutlined /> {c.progress === 100 ? 'Review' : c.progress > 0 ? 'Continue' : 'Start'}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-ink-900)' }}>{value}</div>
      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  );
}
