"use client";
import React, { useState } from "react";
import { Card, Button, Typography, Row, Col, Input } from "antd";
import {
  ArrowRightOutlined,
  BarChartOutlined,
  CreditCardOutlined,
  DollarCircleOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import { PRIMARY_COLOR } from "../../app/comman";
import { bankConnect } from "../../services/apiConfig";
import { useQuilttSession } from "@quiltt/react";
import { showNotification } from "../../utils/notification";
import { useCurrentUser } from "../../app/userContext";
import SetupFinanceBoard from "./setUpFinanceboard";
import { useGlobalLoading } from "../../app/loadingContext";

const { Title, Paragraph, Text } = Typography;

const FinanceIntroBoard = () => {
  const [isFinanceUser, setIsFinanceUser] = useState(false);
  const { loading, setLoading } = useGlobalLoading();
  const { importSession } = useQuilttSession();

  const currentUser = useCurrentUser();
  const handleGetStarted = async () => {
    setLoading(true);
    try {
      const response = await bankConnect({ currentUser });

      if (!response) {
        showNotification("Error", "Signup failed", "error");
        throw new Error("Signup failed");
      }

      if (response.data?.token) {
        const { token } = response.data;
        importSession(token);
        setIsFinanceUser(true);
      }
    } catch (error) {
      showNotification("Error", "Signup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ padding: "0px 24px" }} loading={loading}>
      {!isFinanceUser ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Row
            gutter={24}
            style={{
              marginTop: 75,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Col xs={24} md={12}>
              <img
                src="/finance.jpg"
                alt="Finance Illustration"
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  borderRadius: 12,
                  objectFit: "cover",
                }}
              />
            </Col>
            <Col xs={24} md={12}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                  justifyContent: "center",
                  padding: "0 20px",
                }}
              >
                <Title level={1}>Welcome to Your Finance Board</Title>
                <Paragraph style={{ maxWidth: 500, fontSize: 18 }}>
                  Your complete financial command center that helps you track,
                  manage, and optimize your finances in one place.
                </Paragraph>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginLeft: 20,
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  style={{
                    borderRadius: 10,
                    background: PRIMARY_COLOR,
                    marginTop: 20,
                    padding: "10px 20px",
                  }}
                  onClick={handleGetStarted}
                >
                  Get Started
                  <ArrowRightOutlined />
                </Button>
              </div>
            </Col>
          </Row>
          <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
            <Col xs={24} sm={12}>
              <FinanceInfoCard
                icon={<BarChartOutlined />}
                title="Financial Overview"
                description="Get a clear picture of your income, expenses, and net worth with real-time updates and smart insights."
              />
            </Col>

            <Col xs={24} sm={12}>
              <FinanceInfoCard
                icon={<CreditCardOutlined />}
                title="Bill Tracking"
                description="Never miss a payment with automated bill tracking, due date reminders, and payment history."
              />
            </Col>

            <Col xs={24} sm={12}>
              <FinanceInfoCard
                icon={<PieChartOutlined />}
                title="Budget Management"
                description="Set and track budgets across categories with visual progress bars and spending analysis."
              />
            </Col>

            <Col xs={24} sm={12}>
              <FinanceInfoCard
                icon={<DollarCircleOutlined />}
                title="Financial Goals"
                description="Set savings goals and track your progress with automated calculations and smart recommendations."
              />
            </Col>
          </Row>

          <div
            style={{
              backgroundColor: "#e6f7ff",
              padding: "20px",
              borderRadius: 8,
              marginTop: 50,
              width: 1300,
              textAlign: "left",
              // marginLeft: 55,
            }}
          >
            <Title level={3} style={{ color: "#1890ff" }}>
              How does it work?
            </Title>
            <Paragraph style={{ fontSize: 18 }}>
              To set up your Finance Board, we'll connect securely to your
              financial accounts. This allows us to:
            </Paragraph>
            <ul style={{ fontSize: 16, marginLeft: 20 }}>
              <li>Automatically import and categorize your transactions</li>
              <li>Update your account balances in real-time</li>
              <li>Identify recurring bills and subscriptions</li>
              <li>Provide personalized insights about your spending habits</li>
            </ul>
            <Paragraph style={{ fontSize: 16 }}>
              You'll be able to connect multiple accounts including checking,
              savings, credit cards, loans, investments, and more.
            </Paragraph>
          </div>
        </div>
      ) : (
        <SetupFinanceBoard />
      )}
    </Card>
  );
};

export default FinanceIntroBoard;

const FinanceInfoCard = (props: any) => {
  const { title, description, icon, style } = props;
  return (
    <Card
      variant="outlined"
      hoverable
      style={{
        width: "100%",
        maxWidth: 650,
        marginBottom: 0,
        ...style,
      }}
    >
      <Title level={4} style={{ display: "flex", alignItems: "center" }}>
        {icon}
        <span style={{ marginLeft: 8 }}>{title}</span>
      </Title>
      <Paragraph style={{ fontSize: 16 }}>{description}</Paragraph>
    </Card>
  );
};
