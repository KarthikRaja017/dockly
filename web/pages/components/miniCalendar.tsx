'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface Event {
    id: string;
    title: string;
    startTime: string;
    date: string;
    person: string;
    color: string;
}

interface MiniCalendarProps {
    currentDate?: Date;
    onDateSelect: (date: Date) => void;
    events?: Event[];
    view: 'Day' | 'Week' | 'Month' | 'Year';
    onMonthChange?: (date: Date) => void;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({
    currentDate = new Date(),
    onDateSelect,
    events = [],
    view,
    onMonthChange,
}) => {
    const [displayDate, setDisplayDate] = useState<Date>(new Date(currentDate));

    useEffect(() => {
        setDisplayDate(new Date(currentDate));
    }, [currentDate]);

    const formatDateString = (date: Date): string => {
        return `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    };

    const getMonthDays = (date: Date): Date[] => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days: Date[] = [];
        const current = new Date(startDate);

        while (current <= lastDay || current.getDay() !== 0 || days.length < 35) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return days;
    };

    const monthDays = getMonthDays(displayDate);
    const totalRows = Math.ceil(monthDays.length / 7); // number of weeks in the month
    const cellHeight = Math.floor((350 - 100) / totalRows); // 60px reserved for header + weekdays

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(displayDate);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setDisplayDate(newDate);
        onMonthChange?.(newDate);
    };

    const getEventsForDate = (date: Date) =>
        events.filter(event => event.date === formatDateString(date));

    const isCurrentMonth = (date: Date) => date.getMonth() === displayDate.getMonth();
    const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
    const isSelected = (date: Date) =>
        currentDate && date.toDateString() === currentDate.toDateString();
    const isPastDate = (date: Date) => date < new Date() && !isToday(date);

    return (
        <div
            style={{
                background: 'white',
                borderRadius: '14px',
                padding: '12px',
                border: '1px solid rgba(229, 231, 235, 0.5)',
                backdropFilter: 'blur(10px)',
                maxWidth: '450px',
                height: '350px',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
            }}>
                <button onClick={() => navigateMonth('prev')} style={navBtnStyle}>
                    <ChevronLeft size={14} />
                </button>
                <div style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#1f2937'
                }}>
                    <Calendar size={14} />
                    {displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={() => navigateMonth('next')} style={navBtnStyle}>
                    <ChevronRight size={14} />
                </button>
            </div>

            {/* Weekdays */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                fontSize: '11px',
                color: '#6b7280',
                marginBottom: '4px',
                textAlign: 'center',
                fontWeight: 600,
            }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={`${d}-${i}`} style={{ color: i === 0 || i === 6 ? '#ef4444' : undefined }}>{d}</div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '4px',
                flexGrow: 1,
            }}>
                {monthDays.map((date, idx) => {
                    const eventsToday = getEventsForDate(date);
                    const isCurrent = isCurrentMonth(date);
                    const selected = isSelected(date);
                    const today = isToday(date);
                    const past = isPastDate(date);

                    return (
                        <div
                            key={idx}
                            onClick={() => isCurrent && !past && onDateSelect(date)}
                            style={{
                                position: 'relative',
                                height: `${cellHeight}px`,
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px',
                                fontWeight: today ? 700 : 500,
                                cursor: isCurrent && !past ? 'pointer' : 'default',
                                background: selected
                                    ? 'linear-gradient(135deg, #3b82f6, #60a5fa)'
                                    : today
                                        ? '#dbeafe'
                                        : 'transparent',
                                color: selected
                                    ? '#fff'
                                    : today
                                        ? '#1e3a8a'
                                        : past
                                            ? '#9ca3af'
                                            : isCurrent
                                                ? '#111827'
                                                : '#d1d5db',
                                border: today && !selected ? '1px solid #3b82f6' : 'none',
                                transition: 'all 0.2s ease-in-out',
                            }}
                            onMouseEnter={(e) => {
                                if (isCurrent && !past && !selected) {
                                    (e.currentTarget as HTMLDivElement).style.background = '#f3f4f6';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (isCurrent && !past && !selected) {
                                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                                }
                            }}
                        >
                            {date.getDate()}
                            {eventsToday.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '4px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    gap: '1px',
                                    maxWidth: '24px',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center'
                                }}>
                                    {eventsToday.slice(0, 2).map((event, i) => (
                                        <div key={i} style={{
                                            width: '4px',
                                            height: '4px',
                                            borderRadius: '50%',
                                            backgroundColor: selected ? '#fff' : event.color,
                                            boxShadow: `0 0 4px ${event.color}`,
                                            opacity: 0.9
                                        }} />
                                    ))}
                                    {eventsToday.length > 2 && (
                                        <div style={{
                                            width: '4px',
                                            height: '4px',
                                            borderRadius: '50%',
                                            backgroundColor: selected ? '#fff' : '#6b7280',
                                            opacity: 0.5
                                        }} />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const navBtnStyle: React.CSSProperties = {
    padding: '7px 8px',
    background: '#e0f2fe',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.3s ease-in-out',
    color: '#0284c7',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
};

export default MiniCalendar;
