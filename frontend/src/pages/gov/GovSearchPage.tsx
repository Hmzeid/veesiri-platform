import { useState } from 'react';
import { Card, Input, Select, Row, Col, Table, Tag, Space, Typography, Button, Empty } from 'antd';
import { SearchOutlined, SwapOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

const scoreColor = (v: number) => v >= 4 ? '#059669' : v >= 3 ? '#84cc16' : v >= 2 ? '#eab308' : v >= 1 ? '#f97316' : '#dc2626';

const INDUSTRIES = [
  'AEROSPACE', 'AUTOMOTIVE', 'ELECTRONICS', 'ENERGY_CHEMICALS', 'FOOD_BEVERAGE',
  'GENERAL_MANUFACTURING', 'LOGISTICS', 'OIL_GAS', 'MACHINERY_EQUIPMENT',
  'MEDICAL_TECHNOLOGY', 'PHARMACEUTICALS', 'PRECISION_PARTS', 'SEMICONDUCTORS', 'TEXTILE_CLOTHING',
];

const REGIONS = ['Riyadh', 'Makkah', 'Madinah', 'Qassim', 'Eastern Province', 'Asir', 'Tabuk', 'Hail', 'Jazan', 'Najran', 'Al-Bahah', 'Al-Jawf', 'Northern Borders'];

export default function GovSearchPage() {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [industry, setIndustry] = useState<string | undefined>();
  const [region, setRegion] = useState<string | undefined>();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery<any[]>({
    queryKey: ['gov-search', q, industry, region],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (industry) params.set('industry', industry);
      if (region) params.set('region', region);
      return (await api.get(`/gov/search/factories?${params}`)).data;
    },
  });

  const compare = () => {
    if (selected.size < 2) return;
    const ids = Array.from(selected).slice(0, 3);
    nav(`/gov/compare?ids=${ids.join(',')}`);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Typography.Title level={3} style={{ margin: 0 }}>Factory Search</Typography.Title>
        <Typography.Text type="secondary">Search all registered factories across the Kingdom.</Typography.Text>
        <Row gutter={12} style={{ marginTop: 16 }}>
          <Col xs={24} md={10}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Name, CR number, city..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={6}>
            <Select
              placeholder="Industry"
              style={{ width: '100%' }}
              value={industry}
              onChange={setIndustry}
              allowClear
              options={INDUSTRIES.map((v) => ({ value: v, label: t(`industry.${v}`) }))}
            />
          </Col>
          <Col xs={12} md={6}>
            <Select
              placeholder="Region"
              style={{ width: '100%' }}
              value={region}
              onChange={setRegion}
              allowClear
              options={REGIONS.map((v) => ({ value: v, label: v }))}
            />
          </Col>
          <Col xs={24} md={2}>
            <Button
              type="primary"
              icon={<SwapOutlined />}
              disabled={selected.size < 2}
              onClick={compare}
              block
            >
              Compare
            </Button>
          </Col>
        </Row>
      </Card>

      <Card title={`${data?.length ?? 0} factories`}>
        {data && data.length > 0 ? (
          <Table
            rowKey="id"
            loading={isLoading}
            dataSource={data}
            rowSelection={{
              selectedRowKeys: Array.from(selected),
              onChange: (keys) => {
                const s = new Set(keys as string[]);
                // cap at 3 for compare
                if (s.size > 3) return;
                setSelected(s);
              },
            }}
            pagination={{ pageSize: 20 }}
            columns={[
              {
                title: 'Name',
                render: (f: any) => (
                  <a onClick={() => nav(`/gov/factories/${f.id}`)}>
                    {i18n.language === 'ar' ? f.nameAr : f.nameEn}
                  </a>
                ),
              },
              { title: 'CR', dataIndex: 'crNumber' },
              { title: 'Industry', dataIndex: 'industryGroup', render: (v: string) => t(`industry.${v}`) },
              { title: 'Region', dataIndex: 'region' },
              { title: 'Size', dataIndex: 'sizeClassification', render: (v: string) => <Tag>{v}</Tag> },
              {
                title: 'SIRI',
                render: (f: any) => f.assessments?.[0]
                  ? <span style={{ background: scoreColor(Number(f.assessments[0].overallScore)), color: '#fff', padding: '2px 10px', borderRadius: 999, fontWeight: 700 }}>
                      {Number(f.assessments[0].overallScore).toFixed(2)}
                    </span>
                  : <Tag>—</Tag>,
              },
              { title: 'SIDF', dataIndex: 'sidfFinanced', render: (v: boolean) => v ? <Tag color="purple">Financed</Tag> : <Tag>—</Tag> },
            ]}
          />
        ) : (
          <Empty description="No factories match your filters" />
        )}
      </Card>
    </Space>
  );
}
