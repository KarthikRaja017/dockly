
import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import moment from "moment";
import "react-calendar/dist/Calendar.css";
import { Input, Button, Space, Tag, Modal, Dropdown, Menu } from "antd";
import "antd/dist/reset.css";

interface EventItem {
  date: string;
  title: string;
  subtitle?: string;
  time?: string;
  duration?: string;
  mentions?: string[];
  status?: "completed" | "reschedule" | "pending";
  color?: string;
  owner?: string;
}

const CalendarEventWidget: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"my" | "family">("my");
  const [events, setEvents] = useState<EventItem[]>([
    {
      date: "2025-05-03",
      title: "Meeting with Asfar",
      subtitle: "Agenda: Dockly",
      time: "10:00 AM EST",
      duration: "1h",
      mentions: ["Asfar"],
      owner: "Asfar",
    },
    {
      date: "2025-05-06",
      title: "Doctor's Appointment",
      subtitle: "Neurologist",
      time: "6:00 PM EST",
      duration: "30m",
      mentions: ["Asfar's son"],
      owner: "Asfar's son",
    },
    {
      date: "2025-05-10",
      title: "Team Review",
      subtitle: "Sprint Planning",
      time: "2:00 PM EST",
      duration: "2h",
      mentions: ["Asfar"],
      owner: "Asfar",
    },
  ]);
  const [newEventInput, setNewEventInput] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState<boolean>(false);
  const [eventToReschedule, setEventToReschedule] = useState<EventItem | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState<string>("");
  const [showMentionDropdown, setShowMentionDropdown] = useState<boolean>(false);
  const [mentionPosition, setMentionPosition] = useState<number>(0);

  const inputRef = useRef<any>(null);

  const statusColors: Record<NonNullable<EventItem["status"]>, string> = {
    completed: "#10B981",
    reschedule: "#EF4444",
    pending: "#F59E0B",
  };

  const ownerColors: Record<string, string> = {
    Asfar: "#00FF00",
    "Asfar's son": "#FFFF00",
  };

  const familyMembers: string[] = ["Asfar", "Asfar's son"];

  const isInvalidDate = (date: Date) =>
    moment(date).isBefore(moment().startOf("day"));

  const parseEventInput = (input: string) => {
    const timeRegex = /(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)/i;
    const mentionRegex = /@(\w+)/g;
    const durationRegex = /\b(\d+[hm])\b/i;

    const timeMatch = input.match(timeRegex);
    const time = timeMatch ? moment(timeMatch[0], ["h:mm A", "h A"]).format("h:mm A") : "11:59 PM";

    const mentions = [];
    let mentionMatch;
    while ((mentionMatch = mentionRegex.exec(input)) !== null) {
      const mention = mentionMatch[1];
      if (familyMembers.includes(mention)) mentions.push(mention);
    }

    const durationMatch = input.match(durationRegex);
    const duration = durationMatch ? durationMatch[0] : "1h";

    const title = input
      .replace(timeRegex, "")
      .replace(mentionRegex, "")
      .replace(durationRegex, "")
      .trim();

    return { title, time, duration, mentions };
  };

  const handleAddEvent = () => {
    const trimmed = newEventInput.trim();
    if (!trimmed) return alert("Please enter an event description.");

    const { title, time, duration, mentions } = parseEventInput(trimmed);
    if (!title) return alert("Please provide a valid event title.");
    if (isInvalidDate(selectedDate))
      return alert("Cannot add events to past dates.");

    const owner = mentions.length > 0 ? mentions[0] : "Asfar";

    const newEvent: EventItem = {
      title,
      date: moment(selectedDate).format("YYYY-MM-DD"),
      time,
      duration,
      mentions,
      status: "pending",
      color: ownerColors[owner] || "#1890ff",
      owner,
    };
    setEvents((prev) => [...prev, newEvent]);
    setNewEventInput("");
    setShowAddForm(false);
    setShowMentionDropdown(false);
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
      <div style={{ textAlign: "center", marginTop: 2 }}>
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewEventInput(value);

    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowMentionDropdown(true);
      setMentionPosition(lastAtIndex);
    } else {
      setShowMentionDropdown(false);
    }
  };

  const handleMentionSelect = (mention: string) => {
    const beforeAt = newEventInput.substring(0, mentionPosition);
    const afterAt = newEventInput.substring(mentionPosition + 1);
    setNewEventInput(`${beforeAt}@${mention} ${afterAt}`);
    setShowMentionDropdown(false);
    inputRef.current?.focus();
  };

  const mentionMenu = (
    <Menu>
      {familyMembers.map((member) => (
        <Menu.Item key={member} onClick={() => handleMentionSelect(member)}>
          {member}
        </Menu.Item>
      ))}
    </Menu>
  );

  const filteredEvents = events
    .filter((e) => e.date === moment(selectedDate).format("YYYY-MM-DD"))
    .filter((e) => (viewMode === "my" ? e.owner === "Asfar" : true));

  const categorizedEvents = [
    ...events.filter((e) => (e.status === "pending" || !e.status) && (viewMode === "my" ? e.owner === "Asfar" : true)),
    ...events.filter((e) => e.status === "reschedule" && (viewMode === "my" ? e.owner === "Asfar" : true)),
    ...events.filter((e) => e.status === "completed" && (viewMode === "my" ? e.owner === "Asfar" : true)),
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
        padding: "20px",
        width: "90vw", // Use viewport width to adjust dynamically
        maxWidth: "1200px", // Upper limit for larger screens
        minWidth: "320px", // Minimum width for smaller screens
        margin: "0 auto", // Center the widget
        fontFamily: "Segoe UI, sans-serif",
        border: "1px solid #E5E7EB",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        .react-calendar {
          width: 100%;
          border: none;
          font-family: 'Segoe UI', sans-serif;
          background: white;
          border-radius: 8px;
          padding: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .react-calendar__navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .react-calendar__navigation__label {
          font-size: 16px;
          font-weight: 600;
          color: #1E3A8A;
        }
        .react-calendar__navigation__arrow {
          background: none;
          border: none;
          font-size: 20px;
          color: #2563EB;
          cursor: pointer;
          padding: 5px 10px;
        }
        .react-calendar__navigation__arrow:hover {
          background: #DBEAFE;
          border-radius: 50%;
        }
        .react-calendar__month-view__weekdays {
          font-size: 12px;
          font-weight: 600;
          color: #4B5563;
          margin-bottom: 8px;
        }
        .react-calendar__month-view__weekdays__weekday {
          text-align: center;
        }
        .react-calendar__month-view__days {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }
        .react-calendar__tile {
          padding: 10px 0;
          border-radius: 8px;
          transition: background 0.3s, color 0.3s;
          font-size: 14px;
          color: #1F2937;
          text-align: center;
        }
        .react-calendar__tile:hover {
          background: #DBEAFE;
        }
        .selected-tile {
          background: #2563EB !important;
          color: white !important;
        }
        .today-tile {
          background: #E5E7EB;
          font-weight: bold;
        }
        .react-calendar__tile--active {
          background: #2563EB !important;
          color: white !important;
        }
        .react-calendar__month-view__days__day--neighboringMonth {
          color: #9CA3AF;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .react-calendar__tile {
            padding: 8px 0;
            font-size: 12px;
          }
          .react-calendar__navigation__label {
            font-size: 14px;
          }
          .react-calendar__navigation__arrow {
            font-size: 18px;
            padding: 3px 8px;
          }
          .react-calendar__month-view__weekdays {
            font-size: 10px;
          }
        }

        @media (max-width: 480px) {
          .react-calendar__tile {
            padding: 6px 0;
            font-size: 10px;
          }
          .react-calendar__navigation__label {
            font-size: 12px;
          }
          .react-calendar__navigation__arrow {
            font-size: 16px;
            padding: 2px 6px;
          }
          .react-calendar__month-view__weekdays {
            font-size: 9px;
          }
        }
      `}</style>

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
        <h3 style={{ fontSize: "clamp(16px, 2.5vw, 18px)", fontWeight: 600 }}>Upcoming Events</h3>
        {categorizedEvents.length === 0 ? (
          <p style={{ color: "#6B7280", fontSize: "clamp(12px, 2vw, 14px)" }}>No events yet.</p>
        ) : (
          <div style={{ marginTop: 12 }}>
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              {currentIndex > 0 && (
                <button
                  onClick={() =>
                    setCurrentIndex((prev) => (prev === 0 ? 0 : prev - 1))
                  }
                  style={{
                    background: "#E5E7EB",
                    border: "none",
                    borderRadius: "50%",
                    width: "clamp(24px, 3vw, 28px)",
                    height: "clamp(24px, 3vw, 28px)",
                    cursor: "pointer",
                    fontSize: "clamp(14px, 2vw, 18px)",
                    position: "absolute",
                    left: "clamp(-20px, -2vw, -16px)",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  ←
                </button>
              )}

              <div
                style={{
                  background: "white",
                  borderRadius: 12,
                  width: "100%",
                  maxWidth: "clamp(400px, 80vw, 480px)",
                  display: "flex",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    backgroundColor: categorizedEvents[currentIndex].color || "#2563EB",
                    color: "white",
                    padding: "10px 14px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "clamp(60px, 10vw, 70px)",
                  }}
                >
                  <div style={{ fontSize: "clamp(10px, 1.5vw, 12px)" }}>
                    {moment(categorizedEvents[currentIndex].date)
                      .format("MMM")
                      .toUpperCase()}
                  </div>
                  <div style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 700 }}>
                    {moment(categorizedEvents[currentIndex].date).format("D")}
                  </div>
                </div>
                <div style={{ padding: "clamp(8px, 1.5vw, 12px)", flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "clamp(14px, 2vw, 16px)" }}>
                    {categorizedEvents[currentIndex].title}
                  </div>
                  {categorizedEvents[currentIndex].subtitle && (
                    <div style={{ fontSize: "clamp(11px, 1.8vw, 13px)" }}>
                      {categorizedEvents[currentIndex].subtitle}
                    </div>
                  )}
                  {categorizedEvents[currentIndex].time && (
                    <div style={{ fontSize: "clamp(11px, 1.8vw, 13px)" }}>
                      {categorizedEvents[currentIndex].time} {categorizedEvents[currentIndex].duration && `(${categorizedEvents[currentIndex].duration})`}
                    </div>
                  )}
                  {categorizedEvents[currentIndex].mentions && (
                    <div style={{ marginTop: 4 }}>
                      {categorizedEvents[currentIndex].mentions.map((mention, i) => (
                        <Tag key={i} color="blue" style={{ fontSize: "clamp(10px, 1.5vw, 12px)" }}>
                          @{mention}
                        </Tag>
                      ))}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: "clamp(10px, 1.5vw, 12px)",
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

              {currentIndex < categorizedEvents.length - 1 && (
                <button
                  onClick={() =>
                    setCurrentIndex((prev) => (prev + 1) % categorizedEvents.length)
                  }
                  style={{
                    background: "#E5E7EB",
                    border: "none",
                    borderRadius: "50%",
                    width: "clamp(24px, 3vw, 28px)",
                    height: "clamp(24px, 3vw, 28px)",
                    cursor: "pointer",
                    fontSize: "clamp(14px, 2vw, 18px)",
                    position: "absolute",
                    right: "clamp(-20px, -2vw, -16px)",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  →
                </button>
              )}
            </div>

            <div style={{ textAlign: "center", marginTop: 8 }}>
              <strong style={{ fontSize: "clamp(12px, 2vw, 14px)" }}>
                {currentIndex + 1} / {categorizedEvents.length}
              </strong>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: "clamp(14px, 2.2vw, 16px)", fontWeight: 600 }}>
          Events on {moment(selectedDate).format("MMM DD, YYYY")}
        </h3>
        {filteredEvents.length === 0 ? (
          <p style={{ fontSize: "clamp(12px, 2vw, 14px)", color: "#6B7280" }}>
            No events for this date.
          </p>
        ) : (
          filteredEvents.map((e, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                padding: "clamp(8px, 1.5vw, 10px)",
                borderLeft: `4px solid ${e.color || "#2563EB"}`,
                borderRadius: 6,
                marginTop: 8,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "clamp(14px, 2vw, 16px)" }}>
                {e.title}
              </div>
              {e.subtitle && <div style={{ fontSize: "clamp(11px, 1.8vw, 13px)" }}>{e.subtitle}</div>}
              {e.time && <div style={{ fontSize: "clamp(11px, 1.8vw, 13px)" }}>{e.time} {e.duration && `(${e.duration})`}</div>}
              {e.mentions && (
                <div style={{ marginTop: 4 }}>
                  {e.mentions.map((mention, i) => (
                    <Tag key={i} color="blue" style={{ fontSize: "clamp(10px, 1.5vw, 12px)" }}>
                      @{mention}
                    </Tag>
                  ))}
                </div>
              )}
              <div
                style={{
                  fontSize: "clamp(10px, 1.5vw, 12px)",
                  color: statusColors[e.status || "pending"],
                  fontWeight: 500,
                  marginTop: 4,
                }}
              >
                {e.status?.toUpperCase()}
              </div>
              {e.status !== "completed" && (
                <div style={{ marginTop: 6, display: "flex", gap: "clamp(4px, 1vw, 6px)" }}>
                  <Button
                    onClick={() => handleReschedule(e)}
                    style={{
                      backgroundColor: "#F59E0B",
                      color: "#FFF",
                      border: "none",
                      fontSize: "clamp(10px, 1.5vw, 12px)",
                      padding: "clamp(4px, 0.8vw, 6px) clamp(8px, 1.2vw, 10px)",
                    }}
                  >
                    Reschedule
                  </Button>
                  <Button
                    onClick={() => handleMarkCompleted(e)}
                    style={{
                      backgroundColor: "#10B981",
                      color: "#FFF",
                      border: "none",
                      fontSize: "clamp(10px, 1.5vw, 12px)",
                      padding: "clamp(4px, 0.8vw, 6px) clamp(8px, 1.2vw, 10px)",
                    }}
                  >
                    Complete
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        {!showAddForm ? (
          <Button
            type="primary"
            onClick={() => setShowAddForm(true)}
            style={{ width: "100%", fontSize: "clamp(12px, 2vw, 14px)" }}
          >
            Add Event
          </Button>
        ) : (
          <div style={{ marginTop: 8, position: "relative" }}>
            <Dropdown
              overlay={mentionMenu}
              visible={showMentionDropdown}
              onVisibleChange={(visible) => setShowMentionDropdown(visible)}
            >
              <Input
                ref={inputRef}
                value={newEventInput}
                onChange={handleInputChange}
                placeholder="e.g. playing badminton @Asfar at 1pm for 1h"
                style={{ marginBottom: 10, fontSize: "clamp(12px, 2vw, 14px)" }}
                autoFocus
                onPressEnter={handleAddEvent}
              />
            </Dropdown>
            <Space style={{ width: "100%", display: "flex", gap: "clamp(8px, 1.5vw, 10px)" }}>
              <Button
                type="primary"
                onClick={() => {
                  handleAddEvent();
                }}
                style={{ flex: 1, fontSize: "clamp(12px, 2vw, 14px)" }}
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false);
                  setNewEventInput("");
                  setShowMentionDropdown(false);
                }}
                style={{ flex: 1, fontSize: "clamp(12px, 2vw, 14px)" }}
              >
                Cancel
              </Button>
            </Space>
          </div>
        )}
      </div>

      <Modal
        title={`Reschedule Event: ${eventToReschedule?.title}`}
        open={rescheduleModalOpen}
        onCancel={() => {
          setRescheduleModalOpen(false);
          setEventToReschedule(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setRescheduleModalOpen(false);
              setEventToReschedule(null);
            }}
            style={{ fontSize: "clamp(12px, 2vw, 14px)" }}
          >
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={() => {
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
            }}
            style={{ fontSize: "clamp(12px, 2vw, 14px)" }}
          >
            Save
          </Button>,
        ]}
        style={{ width: "clamp(280px, 80vw, 400px)" }}
      >
        <Input
          type="date"
          value={newRescheduleDate}
          onChange={(e) => setNewRescheduleDate(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 12, fontSize: "clamp(12px, 2vw, 14px)" }}
        />
      </Modal>
    </div>
  );
};

export default CalendarEventWidget;

