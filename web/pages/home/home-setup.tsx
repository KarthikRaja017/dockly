
'use client';
import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Row, Col, Modal } from 'antd';
import {
  ArrowRightOutlined,
  HomeOutlined,
  BulbOutlined,
  ToolOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

const HomeIntroBoard: React.FC = () => {
  const [isHomeUser, setIsHomeUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();
  const [step, setStep] = useState(1);

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setIsHomeUser(true);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error setting up home board:', error);
      setLoading(false);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [])

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handlesubmit = () => {
    localStorage.setItem("home-hub", "1");
    router.push(`/${username}/home-hub`);
  }

  return (
    <Card style={{ padding: '0px 24px' }} loading={loading}>
      {!isHomeUser ? (
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
                src="/manager/home.jpg"
                alt="Home Illustration"
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
                      [Home Illustration Placeholder]
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
                <Title level={1}>Welcome to Your Home Board</Title>
                <Paragraph style={{ maxWidth: 500, fontSize: 18 }}>
                  Your central dashboard for managing all aspects of your home - from mortgage and property details to utilities, maintenance, and household documents.
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
              <HomeInfoCard
                icon={<HomeOutlined />}
                title="Property Details"
                description="Connect to Zillow, Redfin, or input your property details manually to track value, mortgage info, and important documents."
              />
            </Col>

            <Col xs={24} sm={12}>
              <HomeInfoCard
                icon={<BulbOutlined />}
                title="Utilities & Services"
                description="Track all your home utilities and services in one place - electricity, water, internet, streaming services, and more."
              />
            </Col>

            <Col xs={24} sm={12}>
              <HomeInfoCard
                icon={<ToolOutlined />}
                title="Maintenance Tracker"
                description="Schedule and track regular home maintenance tasks with reminders for HVAC, appliances, garden, and seasonal upkeep."
              />
            </Col>

            <Col xs={24} sm={12}>
              <HomeInfoCard
                icon={<TeamOutlined />}
                title="Family Coordination"
                description="Share home information with family members and coordinate responsibilities for a well-maintained household."
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
              To set up your Home Board, we'll help you connect your property information and home services. This allows you to:
            </Paragraph>
            <ul style={{ fontSize: 16, marginLeft: 20 }}>
              <li>Import your property details from Zillow or other real estate platforms</li>
              <li>Connect your utility accounts to monitor bills and usage in one place</li>
              <li>Set up maintenance schedules with automatic reminders</li>
              <li>Store important home documents securely for easy access</li>
            </ul>
            <Paragraph style={{ fontSize: 16 }}>
              You'll be able to connect multiple services including your mortgage provider, utility companies, home insurance, and property tax information.
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
              Set Up Your Home Board
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
          Home Board Setup (Placeholder)
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
            key="launch"
            type="primary"
            onClick={handlesubmit}
            style={{ background: '#0052cc', borderColor: '#0052cc' }}
          >
            Launch Setup Home
          </Button>,
        ]}
        style={{ borderRadius: '8px' }}
      >
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          Ready to set up your Home Board? The setup wizard will guide you through connecting your property information, utilities, and setting up maintenance schedules.
        </Paragraph>
      </Modal>
    </Card>
  );
};

const HomeInfoCard = (props: any) => {
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

export default HomeIntroBoard;
