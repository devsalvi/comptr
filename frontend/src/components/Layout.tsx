import React from 'react';
import { Link } from 'react-router-dom';
import { Layout as AntLayout, Avatar, Button, Space, Typography } from 'antd';
import { LogoutOutlined, InboxOutlined, UserOutlined } from '@ant-design/icons';

const { Header, Content } = AntLayout;
const { Title } = Typography;

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  signOut?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, signOut }) => {

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          padding: '0 48px',
        }}
      >
        <Space size="large" align="center">
          <Link to="/tickets" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar
              size={40}
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
              }}
              icon={<InboxOutlined />}
            />
            <Title level={4} style={{ margin: 0, color: '#262626' }}>
              Support Hub
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

      <Content style={{ padding: '48px', background: '#f5f5f5' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {children}
        </div>
      </Content>
    </AntLayout>
  );
};

export default Layout;
