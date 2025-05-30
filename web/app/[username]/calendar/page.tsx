"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Checkbox, Progress, List, Badge, Calendar } from "antd";
import axios from "axios";
import moment, { Moment } from "moment";
import CalendarStepOne from "../../../pages/calendar/stepOne";
import CalendarStepTwo from "../../../pages/calendar/stepTwo";
import CalendarStepThree from "../../../pages/calendar/stepThree";
import CalendarStepFour from "../../../pages/calendar/stepFour";
import CalendarDashboard from "../../../pages/calendar/calendarDashboard";

interface ToDoItem {
  task: string;
  priority: "High" | "Medium" | "Low";
  done: boolean;
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

const Dashboard: React.FC = () => {
  // const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<number>(1);
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{
    calendarEvents: boolean;
    reminders: boolean;
    recurringEvents: boolean;
  }>({
    calendarEvents: true,
    reminders: true,
    recurringEvents: true,
  });
  const [connectedCalendars, setConnectedCalendars] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Day");
  const [toDoList, setToDoList] = useState<ToDoItem[]>([
    { task: "Renew car insurance", priority: "High", done: false },
    { task: "Plan birthday gift", priority: "Medium", done: false },
    { task: "Update password manager", priority: "Low", done: false },
    { task: "Schedule dentist appointment", priority: "Medium", done: true },
  ]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Moment>(moment());
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const calendarUser = localStorage.getItem("user");
    setUser(calendarUser);
    if (calendarUser) {
      setStep(4);
      localStorage.setItem("calendar", "1");
    }
  }, [user]);

  const router = useRouter();

  useEffect(() => {
    const username = localStorage.getItem("username") || "";
    if (localStorage.getItem("calendar") === null) {
      router.push(`/${username}/calendar/setup`);
    }
  }, []);

