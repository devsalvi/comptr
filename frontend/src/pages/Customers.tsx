import React from 'react';
import { Card, Empty, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Customers: React.FC = () => {
  return (
    <div>
      <Title level={2}>Customer Management</Title>
      <Paragraph type="secondary">
        Manage your customer database, view customer profiles, and track customer interactions.
      </Paragraph>

      <Card style={{ marginTop: 24 }}>
        <Empty
          image={<UserOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          description={
            <div>
              <Title level={4}>Coming Soon</Title>
              <Paragraph type="secondary">
                Customer management features will be available here. Track customer information,
                history, and preferences all in one place.
              </Paragraph>
            </div>
          }
        />
      </Card>
    </div>
  );
};

export default Customers;
