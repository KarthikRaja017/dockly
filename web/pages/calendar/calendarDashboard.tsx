"use client";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Modal,
  Progress,
  Spin,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import {
  capitalizeEachWord,
  cleanProfilePictureUrl,
  getGreeting,
} from "../../app/comman";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getGoogleCalendarEvents } from "../../services/google";
import { useCurrentUser } from "../../app/userContext";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { GoogleOutlined, PushpinFilled, PushpinOutlined, UserOutlined } from "@ant-design/icons";
import "animate.css";
import dayjs from "dayjs";
import DocklyLoader from "../../utils/docklyLoader";

const getEventColor = (eventDate: Date) => {
  const now = new Date();
  const eventTime = new Date(eventDate).getTime();

  if (eventTime < now.getTime()) return "#ef4444";
  if (eventDate.toDateString() === now.toDateString()) return "#22c55e";
  return "#2563eb";
};

const { Title, Text } = Typography;
const CalendarDashboard = (props: any) => {
  const { handleConnectMore } = props;
  const [username, setUsername] = useState<string | null>(null);
  const [user, setUser] = useState<{
    name?: string;
    picture?: string;
    email?: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [accountColor, setAccountColor] = useState<Record<string, string>>({});
  const currentUser = useCurrentUser();
  const currentDate = new Date();
  const day = currentDate.getDate();
  const weekday = currentDate.toLocaleString("default", { weekday: "long" });
  const monthYear = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    const userObj = user ? JSON.parse(user) : null;
    setUsername(userObj?.name);
    setUser(userObj);
    if (user) {
      fetchEvents();
    }
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await getGoogleCalendarEvents({
        userId: currentUser?.userId,
      });
      const rawEvents = response.data.payload.events;
      const gmailConnected = response.data.payload.connected_accounts;
      const colors = response.data.payload.account_colors || {};
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
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };

  const eventsToday = 5;
  const completedToday = 3;
  const percent = (completedToday / eventsToday) * 100;
  const overviewData = [
    {
      label: "3 Personal Tasks",
      percent: 30,
      color: "#3b82f6", // blue
    },
    {
      label: "2 Work Items",
      percent: 50,
      color: "#22c55e", // green
    },
    {
      label: "4 Family Activities",
      percent: 25,
      color: "#60a5fa", // lighter blue
    },
  ];

  if (loading) {
    return <DocklyLoader />
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <Card
          style={{
            backgroundColor: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: "24px",
            marginBottom: "16px",
            width: "980px",
          }}
        >
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "16px",
                flexDirection: "column",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: "bold",
                    color: "#111827",
                  }}
                >
                  {getGreeting()},{capitalizeEachWord(username ?? "")}
                </h2>
                <p
                  style={{
                    fontSize: "16px",
                    color: "#6b7280",
                    marginTop: "4px",
                  }}
                >
                  You have {upcomingEvents.length} upcoming{" "}
                  {upcomingEvents.length === 1 ? "event" : "events"} today.
                  Don’t miss them!
                </p>

                <Progress percent={percent} style={{ width: "300px" }} />
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                <Button
                  onClick={handleConnectMore}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: "#2563eb",
                    color: "#fff",
                  }}
                >
                  + Connect
                </Button>
                <Button
                  //   onClick={handlePin}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    cursor: "pointer",
                    background: "none",
                    border: "1px solid #d1d5db",
                  }}
                >
                  Pin Doc
                </Button>
                <Button
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    cursor: "pointer",
                    background: "none",
                    border: "1px solid #d1d5db",
                  }}
                >
                  Family
                </Button>
              </div>
            </div>
            <div
              style={{
                marginLeft: "auto",
              }}
            >
              <div style={{ marginLeft: "40px" }}>
                <Avatar
                  size={122}
                  icon={<UserOutlined />}
                  src={cleanProfilePictureUrl(user?.picture || "")}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Text strong style={{ fontSize: "16px" }}>
                  Connected Account
                </Text>

                {accounts?.map((email) => (
                  <Tag
                    key={email}
                    icon={<GoogleOutlined />}
                    color={accountColor?.[email] || "blue"} // fallback to "blue" if not found
                    style={{
                      width: "fit-content",
                      fontWeight: 500,
                      fontSize: "14px",
                      marginTop: "8px",
                    }}
                  >
                    {email}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        </Card>
        <Card
          style={{
            borderRadius: 16,
            padding: 15,
            background: "#fff",
            boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
            width: "350px",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Title level={5} style={{ margin: 0 }}>
                Today’s Overview
              </Title>
              <a style={{ color: "#2563eb", fontWeight: 500 }}>View All</a>
            </div>

            <div style={{ textAlign: "center", margin: "20px 0" }}>
              <Title level={1} style={{ margin: 0 }}>
                {day}
              </Title>
              <Text strong>{weekday}</Text>
              <br />
              <Text type="secondary">{monthYear}</Text>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {overviewData.map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: "#f0f9ff",
                    borderRadius: 12,
                    padding: "8px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: item.color,
                      }}
                    ></span>
                    <Text>{item.label}</Text>
                  </div>
                  <Text strong style={{ color: "#333" }}>
                    {item.percent}%
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: "flex", gap: "16px" }}>
        <div style={{ flex: 2 }}>
          <RenderCalendarCard loading={loading} events={events} accountColor={accountColor} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <ToDoListCard />
          <UpcomingActivities googleEvents={events} accountColor={accountColor} />
        </div>
      </div>
    </div>
  );
};

