'use client';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { Badge, Button, Card, Typography } from "antd";
import { useState } from "react";
import DocklyLoader from "../../utils/docklyLoader";

const { Title } = Typography;

const RenderCalendarCard = (props: any) => {
    const { loading, events = [], accountColor, height = 620, isCalendarPage = true } = props;
    const [currentView, setCurrentView] = useState("dayGridMonth");
    const [viewMode, setViewMode] = useState<"my" | "family">("my");

    const processedEvents = events?.map((event: any) => {
        const email = event.source_email;
        const provider = event.provider?.toLowerCase() || "google";
        const key = `${provider}:${email}`;
        const color = accountColor[key] || "#4f46e5"; // fallback to indigo
        return {
            ...event,
            backgroundColor: color,
            borderColor: color,
            textColor: "#ffffff",
        };
    });

    return (
        <Card
            style={{
                background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
                padding: isCalendarPage ? "24px" : 0,
                borderRadius: "16px",
                border: "1px solid #e0e0e0",
                marginBottom: isCalendarPage ? "16px" : 0,
            }}
        >
            {!isCalendarPage && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Title level={4} style={{ margin: 0 }}>
                        Calendar
                    </Title>
                    <div style={{ marginBottom: 10, display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <Button onClick={() => setViewMode("my")} type={viewMode === "my" ? "primary" : "default"}>My View</Button>
                        <Button onClick={() => setViewMode("family")} type={viewMode === "family" ? "primary" : "default"}>Family View</Button>
                    </div>
                </div>
            )}

            {isCalendarPage && (
                <div
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
                        <Badge color="#3b82f6" text="Personal" />
                        <Badge color="#10b981" text="Work" />
                        <Badge color="#f59e0b" text="Family" />
                        <Badge color="#8b5cf6" text="Health" />
                        <Badge color="#ef4444" text="Finance" />
                    </div>
                </div>
            )}

            {loading ? (
                <DocklyLoader />
            ) : (
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
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
                    dayHeaderContent={(args) => (
                        <div style={{
                            color: '#4b5563',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            padding: '4px',
                            borderBottom: '2px solid #d1d5db'
                        }}>{args.text}</div>
                    )}
                    eventContent={(arg) => (
                        <div
                            style={{
                                backgroundColor: arg.event.backgroundColor,
                                color: arg.event.textColor,
                                padding: '4px 6px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            {arg.event.title}
                        </div>
                    )}
                />
            )}
        </Card>
    );
};

export default RenderCalendarCard;
