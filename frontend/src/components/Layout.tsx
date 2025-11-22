import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Avatar, Button, Space, Typography, Menu } from 'antd';
import {
  LogoutOutlined,
  InboxOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Header, Content } = AntLayout;
const { Title } = Typography;

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  signOut?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, signOut }) => {
  const location = useLocation();

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
      label: <Link to="/tickets">Tickets</Link>,
    },
    {
      key: 'customers',
      icon: <TeamOutlined />,
      label: <Link to="/customers">Customers</Link>,
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: <Link to="/analytics">Analytics</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">Settings</Link>,
    },
  ];

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
          padding: '0 48px',
          height: 64,
        }}
      >
        <Space size="large" align="center">
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar
              size={40}
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
              }}
              icon={<InboxOutlined />}
            />
            <Title level={4} style={{ margin: 0, color: '#262626' }}>
              Customer Toolkit
            </Title>
          </Link>
        </Space>

        <Space size="middle">
          <Space size="small" align="center">
            <Avatar size="small" style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              {user?.signInDetails?.loginId || 'Agent'}
            </span>
          </Space>
          {signOut && (
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={signOut}
            >
              Sign Out
            </Button>
          )}
        </Space>
      </Header>

      <div
        style={{
          position: 'sticky',
          top: 64,
          zIndex: 999,
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 48px' }}>
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

      <Content style={{ padding: '48px', background: '#f5f5f5' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {children}
        </div>
      </Content>
    </AntLayout>
  );
};

export default Layout;