export default CalendarDashboard;

const RenderCalendarCard = (props: any) => {
  const { view, setView, loading, events, accountColor } = props;
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const processedEvents = events.map((event: any) => {
    console.log("🚀 ~ processedEvents ~ events:", events)
    const email = event.source_email;
    console.log("🚀 ~ processedEvents ~ email:", email)
    const color = accountColor[email] || "#888"; // fallback if email not found
    console.log("🚀 ~ processedEvents ~ color:", color)
    return {
      ...event,
      backgroundColor: color,
      borderColor: color,
      textColor: "#fff",
    };
  });

  // const viewHeights: { [key: string]: number | "auto" } = {
  //   dayGridMonth: 620,
  //   timeGridWeek: 620,
  //   timeGridDay: 600,
  //   listWeek: 500,
  // };

  return (
    <Card
      style={{
        backgroundColor: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        padding: "24px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: "600" }}>Calendar</h3>
        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
          <Badge color="#2563eb" text="Personal" />
          <Badge color="#22c55e" text="Work" />
          <Badge color="#f59e0b" text="Family" />
          <Badge color="#8b5cf6" text="Health" />
          <Badge color="#ef4444" text="Bills & Finance" />
        </div>
      </div>
      {/* {accountColor && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginTop: "16px",
          }}
        >
          {Object.entries(accountColor).map(([email, color]) => (
            <Badge
              key={email}
              color={color as string}
              text={email}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                fontWeight: 250,
                fontSize: "14px",
                backgroundColor: color as string,
                color: "#fff",
              }}
            />
          ))}
        </div>
      )} */}

      {loading ? (
        <Spin />
      ) : (
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            listPlugin,
          ]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          buttonText={{
            dayGridMonth: "Month",
            timeGridWeek: "Week",
            timeGridDay: "Day",
            listWeek: "List",
            today: "Today",
          }}
          height={620}
          events={processedEvents}
          eventClick={(info: any) => {
            alert(`Event: ${info.event.title}`);
          }}
          nowIndicator
          eventDisplay="block"
          dayMaxEventRows
          selectable
          selectMirror
          datesSet={(arg) => setCurrentView(arg.view.type)}
        />
      )}
    </Card>
  );
};

const getPriorityTag = (priority: string | null) => {
  if (!priority) return null;
  const colorMap: any = {
    High: "#fca5a5",
    Medium: "#fcd34d",
    Low: "#86efac",
  };
  return (
    <Tag
      style={{
        backgroundColor: colorMap[priority],
        color: "#111",
        fontWeight: 500,
        borderRadius: "8px",
        marginTop: "4px",
      }}
    >
      {priority} Priority
    </Tag>
  );
};
const tasksData = [
  {
    id: 1,
    title: "Renew car insurance",
    due: "Due tomorrow",
    priority: "High",
    completed: false,
  },
  {
    id: 2,
    title: "Order birthday gift",
    due: "Due in 3 days",
    priority: "Medium",
    completed: false,
  },
  {
    id: 3,
    title: "Schedule dentist appointment",
    due: "Completed today",
    priority: null,
    completed: true,
  },
];

const ToDoListCard = () => {
  const [tasks, setTasks] = useState(tasksData);

  const toggleComplete = (id: number) => {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updated);
  };

  return (
    <Card
      style={{
        borderRadius: 16,
        width: 380,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Title level={4} style={{ margin: 0 }}>
          To-Do List
        </Title>
        <Text style={{ color: "#2563eb", cursor: "pointer" }}>+ Add Task</Text>
      </div>

      <div style={{ marginTop: 16 }}>
        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
              border: "1px solid #eee",
              padding: 12,
              borderRadius: 12,
              marginBottom: 12,
              backgroundColor: task.completed ? "#f0fdf4" : "#fff",
            }}
          >
            <Checkbox
              checked={task.completed}
              onChange={() => toggleComplete(task.id)}
              style={{ fontWeight: 500 }}
            >
              <Text
                delete={task.completed}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: task.completed ? "#9ca3af" : "#111827",
                }}
              >
                {task.title}
              </Text>
            </Checkbox>
            <div style={{ marginLeft: 24 }}>
              <Text
                type="secondary"
                style={{ fontSize: 13, display: "block", marginTop: 4 }}
              >
                {task.due}
              </Text>
              {getPriorityTag(task.priority)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 8 }}>
        <Text style={{ color: "#2563eb", cursor: "pointer" }}>
          View All Tasks →
        </Text>
      </div>
    </Card>
  );
};

