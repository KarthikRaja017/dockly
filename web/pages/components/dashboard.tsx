"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  List,
  Button,
  Typography,
  Avatar,
  Divider,
  Layout,
  Carousel,
  Tooltip,
  Space,
  Collapse,
  Row,
  Col,
  Card,
  Modal,
} from "antd";
import {
  CheckCircleTwoTone,
  InfoCircleOutlined,
  HourglassOutlined,
  CheckCircleOutlined,
  UserAddOutlined,
  CloudUploadOutlined,
  AppstoreOutlined,
  FileProtectOutlined,
  NotificationOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import UpcomingAndTodoList from "../dashboard/upcomingAndTodoList";
import CalendarEventWidget from "../dashboard/calendar";
// import { getUserGetStarted } from "../../services/user";
import { getCalendarEvents } from "../../services/google";
import { useCurrentUser } from "../../app/userContext";
import DocklyLoader from "../../utils/docklyLoader";
import { useRouter } from "next/navigation";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const rawSteps = [
  { key: "profileCompleted", title: "Complete your profile", description: "Add personal details and preferences" },
  { key: "accountsCompleted", title: "Connect your first account", description: "Link your bank, email, or service" },
  { key: "boardCreated", title: "Create your first board", description: "Organize accounts by category" },
  { key: "documentUploaded", title: "Upload a document", description: "Store important files securely" },
  { key: "notificationsSetup", title: "Set up notifications", description: "Stay on top of bills and dates" },
];

const iconSet = [
  <UserAddOutlined style={{ fontSize: 22, color: "#91caff" }} />,
  <CloudUploadOutlined style={{ fontSize: 22, color: "#ffe58f" }} />,
  <AppstoreOutlined style={{ fontSize: 22, color: "#b7eb8f" }} />,
  <FileProtectOutlined style={{ fontSize: 22, color: "#ffd6e7" }} />,
  <NotificationOutlined style={{ fontSize: 22, color: "#d3adf7" }} />,
];

const DashboardPage = () => {
  const [completedSteps, setCompletedSteps] = useState(0);
  const [incompleteKeys, setIncompleteKeys] = useState<string[]>([]);
  const username = typeof window !== "undefined" ? localStorage.getItem("username") : "";
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [accountModal, setAccountModal] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [accountColor, setAccountColor] = useState<Record<string, string>>({});

  const currentUser = useCurrentUser();

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      // 1. Fetch user get started steps
      // const getStartedRes = await getUserGetStarted({});
      // if (getStartedRes.data.status) {
      //   const backend = getStartedRes.data.payload.steps || [];
      //   setIncompleteKeys(backend);
      //   setCompletedSteps(rawSteps.length - backend.length);
      // }

      // 2. Fetch Google Calendar events
      const calendarRes = await getCalendarEvents({
        userId: currentUser?.userId,
      });

      const rawEvents = calendarRes.data.payload.events;
      const gmailConnected = calendarRes.data.payload.connected_accounts;
      const colors = calendarRes.data.payload.account_colors || {};

      if (gmailConnected && gmailConnected.length > 0) {
        setAccounts(gmailConnected);
      }

      if (colors && Object.keys(colors).length > 0) {
        setAccountColor(colors);
      }

      const parsedEvents = rawEvents
        .filter((event: any) => event?.start && event?.end)
        .map((event: any) => ({
          id: event.id,
          title: event.summary || "(No Title)",
          start: new Date(event.start.dateTime || event.start.date),
          end: new Date(event.end.dateTime || event.end.date),
          allDay: !event.start.dateTime,
          extendedProps: {
            status: "confirmed",
          },
          source_email: event.source_email || "",
        }));

      setEvents(parsedEvents);

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleNextStep = () => {
    const idx = completedSteps;
    const key = rawSteps[idx]?.key;
    localStorage.setItem("docklySetup", JSON.stringify({ ...incompleteKeys, [key]: true }));
    if (incompleteKeys?.[0] === "accountsCompleted") {
      setAccountModal(true);
    }
    incompleteKeys?.[0] === "profileCompleted" && (window.location.href = `/${username}/profile/setup`);
    incompleteKeys?.[0] === "notificationsSetup" && (window.location.href = `/${username}/settings`);
    // setCompletedSteps((p) => p + 1);
  };
  const nextStepKey = incompleteKeys?.[0];
  const totalSteps = rawSteps.length;
  const steps = rawSteps.map((s, i) => {
    const isCompleted = !incompleteKeys.includes(s.key);
    const isActive = s.key === nextStepKey;
    return {
      ...s,
      isCompleted,
      isActive,
      icon: isCompleted ? (
        <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 24 }} />
      ) : (
        <Avatar size={40} style={{ background: "#fff", border: "1px solid #d9d9d9" }}>
          {iconSet[i]}
        </Avatar>
      ),
      action: isActive ? (
        <Button type="primary" size="small" onClick={handleNextStep} style={{ borderRadius: 6, padding: 15 }}>
          Start
        </Button>
      ) : null,
    };
  });

  if (loading) {
    return <DocklyLoader />;
  }

  return (
    <Content style={{ background: "#f9f9f9", margin: "80px 15px 0 50px" }}>
      <WelComeCard totalSteps={totalSteps} completedSteps={completedSteps} steps={steps} />
      {/* <QuickOptions /> */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <UpcomingAndTodoList googleEvents={events} accountColor={accountColor} />
        <CalendarEventWidget events={events} accountColor={accountColor} />
      </div>
      <AccountModal visible={accountModal} onCancel={() => setAccountModal(false)} username={username} />
    </Content>
  );
};

