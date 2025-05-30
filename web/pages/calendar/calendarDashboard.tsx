"use client";

import { Badge, Button, Calendar, Card, Progress } from "antd";
import { useEffect, useState } from "react";
import { capitalizeEachWord, getGreeting } from "../../app/comman";

const CalendarDashboard = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<string[]>([]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const userObj = user ? JSON.parse(user) : null;
    setUsername(userObj?.name);
  }, []);
  const eventsToday = 5;
  const completedToday = 3;
  const percent = (completedToday / eventsToday) * 100;

  return (
    <div>
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
          <div>
            <h2
              style={{ fontSize: "18px", fontWeight: "bold", color: "#111827" }}
            >
              {getGreeting()},{capitalizeEachWord(username ?? "")}
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
              You have {upcomingEvents.length} upcoming{" "}
              {upcomingEvents.length === 1 ? "event" : "events"} today. Don’t
              miss them!
            </p>

            <Progress percent={percent} style={{ width: "200px" }} />
            <p style={{ fontSize: "12px", color: "#6b7280" }}>
              {completedToday} of {eventsToday} events done today — stay on
              track!
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              //   onClick={handleConnectMore}
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
      </Card>

      <div style={{ display: "flex", gap: "16px" }}>
        {/* <div style={{ flex: 2 }}>{renderCalendarCard()}</div> */}
        {/* <div style={{ flex: 1 }}>{renderOverviewCard()}</div> */}
      </div>
    </div>
  );

  //   const renderOverviewCard = () => (
  //     <>
  //       <Card style={cardStyle}>
  //         <div
  //           style={{
  //             display: "flex",
  //             justifyContent: "space-between",
  //             alignItems: "center",
  //             marginBottom: "16px",
  //           }}
  //         >
  //           <h3 style={{ fontSize: "16px", fontWeight: "600" }}>
  //             Today's Overview
  //           </h3>
  //           <Button type="link">View All</Button>
  //         </div>
  //         <h2
  //           style={{
  //             fontSize: "24px",
  //             fontWeight: "bold",
  //             textAlign: "center",
  //           }}
  //         >
  //           {selectedDate.format("D")}
  //         </h2>
  //         <p
  //           style={{
  //             fontSize: "14px",
  //             color: "#6b7280",
  //             textAlign: "center",
  //           }}
  //         >
  //           {selectedDate.format("ddd YYYY")}
  //         </p>
  //         <div style={{ marginTop: "16px" }}>
  //           <OverviewProgress
  //             color="#2563eb"
  //             label="Personal Tasks"
  //             percent={50}
  //           />
  //           <OverviewProgress color="#22c55e" label="Work Tasks" percent={80} />
  //           <OverviewProgress
  //             color="#f59e0b"
  //             label="Family Activities"
  //             percent={25}
  //           />
  //         </div>
  //       </Card>
  //     </>
  //   );

  //   const OverviewProgress = ({ color, label, percent }) => (
  //     <p
  //       style={{
  //         fontSize: "14px",
  //         display: "flex",
  //         alignItems: "center",
  //         gap: "8px",
  //       }}
  //     >
  //       <Badge color={color} /> {`${percent / 10} ${label}`}{" "}
  //       <Progress percent={percent} size="small" />
  //     </p>
  //   );
};

export default CalendarDashboard;

const renderCalendarCard = () => {
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
        <div style={{ display: "flex", gap: "8px" }}>
          {["Day", "Week", "Month"].map((mode) => (
            <Button
              key={mode}
              // onClick={() => handleViewChange(mode)}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
                //   backgroundColor: viewMode === mode ? "#2563eb" : "#fff",
                //   color: viewMode === mode ? "#fff" : "#000",
              }}
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>

      {/* {viewMode === "Day" && renderDayView()}
            {viewMode === "Week" && renderWeekView()}
            {viewMode === "Month" && renderMonthView()} */}

      <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
        <Badge color="#2563eb" text="Personal" />
        <Badge color="#22c55e" text="Work" />
        <Badge color="#f59e0b" text="Family" />
        <Badge color="#8b5cf6" text="Health" />
        <Badge color="#ef4444" text="Bills & Finance" />
      </div>
    </Card>
  );
};

//   const renderDayView = () => (
//     <div>
//       <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
//         {selectedDate.format("MMMM D, YYYY")}
//       </h4>
//       <div style={{ height: "400px", overflowY: "auto" }}>
//         {calendarEvents.length > 0 ? (
//           calendarEvents
//             .filter((event) =>
//               moment(event.start.dateTime || event.start.date).isSame(
//                 selectedDate,
//                 "day"
//               )
//             )
//             .map((event, index) => renderCalendarEvent(event, index))
//         ) : (
//           <p>No events for this day.</p>
//         )}
//       </div>
//     </div>
//   );

//   const renderWeekView = () => (
//     <div>
//       <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
//         Week of {selectedDate.startOf("week").format("MMMM D, YYYY")}
//       </h4>
//       <div style={{ height: "400px", overflowY: "auto" }}>
//         {calendarEvents.length > 0 ? (
//           calendarEvents
//             .filter((event) =>
//               moment(event.start.dateTime || event.start.date).isBetween(
//                 moment(selectedDate).startOf("week"),
//                 moment(selectedDate).endOf("week"),
//                 undefined,
//                 "[]"
//               )
//             )
//             .map((event, index) => renderCalendarEvent(event, index, true))
//         ) : (
//           <p>No events for this week.</p>
//         )}
//       </div>
//     </div>
//   );

//   const renderMonthView = () => (
//     <Calendar
//       fullscreen={false}
//       dateCellRender={dateCellRender}
//       onSelect={onSelectDate}
//       value={require("dayjs")(selectedDate.toDate())}
//       onPanelChange={(date) => setSelectedDate(moment(date.toDate()))}
//     />
//   );

//   const renderCalendarEvent = (event, index, showDate = false) => (
//     <div
//       key={index}
//       style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}
//     >
//       <div
//         style={{
//           width: showDate ? "100px" : "50px",
//           fontSize: "12px",
//           color: "#6b7280",
//         }}
//       >
//         {moment(event.start.dateTime).format(
//           showDate ? "MMM D, h:mm A" : "h:mm A"
//         )}
//       </div>
//       <div
//         style={{
//           flex: 1,
//           backgroundColor: "#fee2e2",
//           padding: "8px",
//           borderRadius: "4px",
//           borderLeft: "4px solid #ef4444",
//         }}
//       >
//         <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>
//           {event.summary}
//         </p>
//         <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
//           {`${moment(event.start.dateTime).format("h:mm A")} - ${moment(
//             event.end.dateTime
//           ).format("h:mm A")}`}
//         </p>
//       </div>
//     </div>
//   );
