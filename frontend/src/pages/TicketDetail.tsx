import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '../api/tickets';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Card,
  Button,
  Input,
  Select,
  Checkbox,
  Space,
  Typography,
  Spin,
  Alert,
  Tag,
  Divider,
  Row,
  Col,
  Grid,
} from 'antd';
import {
  ArrowLeftOutlined,
  SendOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  LoadingOutlined,
  WarningOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import ChannelBadge from '../components/ChannelBadge';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import MessageBubble from '../components/MessageBubble';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const TicketDetail: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const screens = useBreakpoint();

  const [messageContent, setMessageContent] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const isMobile = !screens.md;

  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketsApi.getTicket(ticketId!),
    enabled: !!ticketId,
    refetchInterval: 5000,
    retry: 2,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (message: { content: string; visibility: 'public' | 'internal' }) =>
      ticketsApi.addMessage(ticketId!, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      setMessageContent('');
      toast.success('Message sent successfully');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) =>
      ticketsApi.updateTicket(ticketId!, { status: status as any }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      toast.success('Status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const handleSendMessage = () => {
    if (!messageContent.trim()) return;

    sendMessageMutation.mutate({
      content: messageContent,
      visibility: isInternalNote ? 'internal' : 'public',
    });
  };

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    updateStatusMutation.mutate(newStatus);
  };

  if (isLoading) {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/tickets')}
        >
          Back to tickets
        </Button>
        <Card>
          <div style={{ textAlign: 'center', padding: '96px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 24 }}>
              <Text>Loading ticket details...</Text>
            </div>
          </div>
        </Card>
      </Space>
    );
  }

  if (error) {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/tickets')}
        >
          Back to tickets
        </Button>
        <Card>
          <Alert
            message="Unable to load ticket"
            description="We couldn't load this ticket. It may have been deleted or you may not have permission to view it."
            type="error"
            showIcon
            icon={<WarningOutlined />}
            action={
              <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/tickets')}>
                Back to Tickets
              </Button>
            }
          />
        </Card>
      </Space>
    );
  }

  if (!ticket) {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/tickets')}
        >
          Back to tickets
        </Button>
        <Card>
          <Alert
            message="Ticket not found"
            description="The ticket you're looking for doesn't exist or has been removed."
            type="warning"
            showIcon
            icon={<InboxOutlined />}
            action={
              <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/tickets')}>
                Back to Tickets
              </Button>
            }
          />
        </Card>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/tickets')}
      >
        Back to tickets
      </Button>

      {/* Header Card */}
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={18}>
              <Title level={2} style={{ marginTop: 0, marginBottom: 16 }}>
                {ticket.subject}
              </Title>
              <Space wrap style={{ marginBottom: 16 }}>
                <ChannelBadge channel={ticket.source.channel} />
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </Space>
              <Space direction="vertical" size="small">
                <Text strong>Customer: {ticket.customer.name || ticket.customer.channel_identity}</Text>
                {ticket.customer.primary_email && (
                  <Text>Email: {ticket.customer.primary_email}</Text>
                )}
                <Text type="secondary">Ticket ID: {ticket.ticket_id}</Text>
                <Text type="secondary">Created: {format(new Date(ticket.created_at), 'PPpp')}</Text>
              </Space>
            </Col>

            {/* Status selector */}
            <Col xs={24} md={6}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Status
              </Text>
              <Select
                value={selectedStatus || ticket.status}
                onChange={handleStatusChange}
                style={{ width: '100%', maxWidth: 200 }}
              >
                <Option value="new">New</Option>
                <Option value="open">Open</Option>
                <Option value="pending_customer">Pending Customer</Option>
                <Option value="resolved">Resolved</Option>
                <Option value="closed">Closed</Option>
              </Select>
            </Col>
          </Row>

          {ticket.tags.length > 0 && (
            <>
              <Divider style={{ margin: '16px 0' }} />
              <Space wrap>
                {ticket.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            </>
          )}
        </Space>
      </Card>

      {/* Timeline Card */}
      <Card title="Conversation Timeline">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {ticket.timeline.map((message) => (
            <MessageBubble key={message.message_id} message={message} />
          ))}
        </Space>
      </Card>

      {/* Reply Box Card */}
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Checkbox
            checked={isInternalNote}
            onChange={(e) => setIsInternalNote(e.target.checked)}
          >
            <Space size="small">
              {isInternalNote ? (
                <>
                  <EyeInvisibleOutlined />
                  <Text>Internal Note (not visible to customer)</Text>
                </>
              ) : (
                <>
                  <EyeOutlined />
                  <Text>Public Reply (sent to customer)</Text>
                </>
              )}
            </Space>
          </Checkbox>

          <TextArea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSendMessage();
              }
            }}
            placeholder={
              isInternalNote
                ? 'Add an internal note...'
                : 'Type your reply to the customer...'
            }
            rows={4}
            autoSize={{ minRows: 4, maxRows: 8 }}
          />

          <Row justify="space-between" align="middle" gutter={[16, 8]}>
            <Col xs={24} sm={12}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Cmd/Ctrl + Enter to send
              </Text>
            </Col>
            <Col xs={24} sm={12} style={{ textAlign: isMobile ? 'left' : 'right' }}>
              <Button
                type="primary"
                icon={sendMessageMutation.isPending ? <LoadingOutlined /> : <SendOutlined />}
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || sendMessageMutation.isPending}
                size="large"
                block={isMobile}
              >
                Send {isInternalNote ? 'Note' : 'Reply'}
              </Button>
            </Col>
          </Row>
        </Space>
      </Card>
    </Space>
  );
};

export default TicketDetail;
