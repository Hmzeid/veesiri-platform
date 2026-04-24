import { useEffect, useState } from 'react';
import { Layout, Menu, Button, Space, Typography, Avatar, Select, Badge, Dropdown, Drawer, Grid } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  PlusCircleOutlined,
  LogoutOutlined,
  GlobalOutlined,
  BellOutlined,
  BulbOutlined,
  SafetyCertificateOutlined,
  FolderOpenOutlined,
  NodeIndexOutlined,
  BarChartOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  DollarCircleOutlined,
  TeamOutlined,
  BookOutlined,
  ShopOutlined,
  ApiOutlined,
  CalendarOutlined,
  AppstoreAddOutlined,
  SettingOutlined,
  MenuOutlined,
  BankOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../store/auth';
import { useSelectedFactory } from '../store/selectedFactory';
import { api } from '../api/client';
import AiChatWidget from './AiChatWidget';
import AnnouncementBar from './AnnouncementBar';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

export default function AppShell() {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const loc = useLocation();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const qc = useQueryClient();
  const selectedFactoryId = useSelectedFactory((s) => s.factoryId);
  const setFactoryId = useSelectedFactory((s) => s.setFactoryId);
  const screens = useBreakpoint();
  const isMobile = !screens.lg;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: factories } = useQuery<any[]>({
    queryKey: ['factories'],
    queryFn: async () => (await api.get('/factories')).data,
  });

  const { data: unread } = useQuery<{ count: number }>({
    queryKey: ['notif-count'],
    queryFn: async () => (await api.get('/notifications/count-unread')).data,
    refetchInterval: 30_000,
  });

  const { data: recentNotifs } = useQuery<any[]>({
    queryKey: ['notif-recent'],
    queryFn: async () => (await api.get('/notifications')).data,
  });

  useEffect(() => {
    if (!selectedFactoryId && factories && factories.length > 0) {
      setFactoryId(factories[0].id);
    }
  }, [factories, selectedFactoryId, setFactoryId]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [loc.pathname]);

  const fid = selectedFactoryId;
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');

  const items: any[] = [
    { key: '/app/dashboard', icon: <DashboardOutlined />, label: t('nav.dashboard') },
    { key: '/app/factories', icon: <AppstoreOutlined />, label: t('nav.factories') },
    ...(fid
      ? [
          { type: 'divider' as const },
          { key: `/app/factories/${fid}/gap-analysis`, icon: <BarChartOutlined />, label: t('nav.gapAnalysis') },
          { key: `/app/factories/${fid}/simulator`, icon: <ThunderboltOutlined />, label: 'What-if Simulator' },
          { key: `/app/factories/${fid}/roi`, icon: <DollarCircleOutlined />, label: 'ROI Calculator' },
          { key: `/app/factories/${fid}/roadmap`, icon: <NodeIndexOutlined />, label: t('nav.roadmap') },
          { key: `/app/factories/${fid}/kanban`, icon: <AppstoreAddOutlined />, label: 'Kanban' },
          { key: `/app/factories/${fid}/calendar`, icon: <CalendarOutlined />, label: 'Calendar' },
          { key: `/app/factories/${fid}/recommendations`, icon: <BulbOutlined />, label: t('nav.recommendations') },
          { key: `/app/factories/${fid}/documents`, icon: <FolderOpenOutlined />, label: t('nav.documents') },
          { key: `/app/factories/${fid}/benchmarks`, icon: <RocketOutlined />, label: t('nav.benchmarks') },
          { key: `/app/factories/${fid}/certificate`, icon: <SafetyCertificateOutlined />, label: t('nav.certificate') },
          { key: `/app/factories/${fid}/team`, icon: <TeamOutlined />, label: 'Team' },
        ]
      : []),
    { type: 'divider' as const },
    { key: '/app/vendors', icon: <ShopOutlined />, label: 'Vendor Marketplace' },
    { key: '/app/integrations', icon: <ApiOutlined />, label: 'Integrations' },
    { key: '/app/training', icon: <BookOutlined />, label: 'Training Hub' },
    { key: '/app/onboarding', icon: <PlusCircleOutlined />, label: t('nav.onboarding') },
    { key: '/app/notifications', icon: <BellOutlined />, label: t('notifications.title') },
    { key: '/app/settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  const selectedKey =
    items.map((i: any) => i.key).filter(Boolean).find((k: string) => loc.pathname.startsWith(k)) ?? '/app/dashboard';

  const notifDropdown = (
    <div style={{ maxWidth: 360, maxHeight: 400, overflow: 'auto' }}>
      {(recentNotifs ?? []).length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>{t('notifications.empty')}</div>
      ) : (
        (recentNotifs ?? []).slice(0, 6).map((n: any) => (
          <div
            key={n.id}
            onClick={() => {
              api.put(`/notifications/${n.id}/read`).then(() =>
                qc.invalidateQueries({ queryKey: ['notif-count'] }),
              );
              const target = n.actionUrl ? (n.actionUrl.startsWith('/app/') ? n.actionUrl : `/app${n.actionUrl}`) : '/app/notifications';
              nav(target);
            }}
            style={{
              padding: '12px 14px',
              borderBottom: '1px solid #f1f5f9',
              cursor: 'pointer',
              background: n.readAt ? '#fff' : '#f0fdf4',
            }}
          >
            <div style={{ fontWeight: n.readAt ? 400 : 700, fontSize: 13, color: '#0b1220' }}>
              {i18n.language === 'ar' ? n.titleAr : n.titleEn}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, lineHeight: 1.4 }}>
              {i18n.language === 'ar' ? n.bodyAr : n.bodyEn}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const profileMenu = {
    items: [
      {
        key: 'profile',
        label: (
          <div>
            <div style={{ fontWeight: 600 }}>{user?.nameEn || user?.email?.split('@')[0]}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{user?.email}</div>
          </div>
        ),
        disabled: true,
      },
      { type: 'divider' as const },
      { key: 'settings', icon: <SettingOutlined />, label: 'Settings', onClick: () => nav('/app/settings') },
      { key: 'lang', icon: <GlobalOutlined />, label: t('common.language'), onClick: toggleLang },
      { key: 'gov', icon: <BankOutlined />, label: t('nav.govPortal'), onClick: () => nav('/gov/login') },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: t('nav.logout'), onClick: () => { logout(); nav('/'); }, danger: true },
    ],
  };

  const sidebar = (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={items as any}
      onClick={({ key }) => nav(key as string)}
      style={{ height: '100%', borderInlineEnd: 0, paddingTop: 8, background: 'transparent' }}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AnnouncementBar variant="app" />
      <Header
        style={{
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          padding: isMobile ? '0 12px' : '0 20px',
          gap: 10,
          height: 64,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
            style={{ fontSize: 18 }}
          />
        )}
        <Space align="center" style={{ flexShrink: 0 }}>
          <div
            style={{
              width: 34, height: 34, background: 'var(--color-primary)', borderRadius: 8,
              color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 16,
            }}
          >
            V
          </div>
          {!isMobile && (
            <Typography.Title level={4} className="veesiri-brand" style={{ margin: 0 }}>
              {t('brand')}
            </Typography.Title>
          )}
        </Space>

        {/* Factory switcher */}
        {factories && factories.length > 0 && (
          <Select
            size={isMobile ? 'small' : 'middle'}
            style={{ flex: 1, maxWidth: isMobile ? 180 : 320, marginInlineStart: 8 }}
            value={selectedFactoryId}
            onChange={(v) => setFactoryId(v)}
            options={factories.map((f: any) => ({
              value: f.id,
              label: i18n.language === 'ar' ? f.nameAr : f.nameEn,
            }))}
            popupMatchSelectWidth={280}
          />
        )}

        <div style={{ flex: 1 }} />

        <Space size={isMobile ? 4 : 8}>
          <Dropdown
            menu={{ items: [] }}
            dropdownRender={() => <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: 'var(--shadow-md)' }}>{notifDropdown}</div>}
            trigger={['click']}
            placement="bottomRight"
          >
            <Badge count={unread?.count ?? 0} offset={[-2, 4]}>
              <Button icon={<BellOutlined />} type="text" size={isMobile ? 'small' : 'middle'} />
            </Badge>
          </Dropdown>
          <Dropdown menu={profileMenu} trigger={['click']} placement="bottomRight">
            <Button type="text" style={{ padding: isMobile ? 4 : 8, height: 'auto' }}>
              <Space size={6}>
                <Avatar size={isMobile ? 28 : 32} style={{ background: '#1A2F4E' }}>
                  {(user?.nameEn || user?.email || '?').charAt(0).toUpperCase()}
                </Avatar>
                {!isMobile && (
                  <span style={{ color: '#0b1220', fontWeight: 500 }}>
                    {user?.nameEn || user?.email?.split('@')[0]}
                  </span>
                )}
              </Space>
            </Button>
          </Dropdown>
        </Space>
      </Header>

      <Layout>
        {!isMobile && (
          <Sider
            width={240}
            theme="light"
            style={{ borderInlineEnd: '1px solid #e5e7eb', background: '#fff' }}
          >
            {sidebar}
          </Sider>
        )}
        <Content
          style={{
            padding: isMobile ? 12 : 24,
            overflow: 'auto',
            background: '#f5f7fa',
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      {/* Mobile drawer */}
      <Drawer
        placement={i18n.language === 'ar' ? 'right' : 'left'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={280}
        bodyStyle={{ padding: 0 }}
        title={
          <Space>
            <div
              style={{
                width: 30, height: 30, background: 'var(--color-primary)', borderRadius: 7,
                color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800,
              }}
            >V</div>
            <span className="veesiri-brand" style={{ fontSize: 18 }}>{t('brand')}</span>
          </Space>
        }
      >
        {sidebar}
      </Drawer>

      <AiChatWidget />
    </Layout>
  );
}
