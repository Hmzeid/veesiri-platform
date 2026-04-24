import { useEffect, useState } from 'react';
import { Layout, Menu, Button, Space, Typography, Avatar, Tag, Dropdown, Drawer, Grid } from 'antd';
import {
  DashboardOutlined,
  AlertOutlined,
  TrophyOutlined,
  LogoutOutlined,
  GlobalOutlined,
  SearchOutlined,
  SwapOutlined,
  FileDoneOutlined,
  MenuOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGovAuth } from '../store/gov';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

export default function GovShell() {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const loc = useLocation();
  const user = useGovAuth((s) => s.user);
  const logout = useGovAuth((s) => s.logout);
  const screens = useBreakpoint();
  const isMobile = !screens.lg;
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('gov-dark');
    return () => document.body.classList.remove('gov-dark');
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [loc.pathname]);

  const items = [
    { key: '/gov/dashboard', icon: <DashboardOutlined />, label: t('nav.dashboard') },
    { key: '/gov/search', icon: <SearchOutlined />, label: 'Factory Search' },
    { key: '/gov/compare', icon: <SwapOutlined />, label: 'Compare' },
    { key: '/gov/leaderboard', icon: <TrophyOutlined />, label: t('gov.leaderboard') },
    { key: '/gov/alerts', icon: <AlertOutlined />, label: t('gov.alerts') },
    { key: '/gov/report', icon: <FileDoneOutlined />, label: 'Ministerial Report' },
  ];

  const selectedKey =
    items.map((i) => i.key).find((k) => loc.pathname.startsWith(k)) ?? '/gov/dashboard';

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');

  const profileMenu = {
    items: [
      {
        key: 'profile',
        label: (
          <div>
            <div style={{ fontWeight: 600 }}>{i18n.language === 'ar' ? user?.nameAr : user?.nameEn}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              {user?.organization}{user?.regionScope ? ` · ${user.regionScope}` : ''}
            </div>
          </div>
        ),
        disabled: true,
      },
      { type: 'divider' as const },
      { key: 'lang', icon: <GlobalOutlined />, label: t('common.language'), onClick: toggleLang },
      { key: 'factory', label: t('auth.backToFactory'), onClick: () => nav('/') },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: t('nav.logout'), onClick: () => { logout(); nav('/gov/login'); }, danger: true },
    ],
  };

  const sidebar = (
    <Menu
      mode="inline"
      theme="dark"
      selectedKeys={[selectedKey]}
      items={items as any}
      onClick={({ key }) => nav(key as string)}
      style={{ background: 'transparent', borderInlineEnd: 0, paddingTop: 8 }}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--gradient-gov)' }}>
      <Header
        style={{
          background: 'rgba(11, 18, 32, 0.96)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          padding: isMobile ? '0 10px' : '0 20px',
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
            icon={<MenuOutlined style={{ color: '#fff' }} />}
            onClick={() => setDrawerOpen(true)}
          />
        )}
        <Space align="center" style={{ flexShrink: 0 }}>
          <div
            style={{
              width: 34, height: 34,
              background: 'linear-gradient(135deg, #C8A548 0%, #b8922f 100%)',
              borderRadius: 8,
              color: '#0b1220', display: 'grid', placeItems: 'center', fontWeight: 800,
            }}
          >V</div>
          {!isMobile ? (
            <div>
              <Typography.Title level={5} style={{ color: '#fff', margin: 0 }}>
                {t('gov.title')}
              </Typography.Title>
              <Typography.Text style={{ color: '#94a3b8', fontSize: 11 }}>
                {t('gov.tagline')}
              </Typography.Text>
            </div>
          ) : (
            <Typography.Title level={5} style={{ color: '#fff', margin: 0, fontSize: 14 }}>
              {t('brand')}
            </Typography.Title>
          )}
        </Space>

        {!isMobile && (
          <>
            <Tag color="gold" style={{ marginInlineStart: 12 }}>Vision 2030</Tag>
            <span style={{ display: 'inline-flex', alignItems: 'center', color: '#86efac', fontSize: 12 }}>
              <span className="live-dot" /> Live
            </span>
          </>
        )}

        <div style={{ flex: 1 }} />

        <Dropdown menu={profileMenu} trigger={['click']} placement="bottomRight">
          <Button type="text" style={{ padding: isMobile ? 4 : 8, height: 'auto' }}>
            <Space size={6}>
              <Avatar size={isMobile ? 28 : 32} style={{ background: 'var(--color-accent)', color: '#0b1220', fontWeight: 700 }}>
                {(user?.nameEn || user?.email || '?').charAt(0).toUpperCase()}
              </Avatar>
              {!isMobile && (
                <div style={{ color: '#fff', textAlign: 'start' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.1 }}>
                    {i18n.language === 'ar' ? user?.nameAr : user?.nameEn}
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>
                    {user?.organization}{user?.regionScope ? ` · ${user.regionScope}` : ' · National'}
                  </div>
                </div>
              )}
            </Space>
          </Button>
        </Dropdown>
      </Header>

      <Layout style={{ background: 'transparent' }}>
        {!isMobile && (
          <Sider
            width={220}
            style={{
              background: 'rgba(11, 18, 32, 0.6)',
              borderInlineEnd: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {sidebar}
          </Sider>
        )}
        <Content
          style={{
            padding: isMobile ? 12 : 24,
            overflow: 'auto',
            color: '#e2e8f0',
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      <Drawer
        placement={i18n.language === 'ar' ? 'right' : 'left'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={260}
        bodyStyle={{ padding: 0, background: '#0b1220' }}
        headerStyle={{ background: '#0b1220', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        closeIcon={<span style={{ color: '#fff' }}>×</span>}
        title={<span style={{ color: '#fff' }}>{t('gov.title')}</span>}
      >
        {sidebar}
      </Drawer>
    </Layout>
  );
}
