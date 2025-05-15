"use client";

import React, { useState } from "react";
import {
  Progress,
  List,
  Button,
  Typography,
  Avatar,
  Divider,
  Layout,
} from "antd";
import { RocketOutlined, CheckCircleTwoTone } from "@ant-design/icons";
import UpcomingAndTodoList from "../dashboard/upcomingAndTodoList";
import CalendarEventWidget from "../dashboard/calendar";

const { Title, Text } = Typography;
const { Content } = Layout;

const rawSteps = [
  {
    title: "Complete your profile",
    description: "Add your personal details and preferences",
  },
  {
    title: "Connect your first account",
    description: "Link your bank, email, or other service",
  },
  {
    title: "Create your first board",
    description: "Organize your accounts by category",
  },
  {
    title: "Upload a document",
    description: "Store important files securely in Dockly",
  },
  {
    title: "Set up notifications",
    description: "Stay on top of bills and important dates",
  },
];

const DashboardPage = () => {
  const [completedSteps, setCompletedSteps] = useState(0);
  const totalSteps = rawSteps.length;
  const percent = Math.round((completedSteps / totalSteps) * 100);

  const handleNextStep = () => {
    if (completedSteps < totalSteps) {
      setCompletedSteps((prev) => prev + 1);
    }
  };

  const steps = rawSteps.map((step, index) => ({
    ...step,
    icon:
      completedSteps > index ? (
        <CheckCircleTwoTone twoToneColor="#52c41a" />
      ) : (
        <Avatar size={32}>{index + 1}</Avatar>
      ),
    action:
      index === completedSteps && completedSteps < totalSteps ? (
        <Button type="primary" size="small" onClick={handleNextStep}>
          Start
        </Button>
      ) : null,
    isActive: index === completedSteps,
  }));

  return (
    <Content
      style={{
        background: "#f9f9f9",
        marginLeft: 40,
        marginTop: 80,
        marginRight: 15,
      }}
    >
      {" "}
      {/* padding: '24px',  */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          position: "relative",
        }}
      >
        {/* Rocket Icon in top-right */}
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            backgroundColor: "#e6f0ff",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RocketOutlined style={{ color: "#0057ff" }} />
        </div>

        <Title level={4}>Welcome to Dockly!</Title>
        <Text>
          Let's get your account set up. Follow these steps to get started with
          Dockly.
        </Text>

        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text type="secondary">
              Getting started: {completedSteps}/{totalSteps} steps completed
            </Text>
            <Text type="secondary">{percent}%</Text>
          </div>
          <Progress percent={percent} showInfo={false} />
        </div>

        <Divider />

        {completedSteps === totalSteps ? (
          <div className="text-center">
            <CheckCircleTwoTone
              twoToneColor="#52c41a"
              style={{ fontSize: 32 }}
            />
            <p className="mt-2 text-green-600 font-semibold">You're all set!</p>
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={steps}
            renderItem={(
              item: {
                title: string;
                description: string;
                icon: React.ReactNode;
                action: React.ReactNode | null;
                isActive: boolean;
              },
              index: number
            ) => (
              <List.Item
                actions={item.action ? [item.action] : []}
                style={{
                  borderLeft: item.isActive ? "4px solid #0057ff" : undefined,
                  background: item.isActive ? "#f5faff" : "transparent",
                  padding: "5px 6px",
                  marginBottom: 8,
                  borderRadius: 8,
                }}
              >
                <List.Item.Meta
                  avatar={item.icon}
                  title={<Text strong>{item.title}</Text>}
                  description={<Text type="secondary">{item.description}</Text>}
                />
              </List.Item>
            )}
          />
        )}
      </div>
      <div style={{ marginTop: 20, display: "flex", gap: 20 }}>
        <UpcomingAndTodoList />
        <CalendarEventWidget />
      </div>
    </Content>
  );
};

export default DashboardPage;
