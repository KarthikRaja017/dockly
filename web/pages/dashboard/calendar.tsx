import React from "react";
import RenderCalendarCard from "../components/customCalendar";
import EventCarousel from "../components/eventCarousel";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

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
        width: "55vw",
        maxWidth: "1200px",
        minWidth: "320px",
        margin: "0 auto",
        fontFamily: "Segoe UI, sans-serif",
        border: "1px solid #E5E7EB",
        boxSizing: "border-box",
      }}
    >
      <RenderCalendarCard height={600} isCalendarPage={false} events={events} accountColor={accountColor} />
      {/* <EventCarousel events={events} /> */}
      <div
        style={{
          marginTop: '20px',
          padding: '6px',
          background: '#f8fafc',
          borderRadius: '16px',
          border: '2px dashed #cbd5e1',
          width: '800px',
          marginLeft: '10px'
        }}
      >
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}>
          <input
            type="text"
            placeholder="Add an event in natural language (e.g., 'Dinner with Sarah tomorrow at 7pm')"
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              background: 'white',
            }}
          />
          <button
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarEventWidget;

