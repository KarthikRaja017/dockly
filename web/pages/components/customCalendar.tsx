'use client';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { Badge, Button, Card, Spin, Typography } from "antd";
import { useState } from "react";
import "animate.css";
import DocklyLoader from "../../utils/docklyLoader";

const { Title, Text } = Typography;

const RenderCalendarCard = (props: any) => {
    const { loading, events = [], accountColor, height = 620, isCalendarPage = true } = props;
    const [currentView, setCurrentView] = useState("dayGridMonth");
    const [viewMode, setViewMode] = useState<"my" | "family">("my");
    const processedEvents = events?.map((event: any) => {
        const email = event.source_email;
        const color = accountColor[email] || "#888"; // fallback if email not found
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
                padding: isCalendarPage ? "24px" : 0,
                marginBottom: isCalendarPage ? "16px" : 0,
            }}
        >
            {!isCalendarPage && <div style={{
                display: "flex", justifyContent: "space-between",
            }}>
                <Title level={4} style={{ margin: 0 }}>
                    Calendar
                </Title>
                <div style={{ marginBottom: 10, display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <Button
                        onClick={() => setViewMode("my")}
                        type={viewMode === "my" ? "primary" : "default"}
                    >
                        My View
                    </Button>
                    <Button
                        onClick={() => setViewMode("family")}
                        type={viewMode === "family" ? "primary" : "default"}
                    >
                        Family View
                    </Button>
                </div>
            </div>}
            {isCalendarPage && <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                }}
            >
                <Title level={3} style={{ margin: 0 }}>
                    Calendar
                </Title>
                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                    <Badge color="#2563eb" text="Personal" />
                    <Badge color="#22c55e" text="Work" />
                    <Badge color="#f59e0b" text="Family" />
                    <Badge color="#8b5cf6" text="Health" />
                    <Badge color="#ef4444" text="Bills & Finance" />
                </div>
            </div>}
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
                <DocklyLoader />
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
                    height={height}
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

export default RenderCalendarCard;