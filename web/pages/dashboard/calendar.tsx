
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import moment from "moment";
import "react-calendar/dist/Calendar.css";

interface EventItem {
  date: string;
  title: string;
  subtitle?: string;
  time?: string;
  status?: "completed" | "reschedule" | "pending";
  color?: string;
}

const CalendarEventWidget = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<EventItem[]>([
    {
      date: "2025-05-03",
      title: "Meeting with Asfar",
      subtitle: "Agenda: Dockly",
      time: "10am EST",
    },
    {
      date: "2025-05-06",
      title: "Doctor's Appointment",
      subtitle: "Neurologist",
      time: "6pm EST",
    },
    {
      date: "2025-05-10",
      title: "Team Review",
      subtitle: "Sprint Planning",
      time: "2pm EST",
    },
  ]);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [eventToReschedule, setEventToReschedule] = useState<EventItem | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState("");

  const statusColors: Record<NonNullable<EventItem["status"]>, string> = {
    completed: "#10B981",
    reschedule: "#EF4444",
    pending: "#F59E0B",
  };

  const isInvalidDate = (date: Date) =>
    moment(date).isBefore(moment().startOf("day"));

  const handleAddEvent = () => {
    const trimmed = newEventTitle.trim();
    if (!trimmed) return alert("Please enter a title.");
    if (isInvalidDate(selectedDate))
      return alert("Cannot add events to past dates.");

    const newEvent: EventItem = {
      title: trimmed,
      date: moment(selectedDate).format("YYYY-MM-DD"),
      status: "pending",
      color: "#2563EB", // Blue
    };
    setEvents((prev) => [...prev, newEvent]);
    setNewEventTitle("");
  };

  const handleReschedule = (event: EventItem) => {
    setEventToReschedule(event);
    setNewRescheduleDate(event.date);
    setRescheduleModalOpen(true);
  };

  const handleMarkCompleted = (event: EventItem) => {
    setEvents((prev) =>
      prev.map((e) => (e === event ? { ...e, status: "completed" } : e))
    );
  };

  const tileContent = ({ date, view }: any) => {
    const hasEvent = events.some(
      (e) => e.date === moment(date).format("YYYY-MM-DD")
    );
    return view === "month" && hasEvent ? (
      <div style={{ textAlign: "center", color: "#2563EB", marginTop: 2 }}>
        •
      </div>
    ) : null;
  };

  const tileClassName = ({ date }: any) => {
    const isToday = moment().isSame(date, "day");
    const isSelected = moment(selectedDate).isSame(date, "day");

    return [
      "react-calendar__tile",
      isToday && "today-tile",
      isSelected && "selected-tile",
    ]
      .filter(Boolean)
      .join(" ");
  };

  const filteredEvents = events.filter(
    (e) => e.date === moment(selectedDate).format("YYYY-MM-DD")
  );

  const categorizedEvents = [
    ...events.filter((e) => e.status === "pending" || !e.status),
    ...events.filter((e) => e.status === "reschedule"),
    ...events.filter((e) => e.status === "completed"),
  ];

  const currentEvent =
    categorizedEvents.length > 0
      ? categorizedEvents[currentIndex % categorizedEvents.length]
      : null;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        categorizedEvents.length > 0
          ? (prev + 1) % categorizedEvents.length
          : 0
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [categorizedEvents.length]);

  return (
    <div
      style={{
        background: "#F9FAFB",
        borderRadius: 16,
        boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
        padding: 20,
        maxWidth: 600,
        maxHeight: 1200,
        fontFamily: "Segoe UI, sans-serif",
        border: "1px solid #E5E7EB",
      }}
    >
      <style>{`
        .react-calendar { width: 100%; border: none; font-family: 'Segoe UI', sans-serif; }
        .react-calendar__tile { padding: 12px 0; border-radius: 8px; transition: background 0.3s, color 0.3s; }
        .react-calendar__tile:hover { background: #DBEAFE; }
        .selected-tile { background: #2563EB; color: white; }
        .today-tile { background: #E5E7EB; font-weight: bold; }
        .react-calendar__tile--active { background: #2563EB !important; color: white !important; }
        .react-calendar__month-view__days__day--neighboringMonth { color: #9CA3AF; }
      `}</style>

      <Calendar
        onChange={(value) => setSelectedDate(value as Date)}
        value={selectedDate}
        tileContent={tileContent}
        tileClassName={tileClassName}
        showNeighboringMonth={false}
        formatShortWeekday={(locale, date) => moment(date).format("dd")}
        next2Label={null}
        prev2Label={null}
      />

      <div style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>Upcoming Events</h3>
        {categorizedEvents.length === 0 ? (
          <p style={{ color: "#6B7280", fontSize: 14 }}>No events yet.</p>
        ) : (
          <div style={{ marginTop: 12 }}>
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              {/* Previous Button – Hidden on First Slide */}
              {currentIndex > 0 && (
                <button
                  onClick={() =>
                    setCurrentIndex((prev) => (prev === 0 ? 0 : prev - 1))
                  }
                  style={{
                    background: "#E5E7EB",
                    border: "none",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    cursor: "pointer",
                    fontSize: 18,
                    position: "absolute",
                    left: -16,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  ←
                </button>
              )}

              {/* Event Card */}
              <div
                style={{
                  background: "white",
                  borderRadius: 12,
                  width: "100%",
                  maxWidth: 480,
                  display: "flex",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#2563EB",
                    color: "white",
                    padding: "10px 14px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 70,
                  }}
                >
                  <div style={{ fontSize: 12 }}>
                    {moment(categorizedEvents[currentIndex].date)
                      .format("MMM")
                      .toUpperCase()}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>
                    {moment(categorizedEvents[currentIndex].date).format("D")}
                  </div>
                </div>
                <div style={{ padding: 12, flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>
                    {categorizedEvents[currentIndex].title}
                  </div>
                  {categorizedEvents[currentIndex].subtitle && (
                    <div style={{ fontSize: 13 }}>
                      {categorizedEvents[currentIndex].subtitle}
                    </div>
                  )}
                  {categorizedEvents[currentIndex].time && (
                    <div style={{ fontSize: 13 }}>
                      {categorizedEvents[currentIndex].time}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color:
                        statusColors[
                        categorizedEvents[currentIndex].status || "pending"
                        ],
                      marginTop: 4,
                    }}
                  >
                    {categorizedEvents[currentIndex].status?.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Next Button – Hidden on Last Slide */}
              {currentIndex < categorizedEvents.length - 1 && (
                <button
                  onClick={() =>
                    setCurrentIndex((prev) => (prev + 1) % categorizedEvents.length)
                  }
                  style={{
                    background: "#E5E7EB",
                    border: "none",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    cursor: "pointer",
                    fontSize: 18,
                    position: "absolute",
                    right: -16,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  →
                </button>
              )}
            </div>

            {/* Pagination at Bottom */}
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <strong>
                {currentIndex + 1} / {categorizedEvents.length}
              </strong>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>
          Events on {moment(selectedDate).format("MMM DD, YYYY")}
        </h3>
        {filteredEvents.length === 0 ? (
          <p style={{ fontSize: 14, color: "#6B7280" }}>No events for this date.</p>
        ) : (
          filteredEvents.map((e, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                padding: 10,
                borderLeft: `4px solid ${e.color || "#2563EB"}`,
                borderRadius: 6,
                marginTop: 8,
              }}
            >
              <div style={{ fontWeight: 600 }}>{e.title}</div>
              {e.subtitle && <div style={{ fontSize: 13 }}>{e.subtitle}</div>}
              {e.time && <div style={{ fontSize: 13 }}>{e.time}</div>}
              <div style={{
                fontSize: 12,
                color: statusColors[e.status || "pending"],
                fontWeight: 500,
                marginTop: 4,
              }}>
                {e.status?.toUpperCase()}
              </div>
              {e.status !== "completed" && (
                <div style={{ marginTop: 6 }}>
                  <button onClick={() => handleReschedule(e)} style={{
                    padding: "4px 8px",
                    fontSize: 12,
                    marginRight: 6,
                    backgroundColor: "#F59E0B",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}>Reschedule</button>
                  <button onClick={() => handleMarkCompleted(e)} style={{
                    padding: "4px 8px",
                    fontSize: 12,
                    backgroundColor: "#10B981",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}>Complete</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {/* Add Event Section */}
      <div style={{ marginTop: 16 }}>
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              width: "100%",
              backgroundColor: "#2563EB",
              color: "white",
              padding: "10px 0",
              borderRadius: 6,
              fontWeight: 500,
              cursor: "pointer",
              border: "none",
            }}
          >
            Add Event
          </button>
        ) : (
          <div style={{ marginTop: 8 }}>
            <input
              type="text"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="Event title (e.g. Team Sync)"
              style={{
                width: "100%",
                border: "1px solid #93C5FD",
                borderRadius: 6,
                padding: "8px 12px",
                marginBottom: 10,
              }}
              autoFocus
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  handleAddEvent();
                  setShowAddForm(false);
                }}
                style={{
                  flex: 1,
                  backgroundColor: "#2563EB",
                  color: "white",
                  padding: "8px 0",
                  borderRadius: 6,
                  fontWeight: 500,
                  cursor: "pointer",
                  border: "none",
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewEventTitle("");
                }}
                style={{
                  flex: 1,
                  backgroundColor: "#BFDBFE",
                  color: "#1E3A8A",
                  padding: "8px 0",
                  borderRadius: 6,
                  fontWeight: 500,
                  cursor: "pointer",
                  border: "none",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Reschedule Modal */}
      {rescheduleModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "white",
            padding: 20,
            borderRadius: 12,
            width: 300,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            backgroundColor: "whitesmoke",
            msFlexDirection: "row",
            display: "flex"
          }}>
            <h3 style={{ marginBottom: 10, fontSize: 16 }}>
              Reschedule Event: <br />
              <strong>{eventToReschedule?.title}</strong>
            </h3>
            <input
              type="date"
              value={newRescheduleDate}
              onChange={(e) => setNewRescheduleDate(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                marginBottom: 12,
                border: "1px solid #D1D5DB",
                borderRadius: 6,
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => {
                setRescheduleModalOpen(false);
                setEventToReschedule(null);
              }} style={{
                padding: "6px 12px",
                border: "none",
                backgroundColor: "#E5E7EB",
                borderRadius: 6,
                cursor: "pointer",
              }}>Cancel</button>
              <button onClick={() => {
                if (
                  moment(newRescheduleDate, "YYYY-MM-DD", true).isValid() &&
                  !isInvalidDate(new Date(newRescheduleDate)) &&
                  eventToReschedule
                ) {
                  setEvents((prev) =>
                    prev.map((e) =>
                      e === eventToReschedule
                        ? {
                          ...e,
                          date: newRescheduleDate,
                          status: "reschedule",
                        }
                        : e
                    )
                  );
                  setRescheduleModalOpen(false);
                  setEventToReschedule(null);
                }
              }} style={{
                padding: "6px 12px",
                border: "none",
                backgroundColor: "#2563EB",
                color: "white",
                borderRadius: 6,
                cursor: "pointer",
              }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarEventWidget;

