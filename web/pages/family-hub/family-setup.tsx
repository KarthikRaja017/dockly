
'use client';
import React, { useState } from 'react';
import { Card, Button, Typography, Row, Col, Modal } from 'antd';
import {
  ArrowRightOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

const FamilyIntroBoard: React.FC = () => {
  const [isFamilyUser, setIsFamilyUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setIsFamilyUser(true);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error setting up family hub:', error);
      setLoading(false);
    }
  };
  const [username, setUsername] = useState<string | null>(null);
    useEffect(() => {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    }, [])
  const showModal = () => {
    setIsModalVisible(true);
    // localStorage.setItem("family-hub", "1");
    // router.push(`/${username}/family-hub`);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    localStorage.setItem("family-hubs", "1");
    router.push(`/${username}/family-hub`);
  };

  return (
    <Card style={{ padding: '0px 24px' }} loading={loading}>
      {!isFamilyUser ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              padding: '20px 0',
            }}
          >
            {/* <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>Dockly</div>
            <div style={{ fontSize: '18px', color: '#555' }}>JS</div> */}
          </div>

          <Row
            gutter={24}
            style={{
              marginTop: 75,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Col xs={24} md={12}>
              <img
                src="/manager/familyhub.jpg"
                alt="Family Illustration"
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  borderRadius: 12,
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `
                    <div style="
                      width: 100%;
                      height: 400px;
                      background: #e8ecef;
                      border-radius: 12px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: #666;
                      font-size: 16px;
                    ">
                      [Family Illustration Placeholder]
                    </div>
                  `;
                }}
              />
            </Col>
            <Col xs={24} md={12}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'start',
                  justifyContent: 'center',
                  padding: '0 20px',
                }}
              >
                <Title level={1}>Welcome to Your Family Hub</Title>
                <Paragraph style={{ maxWidth: 500, fontSize: 18 }}>
                  Your central command center for managing family schedules, documents, tasks, and important information in one collaborative space.
                </Paragraph>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: 20,
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  style={{
                    borderRadius: 10,
                    background: '#0052cc',
                    marginTop: 20,
                    padding: '10px 20px',
                  }}
                  onClick={showModal}
                >
                  Get Started
                  <ArrowRightOutlined />
                </Button>
              </div>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
            <Col xs={24} sm={12}>
              <FamilyInfoCard
                icon={<UserOutlined />}
                title="Family Profiles"
                description="Create profiles for each family member and customize access levels for shared information and documents."
              />
            </Col>

            <Col xs={24} sm={12}>
              <FamilyInfoCard
                icon={<CalendarOutlined />}
                title="Shared Calendar"
                description="Coordinate family schedules, events, appointments, and activities with a collaborative calendar."
              />
            </Col>

            <Col xs={24} sm={12}>
              <FamilyInfoCard
                icon={<FileTextOutlined />}
                title="Important Documents"
                description="Store and organize family records, school documents, health information, and essential paperwork."
              />
            </Col>

            <Col xs={24} sm={12}>
              <FamilyInfoCard
                icon={<CheckSquareOutlined />}
                title="Task Management"
                description="Create and assign tasks, chores, and to-do lists that the whole family can see and update."
              />
            </Col>
          </Row>

          <div
            style={{
              backgroundColor: '#e6f7ff',
              padding: '20px',
              borderRadius: 8,
              marginTop: 30,
              width: 1350,
              textAlign: 'left',
            }}
          >
            <Title level={3} style={{ color: '#1890ff' }}>
              How does it work?
            </Title>
            <Paragraph style={{ fontSize: 18 }}>
              To set up your Family Hub, we'll guide you through a few simple steps:
            </Paragraph>
            <ul style={{ fontSize: 16, marginLeft: 20 }}>
              <li>Add family members and customize their profiles and access levels</li>
              <li>Connect and sync family calendars from Google, Apple, or Outlook</li>
              <li>Upload important family documents and organize them in categories</li>
              <li>Create shared task lists and set up reminder notifications</li>
            </ul>
            <Paragraph style={{ fontSize: 16 }}>
              Your Family Hub is protected with advanced security to ensure your family's information stays private and secure.
            </Paragraph>
          </div>

          <div style={{ textAlign: 'center', padding: '20px', marginTop: '30px' }}>
            <Button
              type="primary"
              size="large"
              onClick={showModal}
              style={{
                background: '#0052cc',
                borderColor: '#0052cc',
                borderRadius: '4px',
                fontSize: '16px',
                height: '40px',
                width: '100%',
                maxWidth: '300px',
              }}
            >
              Set Up Your Family Hub
            </Button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            fontSize: '24px',
            color: '#666',
          }}
        >
          Family Hub Setup (Placeholder)
        </div>
      )}

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '24px', color: '#0052cc', marginRight: '10px' }}>D</span>
            <span style={{ fontWeight: 'bold' }}>Dockly</span>
          </div>
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="start"
            type="primary"
            onClick={handleCancel}
            style={{ background: '#0052cc', borderColor: '#0052cc' }}
          >
            Start Family Hub Setup
          </Button>,
        ]}
        style={{ borderRadius: '8px' }}
      >
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          Ready to set up your Family Hub? Let's get started by adding family members, connecting calendars, and organizing your family's important information.
        </Paragraph>
      </Modal>
    </Card>
  );
};

const FamilyInfoCard = (props: any) => {
  const { title, description, icon, style } = props;
  return (
    <Card
      variant="outlined"
      hoverable
      style={{
        width: '100%',
        maxWidth: 650,
        marginBottom: 0,
        ...style,
      }}
    >
      <Title level={4} style={{ display: 'flex', alignItems: 'center' }}>
        {icon}
        <span style={{ marginLeft: 8 }}>{title}</span>
      </Title>
      <Paragraph style={{ fontSize: 16 }}>{description}</Paragraph>
    </Card>
  );
};

export default FamilyIntroBoard;