  const fetchGoogleCalendarEvents = async (
    accessToken: string,
    startDate: Moment,
    endDate: Moment
  ) => {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            maxResults: 100,
            singleEvents: true,
            orderBy: "startTime",
          },
        }
      );
      setCalendarEvents(response.data.items || []);
    } catch (error) {
      console.error("Error fetching Google Calendar events:", error);
      alert("Failed to fetch calendar events. Please try again.");
    }
  };

  const toggleToDo = (index: number) => {
    setToDoList((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, done: !item.done } : item
      )
    );
  };

  const handleAddTask = () => {
    router.push("/add-task");
  };

  const handleViewChange = (mode: "Day" | "Week" | "Month") => {
    setViewMode(mode);
    const accessToken = localStorage.getItem("google_access_token");
    if (accessToken && connectedCalendars.includes("Google Calendar")) {
      const startDate =
        mode === "Month"
          ? moment(selectedDate).startOf("month")
          : mode === "Week"
          ? moment(selectedDate).startOf("week")
          : moment(selectedDate).startOf("day");
      const endDate =
        mode === "Month"
          ? moment(selectedDate).endOf("month")
          : mode === "Week"
          ? moment(selectedDate).endOf("week")
          : moment(selectedDate).endOf("day");
      fetchGoogleCalendarEvents(accessToken, startDate, endDate);
    }
  };

  const handlePin = () => {
    alert("Pinned to dashboard!");
  };

  const handleConnectMore = () => {
    setStep(1);
    setSelectedCalendars([]);
  };

  const onSelectDate = (date: any) => {
    const momentDate = moment(date.toDate ? date.toDate() : date);
    setSelectedDate(momentDate);
    if (connectedCalendars.includes("Google Calendar")) {
      const accessToken = localStorage.getItem("google_access_token");
      if (accessToken) {
        const startDate = momentDate.startOf("day");
        const endDate = momentDate.endOf("day");
        fetchGoogleCalendarEvents(accessToken, startDate, endDate);
      }
    }
  };

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => setStep(5), 3000);
      return () => clearTimeout(timer);
    }

    const code = searchParams?.get("code");
    if (code && selectedCalendars.includes("Google Calendar")) {
      const exchangeToken = async () => {
        try {
          const response = await axios.post(
            "https://oauth2.googleapis.com/token",
            {
              code,
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
              redirect_uri: "http://localhost:3000/dashboard",
              grant_type: "authorization_code",
            }
          );
          const { access_token } = response.data;
          localStorage.setItem("google_access_token", access_token);
          setConnectedCalendars((prev) => [...prev, "Google Calendar"]);
          fetchGoogleCalendarEvents(
            access_token,
            moment().startOf("day"),
            moment().endOf("day")
          );
          setStep(4);
          router.replace("/dashboard");
        } catch (error) {
          console.error("Error exchanging token:", error);
          alert("Failed to connect Google Calendar. Please try again.");
        }
      };
      exchangeToken();
    }
  }, [searchParams, step, router]);

  const containerStyle: React.CSSProperties = {
    padding: "24px",
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    margin: "70px 50px",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    padding: "24px",
    marginBottom: "16px",
  };

  const buttonBase: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    border: "none",
    cursor: "pointer",
  };

  const dayjs = require("dayjs");
  const dateCellRender = (value: any) => {
    // value is a Dayjs object
    const events = calendarEvents.filter((event) =>
      dayjs(event.start.dateTime || event.start.date).isSame(value, "day")
    );
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {events.map((event, index) => (
          <li
            key={index}
            style={{ fontSize: "12px", color: "#2563eb", marginBottom: "4px" }}
          >
            {event.summary}
          </li>
        ))}
      </ul>
    );
  };

  const renderDashboard = () => (
    <div>
      <Card style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div>
            <h2
              style={{ fontSize: "18px", fontWeight: "bold", color: "#111827" }}
            >
              Good morning, John!
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              You have 3 accounts that need attention and 2 bills due this week.
            </p>
            <Progress percent={65} style={{ width: "200px" }} />
            <p style={{ fontSize: "12px", color: "#6b7280" }}>
              Continue setup: 13/20 steps completed
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              onClick={handleConnectMore}
              style={{
                ...buttonBase,
                backgroundColor: "#2563eb",
                color: "#fff",
              }}
            >
              + Connect
            </Button>
            <Button
              onClick={handlePin}
              style={{
                ...buttonBase,
                background: "none",
                border: "1px solid #d1d5db",
              }}
            >
              Pin Doc
            </Button>
            <Button
              style={{
                ...buttonBase,
                background: "none",
                border: "1px solid #d1d5db",
              }}
            >
              Family
            </Button>
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", gap: "16px" }}>
        <div style={{ flex: 2 }}>
          <Card style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: "600" }}>Calendar</h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  onClick={() => handleViewChange("Day")}
                  style={{
                    ...buttonBase,
                    backgroundColor: viewMode === "Day" ? "#2563eb" : "#fff",
                    color: viewMode === "Day" ? "#fff" : "#000",
                  }}
                >
                  Day
                </Button>
                <Button
                  onClick={() => handleViewChange("Week")}
                  style={{
                    ...buttonBase,
                    backgroundColor: viewMode === "Week" ? "#2563eb" : "#fff",
                    color: viewMode === "Week" ? "#fff" : "#000",
                  }}
                >
                  Week
                </Button>
                <Button
                  onClick={() => handleViewChange("Month")}
                  style={{
                    ...buttonBase,
                    backgroundColor: viewMode === "Month" ? "#2563eb" : "#fff",
                    color: viewMode === "Month" ? "#fff" : "#000",
                  }}
                >
                  Month
                </Button>
              </div>
            </div>
            {viewMode === "Day" && (
              <div>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  {selectedDate.format("MMMM D, YYYY")}
                </h4>
                <div style={{ height: "400px", overflowY: "auto" }}>
                  {calendarEvents.length > 0 ? (
                    calendarEvents
                      .filter((event) =>
                        moment(event.start.dateTime || event.start.date).isSame(
                          selectedDate,
                          "day"
                        )
                      )
                      .map((event, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <div
                            style={{
                              width: "50px",
                              fontSize: "12px",
                              color: "#6b7280",
                            }}
                          >
                            {moment(event.start.dateTime).format("h:mm A")}
                          </div>
                          <div
                            style={{
                              flex: 1,
                              backgroundColor: "#fee2e2",
                              padding: "8px",
                              borderRadius: "4px",
                              borderLeft: "4px solid #ef4444",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                margin: 0,
                              }}
                            >
                              {event.summary}
                            </p>
                            <p
                              style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                margin: 0,
                              }}
                            >
                              {`${moment(event.start.dateTime).format(
                                "h:mm A"
                              )} - ${moment(event.end.dateTime).format(
                                "h:mm A"
                              )}`}
                            </p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p>No events for this day.</p>
                  )}
                </div>
              </div>
            )}
            {viewMode === "Week" && (
              <div>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Week of {selectedDate.startOf("week").format("MMMM D, YYYY")}
                </h4>
                <div style={{ height: "400px", overflowY: "auto" }}>
                  {calendarEvents.length > 0 ? (
                    calendarEvents
                      .filter((event) =>
                        moment(
                          event.start.dateTime || event.start.date
                        ).isBetween(
                          moment(selectedDate).startOf("week"),
                          moment(selectedDate).endOf("week"),
                          undefined,
                          "[]"
                        )
                      )
                      .map((event, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <div
                            style={{
                              width: "100px",
                              fontSize: "12px",
                              color: "#6b7280",
                            }}
                          >
                            {moment(event.start.dateTime).format(
                              "MMM D, h:mm A"
                            )}
                          </div>
                          <div
                            style={{
                              flex: 1,
                              backgroundColor: "#fee2e2",
                              padding: "8px",
                              borderRadius: "4px",
                              borderLeft: "4px solid #ef4444",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                margin: 0,
                              }}
                            >
                              {event.summary}
                            </p>
                            <p
                              style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                margin: 0,
                              }}
                            >
                              {`${moment(event.start.dateTime).format(
                                "h:mm A"
                              )} - ${moment(event.end.dateTime).format(
                                "h:mm A"
                              )}`}
                            </p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p>No events for this week.</p>
                  )}
                </div>
              </div>
            )}
            {viewMode === "Month" && (
              <Calendar
                fullscreen={false}
                dateCellRender={dateCellRender}
                onSelect={onSelectDate}
                value={require("dayjs")(selectedDate.toDate())}
                onPanelChange={(date) => setSelectedDate(moment(date.toDate()))}
              />
            )}
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <Badge color="#2563eb" text="Personal" />
              <Badge color="#22c55e" text="Work" />
              <Badge color="#f59e0b" text="Family" />
              <Badge color="#8b5cf6" text="Health" />
              <Badge color="#ef4444" text="Bills & Finance" />
            </div>
          </Card>
        </div>

        <div style={{ flex: 1 }}>
          <Card style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: "600" }}>
                Today's Overview
              </h3>
              <Button type="link">View All</Button>
            </div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {selectedDate.format("D")}
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                textAlign: "center",
              }}
            >
              {selectedDate.format("ddd YYYY")}
            </p>
            <div style={{ marginTop: "16px" }}>
              <p
                style={{
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Badge color="#2563eb" /> 5 Personal Tasks{" "}
                <Progress percent={50} size="small" />
              </p>
              <p
                style={{
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Badge color="#22c55e" /> 2 Work Tasks{" "}
                <Progress percent={80} size="small" />
              </p>
              <p
                style={{
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Badge color="#f59e0b" /> 4 Family Activities{" "}
                <Progress percent={25} size="small" />
              </p>
            </div>
          </Card>

          <Card style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: "600" }}>
                To-Do List
              </h3>
              <Button onClick={handleAddTask}>Add Task</Button>
            </div>
            <List
              dataSource={toDoList}
              renderItem={(item, index) => (
                <List.Item>
                  <Checkbox
                    checked={item.done}
                    onChange={() => toggleToDo(index)}
                  >
                    <span
                      style={{
                        color: item.done ? "#6b7280" : "#111827",
                        textDecoration: item.done ? "line-through" : "none",
                      }}
                    >
                      {item.task}
                    </span>
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "12px",
                        color:
                          item.priority === "High"
                            ? "#ef4444"
                            : item.priority === "Medium"
                            ? "#f59e0b"
                            : "#22c55e",
                      }}
                    >
                      {item.priority}
                    </span>
                  </Checkbox>
                </List.Item>
              )}
            />
            <Button type="link" style={{ marginTop: "8px" }}>
              View All Tasks
            </Button>
          </Card>

          <Card style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: "600" }}>
                Upcoming Activities
              </h3>
              <Button type="link">View All</Button>
            </div>
            <List
              dataSource={[
                {
                  date: "21",
                  title: "Team Project Review",
                  time: "10:00 AM - 11:30 AM",
                },
                {
                  date: "23",
                  title: "Mortgage Payment",
                  time: "$1450.00 - Due",
                },
                {
                  date: "25",
                  title: "Family Dinner",
                  time: "6:30 PM - 9:00 PM",
                },
                {
                  date: "27",
                  title: "Annual Checkup",
                  time: "9:00 AM - Dr. Johnson",
                },
              ].concat(
                calendarEvents.map((event) => ({
                  date: moment(event.start.dateTime || event.start.date).format(
                    "D"
                  ),
                  title: event.summary,
                  time: event.start.dateTime
                    ? `${moment(event.start.dateTime).format(
                        "h:mm A"
                      )} - ${moment(event.end.dateTime).format("h:mm A")}`
                    : "All Day",
                }))
              )}
              renderItem={(item) => (
                <List.Item>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        backgroundColor: "#e5e7eb",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {item.date}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          margin: 0,
                        }}
                      >
                        {item.title}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          margin: 0,
                        }}
                      >
                        {item.time}
                      </p>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      {step === 1 && (
        <CalendarStepOne
          setStep={setStep}
          selectedCalendars={selectedCalendars}
          setSelectedCalendars={setSelectedCalendars}
        />
      )}
      {step === 2 && (
        <CalendarStepTwo
          selectedCalendars={selectedCalendars}
          setSelectedOptions={setSelectedOptions}
          selectedOptions={selectedOptions}
          setStep={setStep}
        />
      )}
      {step === 3 && (
        <CalendarStepThree
          setStep={setStep}
          setConnectedCalendars={setConnectedCalendars}
          selectedCalendars={selectedCalendars}
        />
      )}
      {step === 4 && <CalendarStepFour selectedCalendars={selectedCalendars} />}
      {step === 5 && <CalendarDashboard />}
    </div>
  );
};

export default Dashboard;
