import React from 'react';
import { Card, Empty, Typography } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Settings: React.FC = () => {
  return (
    <div>
      <Title level={2}>Settings</Title>
      <Paragraph type="secondary">
        Configure your workspace, integrations, and team preferences.
      </Paragraph>

      <Card style={{ marginTop: 24 }}>
        <Empty
          image={<SettingOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          description={
            <div>
              <Title level={4}>Coming Soon</Title>
              <Paragraph type="secondary">
                Settings and configuration options will be available here. Manage workspace settings,
                user permissions, channel integrations, and notification preferences.
              </Paragraph>
            </div>
          }
        />
      </Card>
    </div>
  );
};

export default Settings;
