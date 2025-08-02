

"use client"
import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Card,
  Checkbox,
  Input,
  Button,
  Avatar,
  Badge,
  Progress,
  Typography,
  Row,
  Col,
  List,
  Tag,
  Divider,
  Upload,
  message,
  Space,
  Tooltip,
  Dropdown,
  Calendar,
  Statistic
} from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  TeamOutlined,
  DollarOutlined,
  HomeOutlined,
  HeartOutlined,
  FileTextOutlined,
  BookOutlined,
  FolderOutlined,
  LockOutlined,
  BellOutlined,
  SearchOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  CloudUploadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  StarOutlined,
  StarFilled,
  PlusOutlined,
  UserAddOutlined,
  FolderAddOutlined,
  GiftOutlined,
  DownOutlined,
  MenuOutlined,
  CloseOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
  CarOutlined,
  IdcardOutlined,
  BankOutlined,
  BulbOutlined,
  MedicineBoxOutlined,
  EnterOutlined,
  LineChartOutlined,
  ReadOutlined,
  HistoryOutlined,
  TabletOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import WeatherWidget from './WeatherWidget';
import MarketsWidget from './MarketsWidget';
import TopNewsWidget from './TopNewsWidget';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Dragger } = Upload;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(['dashboard']);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [starredItems, setStarredItems] = useState<string[]>(['budget']);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [aiMessages, setAiMessages] = useState([
    { type: 'ai', content: 'Hi! How can I help you today?' }
  ]);
  const [aiInput, setAiInput] = useState('');

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Mock data
  const mockData = {
    user: {
      name: "John Smith",
      email: "john.smith@example.com",
      avatar: "JS"
    },
    weather: {
      location: "Ashburn, VA",
      temperature: 72,
      condition: "Partly Cloudy",
      high: 78,
      low: 65,
      rain: 20
    },
    news: [
      { title: "Fed Announces Rate Decision", time: "2 hours ago", important: true },
      { title: "Tech Giants Report Earnings", time: "5 hours ago", important: false }
    ],
    markets: [
      { name: "S&P 500", value: "5,487.03", change: "+0.85%", positive: true },
      { name: "NASDAQ", value: "17,862.31", change: "+1.24%", positive: true },
      { name: "DOW", value: "39,308.00", change: "-0.22%", positive: false }
    ],
    actions: [
      { id: '1', text: 'Update weak passwords', detail: '3 accounts at risk', icon: <ExclamationCircleOutlined />, priority: 'high' },
      { id: '2', text: 'Pay mortgage', detail: 'Due today - $1,450.00', icon: <DollarOutlined />, priority: 'high' },
      { id: '3', text: 'Car insurance payment', detail: 'Due tomorrow - $132.50', icon: <CarOutlined />, priority: 'medium' },
      { id: '4', text: 'Renew passport', detail: 'Expires in 45 days', icon: <IdcardOutlined />, priority: 'medium' },
      { id: '5', text: 'Review budget', detail: 'Monthly savings goal reached', icon: <BankOutlined />, priority: 'low' },
      { id: '6', text: 'Bundle subscriptions', detail: 'Save $5/month', icon: <BulbOutlined />, priority: 'low' },
      { id: '7', text: 'Schedule checkup', detail: 'Annual physical due', icon: <MedicineBoxOutlined />, priority: 'medium' }
    ],
    upcomingActivities: [
      { title: 'Team Standup', time: 'Today 9:00 AM', color: '#3b82f6' },
      { title: "Doctor's Appointment", time: 'Today 2:00 PM', color: '#10b981' },
      { title: "Sarah's Birthday", time: 'Jun 23', color: '#8b5cf6' },
      { title: 'Internet Bill Due', time: 'Jun 25 - $89.99', color: '#f59e0b' }
    ],
    recentActivity: [
      { id: '1', name: 'Tax Return 2024.pdf', time: '2 hours ago', type: 'pdf', starred: false },
      { id: '2', name: 'Monthly Budget.xlsx', time: '5 hours ago', type: 'excel', starred: true },
      { id: '3', name: 'Passport Scan.jpg', time: 'Yesterday', type: 'image', starred: false }
    ]
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'command-center',
      label: 'COMMAND CENTER',
      type: 'group',
    },
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'planner',
      icon: <CalendarOutlined />,
      label: 'Planner',
    },
    {
      key: 'hubs',
      label: 'HUBS',
      type: 'group',
    },
    {
      key: 'family',
      icon: <TeamOutlined />,
      label: 'Family',
    },
    {
      key: 'finance',
      icon: <DollarOutlined />,
      label: 'Finance',
    },
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: 'health',
      icon: <HeartOutlined />,
      label: 'Health',
    },
    {
      key: 'utilities',
      label: 'UTILITIES',
      type: 'group',
    },
    {
      key: 'notes',
      icon: <FileTextOutlined />,
      label: 'Notes & Lists',
    },
    {
      key: 'bookmarks',
      icon: <BookOutlined />,
      label: 'Bookmarks',
    },
    {
      key: 'files',
      icon: <FolderOutlined />,
      label: 'Files',
    },
    {
      key: 'vault',
      icon: <LockOutlined />,
      label: 'Vault',
    },
  ];

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
    if (!completedTasks.includes(taskId)) {
      message.success('Task completed!');
    }
  };

  const toggleStar = (itemId: string) => {
    setStarredItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const sendAiMessage = () => {
    if (!aiInput.trim()) return;

    const newMessages = [
      ...aiMessages,
      { type: 'user', content: aiInput },
      { type: 'ai', content: 'I can help you with that! Let me analyze your data...' }
    ];
    setAiMessages(newMessages);
    setAiInput('');
  };

  const userMenuItems = [
    { key: 'profile', label: 'Profile Settings' },
    { key: 'preferences', label: 'Preferences' },
    { key: 'logout', label: 'Sign Out' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const sidebarStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 1000,
    transition: 'all 0.3s ease',
    transform: mobileMenuVisible ? 'translateX(0)' : 'translateX(-100%)',
  };

  const contentStyle: React.CSSProperties = {
    marginLeft: collapsed ? 80 : 260,
    transition: 'margin-left 0.3s ease',
    minHeight: '100vh',
    background: '#f5f5f7',
  };

  const mobileOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    display: mobileMenuVisible ? 'block' : 'none',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', marginTop: 70 }}>
      {/* Mobile Overlay */}
      <div style={mobileOverlayStyle} onClick={() => setMobileMenuVisible(false)} />

      {/* Main Content */}
      <Layout style={{}}>
        {/* Content */}
        <Content style={{ padding: '24px', overflow: 'auto' }}>
          <div style={{ maxWidth: '1800px', margin: '0 50px' }}>
            {/* Welcome Section */}
            <div style={{
              marginBottom: '24px',
              animation: 'fadeIn 0.6s ease-out'
            }}>
              <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
                Good morning, {mockData.user.name.split(' ')[0]}!
              </Title>
              <Text style={{ color: '#6b7280', fontSize: '16px' }}>
                {formatDate(currentTime)}
              </Text>
            </div>

            {/* Top Widgets with Hover Effect - NO MARGIN BOTTOM INITIALLY */}
            <div className="widgets-container" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '10px', // Changed from '10px' to '0px'
            }}>
              <WeatherWidget />
              <TopNewsWidget />
              <MarketsWidget />
            </div>

            {/* Command Center */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DashboardOutlined style={{ color: '#3b82f6' }} />
                  <span style={{ fontWeight: 500 }}>Command Center</span>
                </div>
              }
              style={{ borderRadius: '12px' }}
              bodyStyle={{ padding: '24px' }}
            >
              <Row gutter={[24, 24]}>
                {/* Left Column - Actions & Notifications */}
                <Col xs={24} lg={8}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <Title level={5} style={{
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#4b5563',
                      fontSize: '14px'
                    }}>
                      <TabletOutlined style={{ color: '#6b7280' }} />
                      Actions & Notifications
                    </Title>
                    <Badge count={mockData.actions.filter(a => !completedTasks.includes(a.id)).length} size="small" />
                  </div>
                  <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <List
                      dataSource={mockData.actions}
                      renderItem={(item) => (
                        <List.Item style={{
                          padding: '8px',
                          border: 'none',
                          borderRadius: '8px',
                          marginBottom: '4px',
                          transition: 'background 0.2s ease',
                          cursor: 'pointer'
                        }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Checkbox
                            checked={completedTasks.includes(item.id)}
                            onChange={() => toggleTask(item.id)}
                            style={{ marginRight: '12px' }}
                          />
                          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <div style={{ color: getPriorityColor(item.priority), marginTop: '2px' }}>
                              {item.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontSize: '14px',
                                  fontWeight: 500,
                                  color: '#1f2937',
                                  textDecoration: completedTasks.includes(item.id) ? 'line-through' : 'none',
                                  opacity: completedTasks.includes(item.id) ? 0.6 : 1,
                                  transition: 'all 0.3s ease'
                                }}
                              >
                                {item.text}
                              </Text>
                              <br />
                              <Text style={{ fontSize: '12px', color: item.priority === 'high' ? '#f59e0b' : '#6b7280' }}>
                                {item.detail}
                              </Text>
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                </Col>

                {/* Middle Column - Upcoming Activities & Recent Activity */}
                <Col xs={24} lg={8}>
                  {/* Upcoming Activities */}
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <Title level={5} style={{
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#4b5563',
                        fontSize: '14px'
                      }}>
                        <CalendarOutlined style={{ color: '#6b7280' }} />
                        Upcoming Activities
                      </Title>
                      <Button type="link" size="small" style={{ padding: 0, fontSize: '12px' }}>
                        View All →
                      </Button>
                    </div>
                    <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                      <List
                        dataSource={mockData.upcomingActivities}
                        renderItem={(item) => (
                          <List.Item style={{
                            padding: '8px',
                            border: 'none',
                            borderRadius: '8px',
                            marginBottom: '4px',
                            transition: 'background 0.2s ease',
                            cursor: 'pointer'
                          }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                              <div style={{
                                width: '4px',
                                height: '32px',
                                background: item.color,
                                borderRadius: '2px'
                              }} />
                              <div style={{ flex: 1 }}>
                                <Text style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
                                  {item.title}
                                </Text>
                                <br />
                                <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                                  {item.time}
                                </Text>
                              </div>
                            </div>
                          </List.Item>
                        )}
                      />
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <Title level={5} style={{
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#4b5563',
                        fontSize: '14px'
                      }}>
                        <HistoryOutlined style={{ color: '#6b7280' }} />
                        Recent Activity
                      </Title>
                      <Button type="link" size="small" style={{ padding: 0, fontSize: '12px' }}>
                        See All →
                      </Button>
                    </div>
                    <div style={{ maxHeight: '192px', overflowY: 'auto' }}>
                      <List
                        dataSource={mockData.recentActivity}
                        renderItem={(item) => (
                          <List.Item style={{
                            padding: '8px',
                            border: 'none',
                            borderRadius: '8px',
                            marginBottom: '4px',
                            transition: 'background 0.2s ease',
                            cursor: 'pointer'
                          }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                background: item.type === 'pdf' ? '#dbeafe' : item.type === 'excel' ? '#dcfce7' : '#e0e7ff',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <FileOutlined style={{
                                  color: item.type === 'pdf' ? '#3b82f6' : item.type === 'excel' ? '#10b981' : '#8b5cf6',
                                  fontSize: '12px'
                                }} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <Text style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
                                  {item.name}
                                </Text>
                                <br />
                                <Text style={{ fontSize: '11px', color: '#6b7280' }}>
                                  {item.time}
                                </Text>
                              </div>
                              <Button
                                type="text"
                                size="small"
                                icon={starredItems.includes(item.id) ? <StarFilled style={{ color: '#f59e0b' }} /> : <StarOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStar(item.id);
                                }}
                                style={{ padding: '4px' }}
                              />
                            </div>
                          </List.Item>
                        )}
                      />
                    </div>
                  </div>
                </Col>

                {/* Right Column - Search, AI Assistant, Quick Actions */}
                <Col xs={24} lg={8}>
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Quick Search */}
                    <div>
                      <Title level={5} style={{
                        margin: '0 0 8px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#4b5563',
                        fontSize: '14px'
                      }}>
                        <SearchOutlined style={{ color: '#6b7280' }} />
                        Quick Search
                      </Title>
                      <Search
                        placeholder="Search accounts, documents, notes..."
                        style={{ marginBottom: '8px' }}
                        size="middle"
                      />
                      <Space wrap>
                        {['Docs', 'Accounts', 'Notes'].map(filter => (
                          <Tag
                            key={filter}
                            color={activeFilters.includes(filter) ? 'blue' : 'default'}
                            style={{
                              cursor: 'pointer',
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '12px'
                            }}
                            onClick={() => toggleFilter(filter)}
                          >
                            <FileOutlined style={{ marginRight: '4px' }} />
                            {filter}
                          </Tag>
                        ))}
                      </Space>
                    </div>

                    {/* AI Assistant */}
                    <div>
                      <Title level={5} style={{
                        margin: '0 0 8px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#4b5563',
                        fontSize: '14px'
                      }}>
                        <RobotOutlined style={{ color: '#6b7280' }} />
                        AI Assistant
                      </Title>
                      <div style={{
                        background: '#f9fafb',
                        borderRadius: '8px',
                        padding: '12px'
                      }}>
                        <div style={{
                          background: 'white',
                          padding: '8px',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                          <Text style={{ fontSize: '12px', color: '#4b5563' }}>
                            {aiMessages[aiMessages.length - 1]?.content}
                          </Text>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Input
                            size="small"
                            placeholder="Ask: What bills are due? Show spending..."
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            onPressEnter={sendAiMessage}
                            style={{ fontSize: '12px', padding: '4px 8px', flex: 1 }}
                            suffix={
                              <Button
                                type="primary"
                                size="small"
                                icon={<CheckOutlined />}
                                onClick={sendAiMessage}
                              />
                            }
                          />

                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <Title level={5} style={{
                        margin: '0 0 12px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#4b5563',
                        fontSize: '14px'
                      }}>
                        <ThunderboltOutlined style={{ color: '#6b7280' }} />
                        Quick Actions
                      </Title>
                      <Row gutter={[8, 8]} style={{ marginBottom: '12px' }}>
                        <Col span={12}>
                          <Button
                            style={{
                              width: '100%',
                              height: '44px', // Increased height
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              fontSize: '14px',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '10px'
                            }}
                            icon={<CalendarOutlined />}
                          >
                            Add Event
                          </Button>
                        </Col>
                        <Col span={12}>
                          <Button
                            style={{
                              width: '100%',
                              height: '44px',
                              background: '#f0fdf4',
                              color: '#16a34a',
                              border: '1px solid #bbf7d0',
                              fontSize: '14px',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '10px'
                            }}
                            icon={<PlusOutlined />}
                          >
                            Add Task
                          </Button>
                        </Col>
                        <Col span={12}>
                          <Button
                            style={{
                              width: '100%',
                              height: '44px',
                              background: '#fffbeb',
                              color: '#ca8a04',
                              border: '1px solid #fde68a',
                              fontSize: '14px',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '10px'
                            }}
                            icon={<FileTextOutlined />}
                          >
                            Add Note
                          </Button>
                        </Col>
                        <Col span={12}>
                          <Button
                            style={{
                              width: '100%',
                              height: '44px',
                              background: '#faf5ff',
                              color: '#9333ea',
                              border: '1px solid #d8b4fe',
                              fontSize: '14px',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '10px'
                            }}
                            icon={<StarOutlined />}
                          >
                            Bookmark
                          </Button>
                        </Col>
                        <Col span={12}>
                          <Button
                            style={{
                              width: '100%',
                              height: '44px',
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              fontSize: '14px',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '10px'
                            }}
                            icon={<UserAddOutlined />}
                          >
                            Account
                          </Button>
                        </Col>
                        <Col span={12}>
                          <Button
                            style={{
                              width: '100%',
                              height: '44px',
                              background: '#f0f9ff',
                              color: '#0369a1',
                              border: '1px solid #bae6fd',
                              fontSize: '14px',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '10px'
                            }}
                            icon={<FolderAddOutlined />}
                          >
                            Create Hub
                          </Button>
                        </Col>
                      </Row>

                      {/* Drag & Drop Area */}
                      <Dragger
                        multiple
                        showUploadList={false}
                        customRequest={({ onSuccess }) => {
                          setTimeout(() => {
                            if (onSuccess) onSuccess("ok");
                            message.success('Files uploaded successfully!');
                          }, 1000);
                        }}
                        style={{
                          border: '2px dashed #d1d5db',
                          borderRadius: '8px',
                          background: 'transparent',
                          padding: '12px',
                          textAlign: 'center'
                        }}
                      >
                        <CloudUploadOutlined style={{ fontSize: '20px', color: '#9ca3af', marginBottom: '4px' }} />
                        <Text style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500, display: 'block' }}>
                          Drag & Drop Files
                        </Text>
                      </Dragger>
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>
          </div>
        </Content>
      </Layout>

      {/* Custom Animations and Hover Effects */}
      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Widget Container Hover Effects */
        .widgets-container {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .widgets-container .widget-card {
          height: 160px; /* Shorter initial height */
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center;
          overflow: hidden;
        }
        
        /* When hovering over the widgets container, all widgets grow and container gets margin */
        .widgets-container:hover {
          margin-bottom: 24px; /* Creates space between widgets and command center */
        }
        
        .widgets-container:hover .widget-card {
          height: 280px; /* Taller height on hover */
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08);
        }
        
        .ant-card {
          animation: fadeIn 0.6s ease-out;
        }
        
        .ant-card:nth-child(2) {
          animation-delay: 0.1s;
        }
        
        .ant-card:nth-child(3) {
          animation-delay: 0.2s;
        }
        
        .ant-badge-dot {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @media (max-width: 768px) {
          .ant-layout-sider {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          
          .ant-layout-sider.mobile-open {
            transform: translateX(0);
          }
          
          .widgets-container .widget-card {
            height: 140px; /* Shorter for mobile */
          }
          
          .widgets-container:hover .widget-card {
            height: 240px; /* Taller on hover for mobile */
          }
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}

export default App;


