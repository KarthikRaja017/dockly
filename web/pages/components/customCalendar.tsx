// 'use client';
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import listPlugin from "@fullcalendar/list";
// import { Badge, Button, Card, Typography } from "antd";
// import { useState } from "react";
// import DocklyLoader from "../../utils/docklyLoader";
// import './styles.css'

// const { Title } = Typography;

// const RenderCalendarCard = (props: any) => {
//     const { loading, events = [], accountColor, height = 620, isCalendarPage = true } = props;
//     const [currentView, setCurrentView] = useState("dayGridMonth");
//     const [viewMode, setViewMode] = useState<"my" | "family">("my");

//     const processedEvents = events?.map((event: any) => {
//         const email = event.source_email;
//         const provider = event.provider?.toLowerCase() || "google";
//         const key = `${provider}:${email}`;
//         const color = accountColor[key] || "#4f46e5"; // fallback to indigo
//         return {
//             ...event,
//             backgroundColor: color,
//             borderColor: color,
//             textColor: "#ffffff",
//         };
//     });

//     return (
//         <Card
//             style={{
//                 background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
//                 boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
//                 padding: isCalendarPage ? "24px" : 0,
//                 borderRadius: "16px",
//                 border: "1px solid #e0e0e0",
//                 marginBottom: isCalendarPage ? "16px" : 0,
//             }}
//         >
//             {!isCalendarPage && (
//                 <div style={{ display: "flex", justifyContent: "space-between" }}>
//                     <Title level={4} style={{ margin: 0 }}>
//                         Calendar
//                     </Title>
//                     <div style={{ marginBottom: 10, display: "flex", gap: "10px", flexWrap: "wrap" }}>
//                         <Button onClick={() => setViewMode("my")} type={viewMode === "my" ? "primary" : "default"}>My View</Button>
//                         <Button onClick={() => setViewMode("family")} type={viewMode === "family" ? "primary" : "default"}>Family View</Button>
//                     </div>
//                 </div>
//             )}

//             {isCalendarPage && (
//                 <div
//                     style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                         marginBottom: "16px",
//                     }}
//                 >
//                     <Title level={3} style={{ margin: 0 }}>
//                         Calendar
//                     </Title>
//                     <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
//                         <Badge color="#3b82f6" text="Personal" />
//                         <Badge color="#10b981" text="Work" />
//                         <Badge color="#f59e0b" text="Family" />
//                         <Badge color="#8b5cf6" text="Health" />
//                         <Badge color="#ef4444" text="Finance" />
//                     </div>
//                 </div>
//             )}

//             {loading ? (
//                 <DocklyLoader />
//             ) : (
//                 <FullCalendar
//                     plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
//                     initialView="dayGridMonth"
//                     headerToolbar={{
//                         left: "prev,next today",
//                         center: "title",
//                         right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
//                     }}
//                     buttonText={{
//                         dayGridMonth: "Month",
//                         timeGridWeek: "Week",
//                         timeGridDay: "Day",
//                         listWeek: "List",
//                         today: "Today",
//                     }}
//                     height={height}
//                     events={processedEvents}
//                     eventClick={(info: any) => {
//                         alert(`Event: ${info.event.title}`);
//                     }}
//                     nowIndicator
//                     eventDisplay="block"
//                     dayMaxEventRows
//                     selectable
//                     selectMirror
//                     datesSet={(arg) => setCurrentView(arg.view.type)}
//                     dayHeaderContent={(args) => (
//                         <div style={{
//                             color: '#4b5563',
//                             fontWeight: 'bold',
//                             fontSize: '14px',
//                             padding: '4px',
//                             borderBottom: '2px solid #d1d5db'
//                         }}>{args.text}</div>
//                     )}
//                     eventContent={(arg) => (
//                         <div
//                             style={{
//                                 backgroundColor: arg.event.backgroundColor,
//                                 color: arg.event.textColor,
//                                 padding: '4px 6px',
//                                 borderRadius: '8px',
//                                 fontSize: '12px',
//                                 overflow: 'hidden',
//                                 whiteSpace: 'nowrap',
//                                 textOverflow: 'ellipsis'
//                             }}
//                         >
//                             {arg.event.title}
//                         </div>
//                     )}
//                 />
//             )}
//         </Card>
//     );
// };

// export default RenderCalendarCard;



// Required dependencies:
// npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/multimonth @fullcalendar/interaction antd

import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin from "@fullcalendar/interaction";
import { Card, Layout, Typography } from "antd";
import "./calendar.css";

const { Header, Content } = Layout;
const { Title } = Typography;