export default DashboardPage;

const AccountModal = ({ visible, onCancel, username }: any) => {
  const router = useRouter()
  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      width={750}
      style={{
        borderRadius: 12,
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
        backgroundSize: "cover",
        padding: 0,
      }}
      bodyStyle={{
        padding: 40,
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: 12,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Title level={3} style={{ color: "#333", marginBottom: 4 }}>
          Manage Your Accounts
        </Title>
        <Text style={{ fontSize: 16, color: "#666" }}>
          Choose the account type you want to manage
        </Text>
      </div>

      <Row gutter={24} justify="center">
        <Col span={12}>
          <Card
            hoverable
            onClick={() => router.push(`/${username}/finance`)}
            style={{
              borderRadius: 12,
              background: "#f9f9f9",
              textAlign: "center",
              padding: 24,
              border: "1px solid #eaeaea",
              transition: "all 0.3s",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <img
                src="https://cdn-icons-png.flaticon.com/512/3721/3721710.png"
                alt="Bank"
                style={{ width: 64, height: 64 }}
              />
            </div>
            <Title level={4} style={{ color: "#2c3e50", marginBottom: 8 }}>
              Bank Account
            </Title>
            <Text style={{ color: "#555" }}>
              Add or update your bank account information
            </Text>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            hoverable
            onClick={() => router.push(`/${username}/calendar`)}
            style={{
              borderRadius: 12,
              background: "#f9f9f9",
              textAlign: "center",
              padding: 24,
              border: "1px solid #eaeaea",
              transition: "all 0.3s",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <img
                src="https://cdn-icons-png.flaticon.com/512/561/561127.png"
                alt="Email"
                style={{ width: 64, height: 64 }}
              />
            </div>
            <Title level={4} style={{ color: "#2c3e50", marginBottom: 8 }}>
              Email Account
            </Title>
            <Text style={{ color: "#555" }}>
              Manage your email and other details
            </Text>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

/** Animated Progress Bar Component **/
const AnimatedProgress = ({ completedSteps, totalSteps }: { completedSteps: number; totalSteps: number }) => {
  const [shown, setShown] = useState(0);
  const percent = Math.round((completedSteps / totalSteps) * 100);

  useEffect(() => {
    setShown(0);
    const timeout = setTimeout(() => setShown(percent), 300);
    return () => clearTimeout(timeout);
  }, [percent]);

  const icon = (percent === 100 ? <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 20 }} /> :
    percent > 50 ? <HourglassOutlined style={{ color: "#faad14", fontSize: 20 }} /> :
      <InfoCircleOutlined style={{ color: "#ff4d4f", fontSize: 20 }} />);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Space style={{ marginBottom: 16, justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {icon}
            <Text style={{ fontSize: 16, fontWeight: 600, marginLeft: 10 }}>{`Getting Started: ${completedSteps}/${totalSteps}`}</Text>
          </div>
          <Tooltip title="Progress percentage">
            <Text style={{ fontSize: 16, color: "#1677ff", fontWeight: 600 }}>{`${percent}%`}</Text>
          </Tooltip>
        </Space>
      </motion.div>

      <div style={{ position: "relative", background: "#f0f2f5", borderRadius: 10, height: 14 }}>
        <motion.div layout initial={{ width: 0 }} animate={{ width: `${shown}%` }} transition={{ duration: 1.2, ease: "easeInOut" }}
          style={{
            background: "linear-gradient(90deg, #bae7ff, #1677ff)",
            height: "100%",
            borderRadius: 10
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <Text type="secondary" style={{ fontSize: 13 }}>Started</Text>
        <Text type="secondary" style={{ fontSize: 13 }}>Complete</Text>
      </div>
    </motion.div>
  );
};

const QuickOptions = () => {
  return (
    <div
      style={{
        marginTop: 90,
        borderRadius: "16px",
      }}
    >
      <Carousel autoplay style={{ width: "100%", borderRadius: "16px" }}>
        {cardData.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "4000px",
                height: " 270px",
                display: "flex",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                padding: "32px",
                background: card.background,
                justifyContent: "space-between",
              }}
            >
              <div style={{ maxWidth: "50%", paddingRight: "24px" }}>
                <Title level={4} style={{ color: 'black', marginBottom: 8 }}>
                  {card.title}
                </Title>
                <Title level={2} style={{ marginBottom: 8 }}>
                  {card.subtitle}
                </Title>
                <Paragraph style={{ fontSize: "16px", marginBottom: 24 }}>
                  {card.description}
                </Paragraph>
                <Button
                  type="primary"
                  size="large"
                  style={{
                    backgroundColor: card.buttonColor,
                    borderColor: card.buttonColor,
                    borderRadius: 8,
                    color: card.title === "Take Smart Notes" ? "#000" : "#fff",
                  }}
                  onClick={() => {
                    if (card.title === "Stay Connected") {
                      // window.location.href = `/${username}/accounts`;
                    } else if (card.title === "Take Smart Notes") {
                      window.location.href = "/notes";
                    } else if (card.title === "Drag & Drop Ease") {
                      window.location.href = "/drag-drop";
                    } else if (card.title === "Bookmark Smarter") {
                      window.location.href = "/bookmarks";
                    }
                  }
                  }
                >
                  {card.button}
                </Button>
              </div>
              <div>
                <img
                  src={card.image}
                  alt={card.title}
                  style={{
                    width: "300px",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </Carousel>
    </div>
  )
}


const cardData = [
  {
    title: "Stay Connected",
    subtitle: "Connect with Us.",
    description:
      "Effortlessly sync and manage your calendar, meetings, and drive all in one place.",
    button: "Connect Now",
    image: "/connect.png",
    background: "#7d7ef0", // lighter than #4244e6
    buttonColor: "#4244e6",
  },
  {
    title: "Take Smart Notes",
    subtitle: "Never Miss a Thought.",
    description:
      "Quickly jot down important ideas, meeting points, and reminders for easy access.",
    button: "Open Notes",
    image: "/notes.png",
    background: "#f1ffe4", // lighter than #e8ffaed1
    buttonColor: "#e8ffaed1",
  },
  {
    title: "Drag & Drop Ease",
    subtitle: "Organize with Simplicity.",
    description:
      "Use intuitive drag-and-drop tools to manage your files and layouts like a pro.",
    button: "Start Organizing",
    image: "/drag.png",
    background: "#ff9ea6", // lighter than #fe4e5b
    buttonColor: "#fe4e5b",
  },
  {
    title: "Bookmark Smarter",
    subtitle: "Save What Matters.",
    description:
      "Easily bookmark key resources and revisit important pages with one click.",
    button: "View Bookmarks",
    image: "/book.png",
    background: "#ff9d8e", // lighter than #ff735c
    buttonColor: "#ff735c",
  },
];



const WelComeCard = (props: any) => {
  const { completedSteps, totalSteps, steps } = props
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Welcome to Dockly!</Title>
          <Text>Let's get your account set up. Follow these steps to start.</Text>
        </div>
        <div style={{ background: "#e6f0ff", borderRadius: "50%", padding: 10 }}>
          <Avatar size={84} src="/dash.jpg" />
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <AnimatedProgress completedSteps={completedSteps} totalSteps={totalSteps} />
      </motion.div>
      {completedSteps === totalSteps ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          style={{ textAlign: "center", padding: 20, background: "#f6ffed", borderRadius: 12, boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
          <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 48 }} />
          <p style={{ marginTop: 12, color: "#389e0d", fontWeight: 600 }}>You're all set! Everything looks perfect 🎉</p>
        </motion.div>
      ) : (
        <div style={{ marginTop: 20 }}>
          {steps.map((item: any, idx: any) => (
            <React.Fragment key={idx}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: item.isActive ? "#e6f7ff" : "#fff",
                  padding: item.isActive ? 20 : 5,
                  borderRadius: 10,
                  marginBottom: 12,
                  boxShadow: item.isActive ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                  borderLeft: `7px solid ${item.isActive ? "#1890ff" : "transparent"}`,
                  border: item.isActive ? "1px solid #1677ff" : 0,
                }}
              >
                <div style={{ marginRight: 16, marginLeft: item.isActive ? 4 : 0 }}>{item.icon}</div>
                <div style={{ flexGrow: 1 }}>
                  <Title level={5} style={{ margin: 0 }}>{item.title}</Title>
                  <Text type="secondary">{item.description}</Text>
                </div>
                {item.action && <div>{item.action}</div>}
              </motion.div>
              <Divider style={{ margin: 0 }} />
            </React.Fragment>
          ))}
        </div>
      )}
      {/* <Collapse
          accordion={false}
          defaultActiveKey={[nextStepKey]}               // Open next step by default
          expandIcon={({ isActive }) => (
            <CaretRightOutlined rotate={isActive ? 90 : 0} />
          )}
          style={{ marginTop: 20 }}
        >
          {steps.map((item, idx) => (
            <Collapse.Panel
              key={item.key}
              header={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ marginRight: 12 }}>{item.icon}</div>
                  <div style={{ flexGrow: 1 }}>
                    <Title level={5} style={{ margin: 0 }}>
                      {item.title}
                    </Title>
                  </div>
                  {item.action}
                </div>
              }
              style={{
                background: item.isActive ? "#e6f7ff" : "#fff",
                borderRadius: 8,
                border: item.isActive ? "1px solid #1890ff" : undefined,
                marginBottom: 8,
                boxShadow: item.isActive ? "0 2px 8px rgba(0,0,0,0.1)" : undefined,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ padding: "8px 0" }}
              >
                <Text type="secondary">{item.description}</Text>
              </motion.div>
            </Collapse.Panel>
          ))}
        </Collapse> */}
    </div>
  )
}