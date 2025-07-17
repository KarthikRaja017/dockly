'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

// Professional color palette
const COLORS = {
    primary: '#1C1C1E',
    secondary: '#48484A',
    accent: '#007AFF',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    surfaceSecondary: '#F9F9FB',
    border: '#E5E5EA',
    borderLight: '#F1F1F5',
    text: '#1C1C1E',
    textSecondary: '#6D6D80',
    textTertiary: '#8E8E93',
    overlay: 'rgba(0, 0, 0, 0.4)',
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    shadowMedium: 'rgba(0, 0, 0, 0.1)',
    shadowHeavy: 'rgba(0, 0, 0, 0.15)',
};

const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

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
    const totalRows = Math.ceil(monthDays.length / 7);
    const cellHeight = Math.floor((300 - 100) / totalRows);

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
                background: COLORS.surface,
                borderRadius: '16px',
                padding: SPACING.md,
                border: `1px solid ${COLORS.borderLight}`,
                boxShadow: `0 2px 8px ${COLORS.shadowLight}`,
                maxWidth: '450px',
                height: '380px',
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
                marginBottom: SPACING.md,
                padding: `${SPACING.sm}px 0`,
            }}>
                <button
                    onClick={() => navigateMonth('prev')}
                    style={{
                        ...navBtnStyle,
                        background: COLORS.surfaceSecondary,
                        color: COLORS.textSecondary,
                        border: `1px solid ${COLORS.borderLight}`,
                    }}
                >
                    <ChevronLeft size={14} />
                </button>
                <div style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: SPACING.sm,
                    color: COLORS.text,
                }}>
                    <Calendar size={16} />
                    {displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <button
                    onClick={() => navigateMonth('next')}
                    style={{
                        ...navBtnStyle,
                        background: COLORS.surfaceSecondary,
                        color: COLORS.textSecondary,
                        border: `1px solid ${COLORS.borderLight}`,
                    }}
                >
                    <ChevronRight size={14} />
                </button>
            </div>

            {/* Weekdays */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                fontSize: '11px',
                color: COLORS.textSecondary,
                marginBottom: SPACING.sm,
                textAlign: 'center',
                fontWeight: 600,
                padding: `${SPACING.sm}px 0`,
                borderBottom: `1px solid ${COLORS.borderLight}`,
            }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div
                        key={`${d}-${i}`}
                        style={{
                            color: i === 0 || i === 6 ? COLORS.accent : COLORS.textSecondary,
                            fontWeight: 600,
                        }}
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: SPACING.xs,
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
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '10px',
                                fontWeight: today ? 700 : 500,
                                cursor: isCurrent && !past ? 'pointer' : 'default',
                                background: selected
                                    ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}dd)`
                                    : today
                                        ? `${COLORS.accent}10`
                                        : 'transparent',
                                color: selected
                                    ? COLORS.surface
                                    : today
                                        ? COLORS.accent
                                        : past
                                            ? COLORS.textTertiary
                                            : isCurrent
                                                ? COLORS.text
                                                : COLORS.textTertiary,
                                border: today && !selected ? `1px solid ${COLORS.accent}` : 'none',
                                transition: 'all 0.2s ease-in-out',
                                boxShadow: selected ? `0 2px 8px ${COLORS.accent}30` : 'none',
                            }}
                            onMouseEnter={(e) => {
                                if (isCurrent && !past && !selected) {
                                    (e.currentTarget as HTMLDivElement).style.background = COLORS.surfaceSecondary;
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
                                    bottom: SPACING.xs,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    gap: '1px',
                                    maxWidth: '24px',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center'
                                }}>
                                    {eventsToday.slice(0, 3).map((event, i) => (
                                        <div key={i} style={{
                                            width: '4px',
                                            height: '4px',
                                            borderRadius: '50%',
                                            backgroundColor: selected ? COLORS.surface : (event.color || COLORS.accent),
                                            boxShadow: `0 0 4px ${event.color || COLORS.accent}30`,
                                            opacity: 0.9
                                        }} />
                                    ))}
                                    {eventsToday.length > 3 && (
                                        <div style={{
                                            width: '4px',
                                            height: '4px',
                                            borderRadius: '50%',
                                            backgroundColor: selected ? COLORS.surface : COLORS.textSecondary,
                                            opacity: 0.7
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
    padding: '8px 10px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease-in-out',
    fontSize: '12px',
    fontWeight: 500,
};

export default MiniCalendar;