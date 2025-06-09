import React from "react";
import RenderCalendarCard from "../components/customCalendar";
import EventCarousel from "../components/eventCarousel";

interface CalendarEventWidgetProps {
  events: any[];
  accountColor: any;
}

const CalendarEventWidget: React.FC<CalendarEventWidgetProps> = ({ events, accountColor }) => {
  return (
    <div
      style={{
        background: "#F9FAFB",
        borderRadius: 16,
        width: "90vw",
        maxWidth: "1200px",
        minWidth: "320px",
        margin: "0 auto",
        fontFamily: "Segoe UI, sans-serif",
        border: "1px solid #E5E7EB",
        boxSizing: "border-box",
      }}
    >
      <RenderCalendarCard height={400} isCalendarPage={false} events={events} accountColor={accountColor} />
      <EventCarousel events={events} />
    </div>
  );
};

export default CalendarEventWidget;

