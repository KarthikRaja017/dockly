import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import moment from "moment";

interface EventItem {
  date: string;
  title: string;
  subtitle: string;
  time: string;
  color: string;
}

const CalendarEventWidget = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState("");
  const [events, setEvents] = useState<EventItem[]>([
    {
      date: "2025-04-19",
      title: "Meeting with Asfar",
      subtitle: "Agenda: Dockly",
      time: "10am EST",
      color: "#F97316",
    },
    {
      date: "2025-04-25",
      title: "Doctor's Appointment",
      subtitle: "Neurologist",
      time: "6pm EST",
      color: "#8B5CF6",
    },
  ]);

  const handleAddEvent = () => {
    if (!newEvent.trim()) return;

    const newItem = {
      date: moment(selectedDate).format("YYYY-MM-DD"),
      title: newEvent,
      subtitle: "",
      time: "TBD",
      color: "#3B82F6",
    };

    setEvents([...events, newItem]);
    setNewEvent("");
  };

  const eventsOnSelectedDate = events.filter(
    (e) => e.date === moment(selectedDate).format("YYYY-MM-DD")
  );

  const tileContent = ({ date, view }: any) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    const hasEvent = events.some((e) => e.date === formattedDate);

    return view === "month" && hasEvent ? (
      <div style={{ textAlign: "center", color: "#2563EB", marginTop: 2 }}>•</div>
    ) : null;
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
        padding: 20,
        maxWidth: 420,
        // margin: "auto",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <Calendar
        onChange={(value) => setSelectedDate(value as Date)}
        value={selectedDate}
        tileContent={tileContent}
        className="custom-calendar"
      />

      <div style={{ marginTop: 20 }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: 600,
          marginBottom: 4,
          fontSize: 16,
        }}>
          <span>Add to Calendar</span>
          <a style={{ fontSize: 14, color: "#3B82F6" }}>View All</a>
        </div>
        <p style={{ fontSize: 14, color: "#6B7280" }}>
          Upcoming Event on {moment(selectedDate).format("Do MMMM")}
        </p>

        {eventsOnSelectedDate.map((event, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              display: "flex",
              gap: 12,
              boxShadow: "inset 0 0 4px rgba(0,0,0,0.04)",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                backgroundColor: "#EFF6FF",
                borderRadius: 10,
                padding: "6px 10px",
                textAlign: "center",
                minWidth: 50,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {moment(event.date).format("DD")}
              </div>
              <div style={{ fontSize: 12 }}>
                {moment(event.date).format("MMM")}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{event.title}</div>
              <div style={{ color: "#6B7280", fontSize: 13 }}>{event.subtitle}</div>
            </div>
            <span
              style={{
                backgroundColor: `${event.color}20`,
                color: event.color,
                fontSize: 12,
                borderRadius: 6,
                padding: "4px 8px",
                alignSelf: "center",
              }}
            >
              {event.time}
            </span>
          </div>
        ))}

        <div style={{ display: "flex", marginTop: 16, gap: 8 }}>
          <input
            type="text"
            placeholder="Add new event..."
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #D1D5DB",
              fontSize: 14,
            }}
          />
          <button
            onClick={handleAddEvent}
            style={{
              backgroundColor: "#2563EB",
              color: "white",
              padding: "8px 16px",
              borderRadius: 8,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarEventWidget;
