import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Avatar, Button, Space, Typography, Menu, Drawer, Grid } from 'antd';
import {
  LogoutOutlined,
  InboxOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  MenuOutlined,
} from '@ant-design/icons';

const { Header, Content } = AntLayout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  signOut?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, signOut }) => {
  const location = useLocation();
  const screens = useBreakpoint();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/tickets')) return 'tickets';
    if (path.startsWith('/customers')) return 'customers';
    if (path.startsWith('/analytics')) return 'analytics';
    if (path.startsWith('/settings')) return 'settings';
    return 'tickets';
  };

  const menuItems = [
    {
      key: 'tickets',
      icon: <InboxOutlined />,
      label: <Link to="/tickets" onClick={() => setDrawerVisible(false)}>Tickets</Link>,
    },
    {
      key: 'customers',
      icon: <TeamOutlined />,
      label: <Link to="/customers" onClick={() => setDrawerVisible(false)}>Customers</Link>,
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: <Link to="/analytics" onClick={() => setDrawerVisible(false)}>Analytics</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings" onClick={() => setDrawerVisible(false)}>Settings</Link>,
    },
  ];

  // Close drawer when route changes
  useEffect(() => {
    setDrawerVisible(false);
  }, [location.pathname]);

  const headerPadding = isMobile ? '0 16px' : '0 24px';
  const contentPadding = isMobile ? '16px' : isTablet ? '24px' : '48px';
  const menuPadding = isMobile ? '0 16px' : '0 24px';

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          padding: headerPadding,
          height: 64,
        }}
      >
        <Space size={isMobile ? 'small' : 'large'} align="center">
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
            <Avatar
              size={isMobile ? 32 : 40}
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
              }}
              icon={<InboxOutlined />}
            />
            {!isMobile && (
              <Title level={4} style={{ margin: 0, color: '#262626', fontSize: isTablet ? 18 : 20 }}>
                Customer Toolkit
              </Title>
            )}
          </Link>
        </Space>

        <Space size={isMobile ? 'small' : 'middle'}>
          {!isMobile && (
            <Space size="small" align="center">
              <Avatar size="small" style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
              {!isTablet && (
                <Text style={{ fontSize: 14, fontWeight: 500 }}>
                  {user?.signInDetails?.loginId || 'Agent'}
                </Text>
              )}
            </Space>
          )}
          {signOut && (
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={signOut}
            >
              {!isMobile && 'Sign Out'}
            </Button>
          )}
        </Space>
      </Header>

      {isMobile ? (
        <>
          <div
            style={{
              position: 'sticky',
              top: 64,
              zIndex: 999,
              background: '#fff',
              borderBottom: '1px solid #f0f0f0',
              padding: '8px 16px',
            }}
          >
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
              style={{ width: '100%', textAlign: 'left' }}
            >
              Menu
            </Button>
          </div>
          <Drawer
            title="Navigation"
            placement="left"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={250}
          >
            <Menu
              mode="vertical"
              selectedKeys={[getSelectedKey()]}
              items={menuItems}
              style={{ border: 'none' }}
            />
          </Drawer>
        </>
      ) : (
        <div
          style={{
            position: 'sticky',
            top: 64,
            zIndex: 999,
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div style={{ maxWidth: 1400, margin: '0 auto', padding: menuPadding }}>
            <Menu
              mode="horizontal"
              selectedKeys={[getSelectedKey()]}
              items={menuItems}
              style={{
                border: 'none',
                background: 'transparent',
              }}
            />
          </div>
        </div>
      )}

      <Content style={{ padding: contentPadding, background: '#f5f5f5' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {children}
        </div>
      </Content>
    </AntLayout>
  );
};

export default Layout;
