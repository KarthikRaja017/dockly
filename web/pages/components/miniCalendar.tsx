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
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({
    currentDate = new Date(),
    onDateSelect,
    events = [],
    view,
}) => {
    const [displayDate, setDisplayDate] = useState<Date>(new Date(currentDate));

    useEffect(() => {
        if (currentDate) setDisplayDate(new Date(currentDate));
    }, [currentDate]);

    const formatDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getMonthDays = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days: Date[] = [];
        const current = new Date(startDate);

        while (current <= lastDay || current.getDay() !== 0) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
            if (days.length >= 42) break;
        }

        return days;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(displayDate);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setDisplayDate(newDate);
    };

    const getEventsForDate = (date: Date): Event[] => {
        const dateStr = formatDateString(date);
        return events?.filter(event => event.date === dateStr) ?? [];
    };

    const isCurrentMonth = (date: Date) => date.getMonth() === displayDate.getMonth();
    const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
    const isSelected = (date: Date) =>
        currentDate && date.toDateString() === currentDate.toDateString();
    const isPastDate = (date: Date) => date < new Date() && !isToday(date);

    const monthDays = getMonthDays(displayDate);

    return (
        <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
            }}>
                <button onClick={() => navigateMonth('prev')} style={btnStyle}><ChevronLeft size={14} /></button>
                <div style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} />
                    {displayDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
                <button onClick={() => navigateMonth('next')} style={btnStyle}><ChevronRight size={14} /></button>
            </div>

            {/* Weekdays */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                fontSize: '11px',
                color: '#6b7280',
                marginBottom: '4px'
            }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} style={{ textAlign: 'center' }}>{d}</div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '1px'
            }}>
                {monthDays.map((date, idx) => {
                    const dayEvents = getEventsForDate(date);
                    const isCurrent = isCurrentMonth(date);
                    const today = isToday(date);
                    const selected = isSelected(date);
                    const past = isPastDate(date);

                    return (
                        <div
                            key={idx}
                            onClick={() => (isCurrent && !past) && onDateSelect(date)}
                            style={{
                                position: 'relative',
                                height: '45px',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                                fontWeight: today ? 600 : 400,
                                cursor: (isCurrent && !past) ? 'pointer' : 'default',
                                background: selected
                                    ? '#3b82f6'
                                    : today
                                        ? '#eff6ff'
                                        : 'transparent',
                                color: selected
                                    ? '#fff'
                                    : today
                                        ? '#2563eb'
                                        : past
                                            ? '#9ca3af'
                                            : isCurrent
                                                ? '#111827'
                                                : '#d1d5db',
                                opacity: isCurrent ? 1 : 0.5,
                                border: today && !selected ? '1px solid #3b82f6' : 'none'
                            }}
                        >
                            {date.getDate()}
                            {dayEvents.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '2px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    gap: '1px',
                                    maxWidth: '25px',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center'
                                }}>
                                    {dayEvents.slice(0, 2).map((event, i) => (
                                        <div key={i} style={{
                                            width: '3px',
                                            height: '3px',
                                            borderRadius: '50%',
                                            backgroundColor: selected ? 'white' : event.color,
                                            opacity: 0.9
                                        }} />
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <div style={{
                                            width: '3px',
                                            height: '3px',
                                            borderRadius: '50%',
                                            backgroundColor: selected ? 'white' : '#6b7280',
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

const btnStyle: React.CSSProperties = {
    padding: '4px',
    background: '#f1f5f9',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

export default MiniCalendar;
