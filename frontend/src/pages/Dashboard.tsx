import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ticketsApi, Ticket } from '../api/tickets';
import {
  Card, Row, Col, Statistic, Select, Button, Empty, Spin, Alert, Typography, Space, Tag, Avatar
} from 'antd';
import {
  InboxOutlined,
  AlertOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import ChannelBadge from '../components/ChannelBadge';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tickets', statusFilter],
    queryFn: () => ticketsApi.getTickets({ status: statusFilter || undefined }),
    refetchInterval: 10000,
    retry: 2,
  });

  const tickets: Ticket[] = data?.tickets || [];

  const stats = useMemo(() => {
    const allTickets = data?.tickets || [];
    return {
      total: allTickets.length,
      new: allTickets.filter((t: Ticket) => t.status === 'new').length,
      open: allTickets.filter((t: Ticket) => t.status === 'open').length,
      resolved: allTickets.filter((t: Ticket) => t.status === 'resolved').length,
    };
  }, [data]);

  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  const getLastMessage = (ticket: Ticket) => {
    if (ticket.timeline.length === 0) return null;
    return ticket.timeline[ticket.timeline.length - 1];
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col xs={24} sm={24} md={16}>
          <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
          <Text type="secondary">Unified inbox for all customer support channels</Text>
        </Col>
        <Col xs={24} sm={24} md={8} style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            size="large"
            block
            style={{ maxWidth: 200 }}
          >
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Tickets"
              value={stats.total}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="New"
              value={stats.new}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Open"
              value={stats.open}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Resolved"
              value={stats.resolved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={16}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong>Filter by:</Text>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%', maxWidth: 300 }}
                placeholder="All Statuses"
              >
                <Option value="">All Statuses</Option>
                <Option value="new">New</Option>
                <Option value="open">Open</Option>
                <Option value="pending_customer">Pending Customer</Option>
                <Option value="resolved">Resolved</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
            <Text type="secondary">
              {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Tickets Section */}
      <div>
        <Title level={3} style={{ marginBottom: 24 }}>Recent Tickets</Title>

        {error ? (
          <Alert
            message="Unable to load tickets"
            description="There was a problem loading your tickets. This could be due to a network issue or authentication problem."
            type="error"
            showIcon
            action={
              <Button type="primary" onClick={() => refetch()}>
                Try Again
              </Button>
            }
          />
        ) : isLoading ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text>Loading tickets...</Text>
              </div>
            </div>
          </Card>
        ) : tickets.length === 0 ? (
          <Card>
            <Empty
              description={
                statusFilter
                  ? 'No tickets match your current filters. Try adjusting your filter criteria.'
                  : 'No support tickets yet. New tickets will appear here.'
              }
            />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {tickets.map((ticket) => {
              const lastMessage = getLastMessage(ticket);
              return (
                <Col xs={24} md={12} xl={8} key={ticket.ticket_id}>
                  <Card
                    hoverable
                    onClick={() => handleTicketClick(ticket.ticket_id)}
                    style={{ height: '100%' }}
                  >
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      {/* Badges */}
                      <Space wrap>
                        <ChannelBadge channel={ticket.source.channel} />
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                        {ticket.source.is_bot_handoff && (
                          <Tag color="purple">Bot Handoff</Tag>
                        )}
                      </Space>

                      {/* Subject */}
                      <Title level={5} style={{ margin: 0 }} ellipsis={{ rows: 2 }}>
                        {ticket.subject}
                      </Title>

                      {/* Customer */}
                      <Space size="small">
                        <Avatar size="small" icon={<UserOutlined />} />
                        <Text>{ticket.customer.name || ticket.customer.channel_identity}</Text>
                      </Space>

                      {/* Last Message Preview */}
                      {lastMessage && (
                        <Paragraph type="secondary" ellipsis={{ rows: 3 }} style={{ margin: 0 }}>
                          {lastMessage.content}
                        </Paragraph>
                      )}

                      {/* Footer */}
                      <Row justify="space-between">
                        <Col>
                          <Space size="small">
                            <MessageOutlined style={{ fontSize: 12 }} />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {ticket.timeline.length} {ticket.timeline.length === 1 ? 'msg' : 'msgs'}
                            </Text>
                          </Space>
                        </Col>
                        <Col>
                          <Space size="small">
                            <ClockCircleOutlined style={{ fontSize: 12 }} />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
                            </Text>
                          </Space>
                        </Col>
                      </Row>
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </Space>
  );
};

export default Dashboard;
