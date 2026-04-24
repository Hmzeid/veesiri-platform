import { useState, useMemo } from 'react';
import { Card, Col, Row, Typography, Input, Select, Tag, Rate, Button, Avatar, Space, Empty } from 'antd';
import { SearchOutlined, ShopOutlined, CheckCircleFilled, MailOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

type Vendor = {
  id: string;
  name: string;
  nameAr: string;
  logo: string;
  tagline: string;
  taglineAr: string;
  dimensions: string[];
  country: string;
  verified: boolean;
  rating: number;
  reviews: number;
  engagements: number;
  priceBand: 'SAR 200k–800k' | 'SAR 500k–3M' | 'SAR 1M–8M' | 'SAR 5M+';
  categories: string[];
};

const VENDORS: Vendor[] = [
  {
    id: 'v1', name: 'Elm Industrial Solutions', nameAr: 'علم للحلول الصناعية', logo: '🏛',
    tagline: 'End-to-end MES and OT/IT convergence for energy & chemicals.',
    taglineAr: 'حلول MES وتقارب OT/IT من طرف إلى طرف للطاقة والكيماويات.',
    dimensions: ['OPS-1', 'OPS-2', 'CONN-1', 'CONN-2', 'AUTO-1'],
    country: 'KSA', verified: true, rating: 4.8, reviews: 47, engagements: 38, priceBand: 'SAR 1M–8M',
    categories: ['MES', 'SCADA', 'Systems Integrator'],
  },
  {
    id: 'v2', name: 'Ibtikar Digital', nameAr: 'ابتكار الرقمية', logo: '✨',
    tagline: 'Predictive maintenance and factory data lakes tuned for Saudi heavy industry.',
    taglineAr: 'الصيانة التنبؤية وبحيرات البيانات للمصانع الثقيلة.',
    dimensions: ['INT-1', 'INT-2', 'AUTO-1'],
    country: 'KSA', verified: true, rating: 4.7, reviews: 29, engagements: 22, priceBand: 'SAR 500k–3M',
    categories: ['AI / ML', 'Data Platform'],
  },
  {
    id: 'v3', name: 'Tatweer Consulting', nameAr: 'تطوير الاستشارية', logo: '📐',
    tagline: 'SIRI-certified assessors and transformation strategy.',
    taglineAr: 'مُقيّمون معتمدون من SIRI واستراتيجيات التحول.',
    dimensions: ['STR-1', 'STR-2', 'TAL-1', 'TAL-2'],
    country: 'KSA', verified: true, rating: 4.9, reviews: 61, engagements: 54, priceBand: 'SAR 200k–800k',
    categories: ['Consulting', 'SIRI Assessor'],
  },
  {
    id: 'v4', name: 'Siemens MEA', nameAr: 'سيمنز الشرق الأوسط', logo: '⚙️',
    tagline: 'Digital Industries automation, drives, and SCADA for large manufacturers.',
    taglineAr: 'الأتمتة الصناعية والقيادة و SCADA للمصانع الكبيرة.',
    dimensions: ['AUTO-1', 'AUTO-2', 'CONN-1', 'CONN-2'],
    country: 'Germany / KSA', verified: true, rating: 4.6, reviews: 120, engagements: 96, priceBand: 'SAR 5M+',
    categories: ['Automation', 'OEM'],
  },
  {
    id: 'v5', name: 'SAP Saudi Arabia', nameAr: 'ساب السعودية', logo: '💼',
    tagline: 'S/4HANA and Supply Chain suite with Saudi localization.',
    taglineAr: 'منظومة S/4HANA وسلسلة التوريد بتوطين سعودي.',
    dimensions: ['SC-1', 'SC-2', 'PLC-2', 'AUTO-2'],
    country: 'Germany / KSA', verified: true, rating: 4.5, reviews: 200, engagements: 178, priceBand: 'SAR 5M+',
    categories: ['ERP', 'Supply Chain'],
  },
  {
    id: 'v6', name: 'Nabbesh Training', nameAr: 'نبض للتدريب', logo: '🎓',
    tagline: 'SIRI Foundation & Industry 4.0 bootcamps — Arabic-first.',
    taglineAr: 'دورات أساسيات SIRI والصناعة 4.0 باللغة العربية.',
    dimensions: ['TAL-1', 'TAL-2'],
    country: 'KSA', verified: true, rating: 4.7, reviews: 38, engagements: 31, priceBand: 'SAR 200k–800k',
    categories: ['Training', 'LMS'],
  },
  {
    id: 'v7', name: 'Rockwell Automation', nameAr: 'روكويل للأتمتة', logo: '🔩',
    tagline: 'Logix PLC platforms and FactoryTalk analytics for discrete manufacturing.',
    taglineAr: 'منصات Logix PLC و FactoryTalk للأتمتة المتقطعة.',
    dimensions: ['AUTO-1', 'CONN-1', 'INT-1'],
    country: 'USA / KSA', verified: true, rating: 4.5, reviews: 84, engagements: 62, priceBand: 'SAR 1M–8M',
    categories: ['Automation', 'PLC'],
  },
  {
    id: 'v8', name: 'Thakaa Analytics', nameAr: 'ذكاء للتحليلات', logo: '🧠',
    tagline: 'Arabic NLP and AI for industrial quality inspection.',
    taglineAr: 'معالجة لغة عربية وذكاء اصطناعي لفحص الجودة.',
    dimensions: ['INT-2', 'OPS-2'],
    country: 'KSA', verified: false, rating: 4.3, reviews: 12, engagements: 8, priceBand: 'SAR 500k–3M',
    categories: ['AI / ML', 'Computer Vision'],
  },
  {
    id: 'v9', name: 'Aramco Digital Solutions', nameAr: 'أرامكو للحلول الرقمية', logo: '🛢',
    tagline: 'Certified Industry 4.0 transformation practice for energy & chemicals.',
    taglineAr: 'ممارسة معتمدة للتحول الصناعي 4.0 للطاقة والكيماويات.',
    dimensions: ['OPS-1', 'OPS-2', 'SC-1', 'AUTO-1', 'INT-1', 'STR-1'],
    country: 'KSA', verified: true, rating: 4.9, reviews: 74, engagements: 68, priceBand: 'SAR 5M+',
    categories: ['Consulting', 'Systems Integrator'],
  },
];

const ALL_DIMENSIONS = ['OPS-1', 'OPS-2', 'SC-1', 'SC-2', 'PLC-1', 'PLC-2', 'AUTO-1', 'AUTO-2', 'CONN-1', 'CONN-2', 'INT-1', 'INT-2', 'TAL-1', 'TAL-2', 'STR-1', 'STR-2'];

export default function VendorMarketplacePage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [q, setQ] = useState('');
  const [dim, setDim] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(VENDORS.flatMap((v) => v.categories))).sort(),
    [],
  );

  const filtered = VENDORS.filter((v) => {
    if (q && !v.name.toLowerCase().includes(q.toLowerCase()) && !v.tagline.toLowerCase().includes(q.toLowerCase())) return false;
    if (dim && !v.dimensions.includes(dim)) return false;
    if (category && !v.categories.includes(category)) return false;
    if (verifiedOnly && !v.verified) return false;
    return true;
  });

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <ShopOutlined style={{ fontSize: 26, color: '#006C35' }} />
              <div>
                <Typography.Title level={3} style={{ margin: 0 }}>Vendor Marketplace</Typography.Title>
                <Typography.Text type="secondary">
                  Certified transformation partners matched to your gaps.
                </Typography.Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Tag color="gold">{filtered.length} vendors</Tag>
          </Col>
        </Row>
      </Card>

      <Card>
        <Row gutter={12}>
          <Col xs={24} md={10}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search vendors, solutions..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              placeholder="Dimension"
              style={{ width: '100%' }}
              value={dim}
              onChange={setDim}
              allowClear
              options={ALL_DIMENSIONS.map((d) => ({ value: d, label: d }))}
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              placeholder="Category"
              style={{ width: '100%' }}
              value={category}
              onChange={setCategory}
              allowClear
              options={categories.map((c) => ({ value: c, label: c }))}
            />
          </Col>
          <Col xs={24} md={4}>
            <Button
              block
              type={verifiedOnly ? 'primary' : 'default'}
              onClick={() => setVerifiedOnly((v) => !v)}
              icon={<CheckCircleFilled />}
            >
              Verified only
            </Button>
          </Col>
        </Row>
      </Card>

      {filtered.length === 0 ? (
        <Card><Empty description="No vendors match your filters." /></Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((v) => (
            <Col xs={24} md={12} lg={8} key={v.id}>
              <Card className="hover-lift" style={{ height: '100%' }}>
                <Space align="start" style={{ width: '100%' }}>
                  <Avatar
                    size={56}
                    style={{
                      background: 'linear-gradient(135deg, #006C35 0%, #064e3b 100%)',
                      fontSize: 28,
                    }}
                  >
                    {v.logo}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <Space>
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        {isAr ? v.nameAr : v.name}
                      </Typography.Title>
                      {v.verified && (
                        <CheckCircleFilled style={{ color: '#006C35', fontSize: 14 }} title="Verified" />
                      )}
                    </Space>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {v.country}
                    </Typography.Text>
                  </div>
                </Space>
                <Typography.Paragraph style={{ marginTop: 12, color: 'var(--color-ink-500)' }}>
                  {isAr ? v.taglineAr : v.tagline}
                </Typography.Paragraph>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                  {v.categories.map((c) => <Tag key={c} color="default">{c}</Tag>)}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                  {v.dimensions.map((d) => <Tag key={d} color="blue">{d}</Tag>)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Space size={4}>
                    <Rate disabled value={v.rating} allowHalf style={{ fontSize: 13 }} />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {v.rating} · {v.reviews}
                    </Typography.Text>
                  </Space>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {v.engagements} engagements
                  </Typography.Text>
                </div>
                <div style={{ padding: 10, background: '#f8fafc', borderRadius: 8, fontSize: 12, marginBottom: 12 }}>
                  <span style={{ color: '#64748b' }}>Typical project size: </span>
                  <strong>{v.priceBand}</strong>
                </div>
                <Space style={{ width: '100%' }}>
                  <Button type="primary" icon={<MailOutlined />} block>Contact</Button>
                  <Button icon={<GlobalOutlined />} />
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Space>
  );
}
