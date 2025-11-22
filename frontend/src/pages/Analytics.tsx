import React from 'react';
import { Card, Empty, Typography } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Analytics: React.FC = () => {
  return (
    <div>
      <Title level={2}>Analytics & Reports</Title>
      <Paragraph type="secondary">
        View insights, performance metrics, and generate reports for your support operations.
      </Paragraph>

      <Card style={{ marginTop: 24 }}>
        <Empty
          image={<BarChartOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          description={
            <div>
              <Title level={4}>Coming Soon</Title>
              <Paragraph type="secondary">
                Analytics and reporting features will be available here. Track metrics like response times,
                resolution rates, customer satisfaction, and team performance.
              </Paragraph>
            </div>
          }
        />
      </Card>
    </div>
  );
};

export default Analytics;