const transformActivities = (events: any) => {
  return events.map((event: any) => {
    const startDate = dayjs(event.start);
    const endDate = dayjs(event.end);
    const detail = event.allDay
      ? "All Day"
      : `${startDate.format("h:mm A")} - ${endDate.format("h:mm A")}`;

    return {
      id: event.id,
      title: event.title,
      source_email: event.source_email || "",
      date: startDate.format("DD"),
      month: startDate.format("MMM"),
      detail,
    };
  });
};

const ActivityList = ({
  activities,
  accountColor,
  pinned,
  onTogglePin,
  showPin = false,
}: {
  activities: any[];
  accountColor?: { [email: string]: string };
  pinned?: string[];
  onTogglePin?: (id: string) => void;
  showPin?: boolean;
}) => (
  <div style={{ marginTop: 16 }}>
    {activities.map((activity) => {
      const color = accountColor?.[activity.source_email] || "#d9d9d9";
      const isPinned = pinned?.includes(activity.id);

      return (
        <div
          key={activity.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 0",
            borderBottom: "1px solid #f0f0f0",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 12, flex: 1 }}>
            <div
              style={{
                backgroundColor: "#e0f2fe",
                borderRadius: 8,
                textAlign: "center",
                padding: "6px 10px",
                width: 48,
              }}
            >
              <Text strong style={{ fontSize: 16, display: "block" }}>
                {activity.date}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {activity.month}
              </Text>
            </div>

            <div>
              <Text style={{ fontSize: 15, fontWeight: 500, display: "block" }}>
                {activity.title}
              </Text>
              <Text type="secondary" style={{ fontSize: 13, display: "block" }}>
                {activity.detail}
              </Text>
              {activity.source_email && (

                // <Tag
                //   // color={color}
                //   style={{ marginTop: 4, fontWeight: 500, fontSize: 12 }}
                // >
                //   {activity.source_email}
                // </Tag>
                <Badge color={color} text={activity.source_email} />
              )}
            </div>
          </div>

          {showPin && (
            <div style={{ cursor: "pointer" }} onClick={() => onTogglePin?.(activity.id)}>
              {isPinned ? (
                <PushpinFilled style={{ color: "#f59e0b", fontSize: 18 }} />
              ) : (
                <PushpinOutlined style={{ color: "#999", fontSize: 18 }} />
              )}
            </div>
          )}
        </div>
      );
    })}
  </div>
);

const UpcomingActivities = ({ googleEvents, accountColor }: any) => {
  const activities = transformActivities(googleEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pinned, setPinned] = useState<string[]>([]); // store pinned activity IDs

  const togglePin = (id: string) => {
    setPinned((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 3) return prev; // only allow 3 pins
      return [...prev, id];
    });
  };

  const pinnedActivities = activities.filter((a: any) => pinned.includes(a.id));
  const unpinnedActivities = activities.filter((a: any) => !pinned.includes(a.id));
  const firstThree = [...pinnedActivities, ...unpinnedActivities].slice(0, 3);

  return (
    <>
      <Card
        style={{
          borderRadius: 16,
          width: 380,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Title level={4} style={{ margin: 0 }}>
            Upcoming Activities
          </Title>
          <Text
            style={{ color: "#2563eb", cursor: "pointer" }}
            onClick={() => setIsModalOpen(true)}
          >
            View All
          </Text>
        </div>

        <ActivityList
          activities={firstThree}
          accountColor={accountColor}
          pinned={pinned}
          onTogglePin={togglePin}
          showPin
        />
      </Card>

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        title="All Upcoming Activities"
        width={700}
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <ActivityList
          activities={activities}
          accountColor={accountColor}
          pinned={pinned}
          onTogglePin={togglePin}
          showPin
        />
      </Modal>
    </>
  );
};