const events = [
    { title: "Family Brunch", start: "2025-06-08T10:00:00", color: "#f8d7da" },
    { title: "Emma - Soccer Practice", start: "2025-06-08T14:00:00", color: "#e0c7ff" },
    { title: "John - Team Meeting", start: "2025-06-09T09:00:00", color: "#cce5ff" },
    { title: "Liam - Piano Lesson", start: "2025-06-09T15:30:00", color: "#fdd3ce" },
    { title: "Sarah - Book Club", start: "2025-06-09T19:00:00", color: "#d6d8ff" },
    { title: "Liam - Dentist", start: "2025-06-10T14:00:00", color: "#fdd3ce" },
    { title: "Emma - Math Tutoring", start: "2025-06-10T16:00:00", color: "#e0c7ff" },
    { title: "Family Game Night", start: "2025-06-11T18:30:00", color: "#f8d7da" },
    { title: "Sarah - Doctor Appt", start: "2025-06-12T10:00:00", color: "#d6d8ff" },
    { title: "Emma - School Play", start: "2025-06-12T19:00:00", color: "#e0c7ff" },
    { title: "John - Presentation", start: "2025-06-13T14:00:00", color: "#cce5ff" },
    { title: "Movie Night", start: "2025-06-13T19:00:00", color: "#f8d7da" },
    { title: "Farmers Market", start: "2025-06-14T09:00:00", color: "#f8d7da" },
    { title: "Liam - Soccer Game", start: "2025-06-14T11:00:00", color: "#fdd3ce" },
    { title: "BBQ with Neighbors", start: "2025-06-14T18:00:00", color: "#cce5ff" },
];

const meals = {
    "2025-06-08": ["🥞 Pancakes & Eggs", "🍕 Pizza Night"],
    "2025-06-09": ["🍝 Spaghetti Bolognese"],
    "2025-06-10": ["🌮 Taco Tuesday"],
    "2025-06-11": ["🍗 Grilled Chicken", "🥗 Caesar Salad"],
    "2025-06-12": ["🍲 Slow Cooker Stew"],
    "2025-06-13": ["🍕 Pizza Friday"],
    "2025-06-14": ["🍔 BBQ Burgers"],
};

const renderEvent = (info: any) => (
    <div style={{
        background: info.event.backgroundColor,
        borderRadius: 6,
        padding: "2px 6px",
        marginBottom: 2,
        fontSize: 12,
        color: "#333",
    }}>
        {info.event.title}
    </div>
);

export default function CalendarPage() {
    return (
        <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
            <Header style={{ background: "#fff", padding: "0 24px" }}>
                <Title level={3} style={{ margin: 0 }}>June 2025</Title>
            </Header>
            <Content style={{ padding: 24 }}>
                <Card>
                    <FullCalendar
                        plugins={[timeGridPlugin, dayGridPlugin, multiMonthPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                            left: "prev,today,next",
                            center: "",
                            right: "timeGridDay,timeGridWeek,dayGridMonth,multiMonthYear"
                        }}
                        slotMinTime="06:00:00"
                        slotMaxTime="22:00:00"
                        slotDuration="02:00:00"
                        slotLabelFormat={{ hour: "numeric", omitZeroMinute: true }}
                        events={events}
                        eventContent={renderEvent}
                        height="auto"
                    />

                    <div style={{ marginTop: 24 }}>
                        <Title level={4}>MEALS</Title>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7,1fr)",
                            columnGap: 16,
                            padding: "8px 0"
                        }}>
                            {Object.entries(meals).map(([day, items]) => (
                                <div key={day}>
                                    <strong>{new Date(day).toLocaleDateString("en-US", { weekday: "short" })}</strong>
                                    <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                                        {items.map((it, i) => <li key={i}>{it}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </Content>

            <style jsx global>{`
        .fc {
          font-family: "Segoe UI", sans-serif;
        }
        .fc .fc-timegrid-slot-label {
          font-size: 12px;
          color: #777;
          width: 40px;
        }
        .fc .fc-timegrid-slot {
          border-top: 1px solid #eee;
        }
        .fc .fc-timegrid-slot:nth-child(2n) {
          border-top: 2px solid #ddd;
        }
        .fc .fc-button {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 4px 12px;
          margin-left: 4px;
          font-size: 14px;
        }
        .fc .fc-button.fc-button-active {
          background: #adc8ff;
          border-color: #adc8ff;
        }
        .fc .fc-col-header-cell {
          background: #fafafa;
          padding: 12px 0;
          font-weight: 500;
        }
        .fc-event {
          border-radius: 6px !important;
          border: 1px solid #ccc !important;
          font-size: 12px !important;
          padding: 4px 6px !important;
        }
      `}</style>
        </Layout>
    );
}

