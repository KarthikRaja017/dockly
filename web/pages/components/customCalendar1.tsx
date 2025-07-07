import React, { useState } from "react";
import { ArrowRight, ArrowUpRightFromSquareIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import customCalendar from "../dashboard/calendar";
import { Tooltip, Typography } from "antd";
import { ACTIVE_BG_COLOR, capitalizeEachWord, PRIMARY_COLOR } from "../../app/comman";

interface Event {
    id: string;
    title: string;
    startTime: string;
    date: string;
    person: string;
    color: string;
}

interface Meal {
    id: string;
    name: string;
    emoji: string;
    date: string;
}

export interface CalendarData {
    events: Event[];
    meals: Meal[];
}

interface CalendarProps {
    data: CalendarData;
    onAddEvent?: (event: Omit<Event, "id">) => void;
    onEventClick?: (event: Event) => void;
    personColors?: { [person: string]: { color: string; email: string } };
}


export const sampleCalendarData: CalendarData = {
    events: [
        // June 8, 2025 (Sunday)
        {
            id: '1',
            title: 'Family Brunch',
            startTime: '10:00 AM',
            date: '2025-06-08',
            person: 'Family',
            color: '#10B981',
        },
        {
            id: '2',
            title: 'Emma - Soccer Practice',
            startTime: '2:00 PM',
            date: '2025-06-08',
            person: 'Emma',
            color: '#EC4899',
        },

        // June 9, 2025 (Monday)
        {
            id: '3',
            title: 'John - Team Meeting',
            startTime: '9:00 AM',
            date: '2025-06-09',
            person: 'John',
            color: '#3B82F6',
        },
        {
            id: '4',
            title: 'Liam - Piano Lesson',
            startTime: '3:30 PM',
            date: '2025-06-09',
            person: 'Liam',
            color: '#F59E0B',
        },
        {
            id: '5',
            title: 'Sarah - Book Club',
            startTime: '7:00 PM',
            date: '2025-06-09',
            person: 'Sarah',
            color: '#8B5CF6',
        },

        // June 10, 2025 (Tuesday)
        {
            id: '6',
            title: 'Liam - Dentist',
            startTime: '2:00 PM',
            date: '2025-06-10',
            person: 'Liam',
            color: '#F59E0B',
        },
        {
            id: '7',
            title: 'Emma - Math Tutoring',
            startTime: '4:00 PM',
            date: '2025-06-10',
            person: 'Emma',
            color: '#EC4899',
        },

        // June 11, 2025 (Wednesday)
        {
            id: '8',
            title: 'Family Game Night',
            startTime: '6:30 PM',
            date: '2025-06-11',
            person: 'Family',
            color: '#10B981',
        },

        // June 12, 2025 (Thursday)
        {
            id: '9',
            title: 'Sarah - Doctor Appt',
            startTime: '10:00 AM',
            date: '2025-06-12',
            person: 'Sarah',
            color: '#8B5CF6',
        },
        {
            id: '10',
            title: 'Emma - School Play',
            startTime: '7:00 PM',
            date: '2025-06-12',
            person: 'Emma',
            color: '#EC4899',
        },

        // June 13, 2025 (Friday)
        {
            id: '11',
            title: 'John - Presentation',
            startTime: '2:00 PM',
            date: '2025-06-13',
            person: 'John',
            color: '#3B82F6',
        },
        {
            id: '12',
            title: 'Movie Night',
            startTime: '7:00 PM',
            date: '2025-06-13',
            person: 'Family',
            color: '#10B981',
        },

        // June 14, 2025 (Saturday)
        {
            id: '13',
            title: 'Farmers Market',
            startTime: '9:00 AM',
            date: '2025-06-14',
            person: 'Family',
            color: '#10B981',
        },
        {
            id: '14',
            title: 'Liam - Soccer Game',
            startTime: '11:00 AM',
            date: '2025-06-14',
            person: 'Liam',
            color: '#F59E0B',
        },
        {
            id: '15',
            title: 'BBQ with Neighbors',
            startTime: '6:00 PM',
            date: '2025-06-14',
            person: 'Family',
            color: '#10B981',
        },

        // Additional events for other weeks/months
        {
            id: '16',
            title: 'Sarah - Yoga Class',
            startTime: '7:00 AM',
            date: '2025-06-15',
            person: 'Sarah',
            color: '#8B5CF6',
        },
        {
            id: '17',
            title: 'John - Golf',
            startTime: '8:00 AM',
            date: '2025-06-15',
            person: 'John',
            color: '#3B82F6',
        },
        {
            id: '18',
            title: 'Family Picnic',
            startTime: '12:00 PM',
            date: '2025-06-15',
            person: 'Family',
            color: '#10B981',
        },
    ],
    meals: [
        // June 8, 2025
        {
            id: 'm1',
            name: 'Pancakes & Eggs',
            emoji: '🥞',
            date: '2025-06-08',
        },
        {
            id: 'm2',
            name: 'Pizza Night',
            emoji: '🍕',
            date: '2025-06-08',
        },

        // June 9, 2025
        {
            id: 'm3',
            name: 'Spaghetti Bolognese',
            emoji: '🍝',
            date: '2025-06-09',
        },

        // June 10, 2025
        {
            id: 'm4',
            name: 'Taco Tuesday',
            emoji: '🌮',
            date: '2025-06-10',
        },

        // June 11, 2025
        {
            id: 'm5',
            name: 'Grilled Chicken',
            emoji: '🍗',
            date: '2025-06-11',
        },
        {
            id: 'm6',
            name: 'Caesar Salad',
            emoji: '🥗',
            date: '2025-06-11',
        },

        // June 12, 2025
        {
            id: 'm7',
            name: 'Slow Cooker Stew',
            emoji: '🍲',
            date: '2025-06-12',
        },

        // June 13, 2025
        {
            id: 'm8',
            name: 'Pizza Friday',
            emoji: '🍕',
            date: '2025-06-13',
        },

        // June 14, 2025
        {
            id: 'm9',
            name: 'BBQ Burgers',
            emoji: '🍔',
            date: '2025-06-14',
        },

        // June 15, 2025
        {
            id: 'm10',
            name: 'Sunday Roast',
            emoji: '🍖',
            date: '2025-06-15',
        },
    ],
};

const { Title, Text, Paragraph } = Typography;


const CustomCalendar: React.FC<CalendarProps> = ({
    data,
    onAddEvent,
    onEventClick,
    personColors = {}
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<"Day" | "Week" | "Month" | "Year">("Week");
    const [newEventText, setNewEventText] = useState("");
    const [isNavigating, setIsNavigating] = useState(false);
    const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

    const finalData =
        data?.events.length > 0 || data?.meals.length > 0 ? data : sampleCalendarData;
    if (!data?.events) return null;
    // Natural Language Processing for event parsing
    const parseEventText = (text: string) => {
        const today = new Date();
        let eventDate = new Date(today);
        let eventTime = "12:00 PM";
        let eventTitle = text;
        let eventPerson = "Family";

        // Clean the text
        const cleanText = text.toLowerCase().trim();

        // Extract person names
        const personNames = Object.keys(personColors).map((p) => p.toLowerCase());
        for (const person of personNames) {
            if (cleanText.includes(person.toLowerCase())) {
                eventPerson = person.charAt(0).toUpperCase() + person.slice(1);
                break;
            }
        }

        // Extract time patterns
        const timePatterns = [
            /(\d{1,2}):(\d{2})\s*(am|pm)/i,
            /(\d{1,2})\s*(am|pm)/i,
            /at\s+(\d{1,2}):(\d{2})\s*(am|pm)/i,
            /at\s+(\d{1,2})\s*(am|pm)/i,
            /@\s*(\d{1,2}):(\d{2})\s*(am|pm)/i,
            /@\s*(\d{1,2})\s*(am|pm)/i,
        ];

        for (const pattern of timePatterns) {
            const match = cleanText.match(pattern);
            if (match) {
                let hours = parseInt(match[1]);
                const minutes = match[2] ? parseInt(match[2]) : 0;
                const period = match[3] || match[2];

                if (period && period.toLowerCase() === "pm" && hours !== 12) {
                    hours += 12;
                } else if (period && period.toLowerCase() === "am" && hours === 12) {
                    hours = 0;
                }

                eventTime = `${hours > 12 ? hours - 12 : hours || 12}:${minutes
                    .toString()
                    .padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
                break;
            }
        }

        // Extract date patterns
        const datePatterns = [
            {
                pattern:
                    /\b(next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
                type: "weekday",
            },
            { pattern: /\b(tomorrow)\b/i, type: "tomorrow" },
            { pattern: /\b(today)\b/i, type: "today" },
            { pattern: /\b(next\s+week)\b/i, type: "next_week" },
            { pattern: /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/, type: "date" },
            { pattern: /\b(\d{1,2})\/(\d{1,2})\b/, type: "short_date" },
            {
                pattern:
                    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})\b/i,
                type: "month_day",
            },
        ];

        for (const { pattern, type } of datePatterns) {
            const match = cleanText.match(pattern);
            if (match) {
                switch (type) {
                    case "weekday": {
                        const weekdays = [
                            "sunday",
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                            "saturday",
                        ];
                        const targetDay = weekdays.indexOf(match[2].toLowerCase());
                        const currentDay = today.getDay();
                        const isNext = match[1] && match[1].toLowerCase().includes("next");

                        let daysToAdd = targetDay - currentDay;
                        if (daysToAdd <= 0 || isNext) {
                            daysToAdd += 7;
                        }

                        eventDate = new Date(today);
                        eventDate.setDate(today.getDate() + daysToAdd);
                        break;
                    }

                    case "tomorrow":
                        eventDate = new Date(today);
                        eventDate.setDate(today.getDate() + 1);
                        break;

                    case "today":
                        eventDate = new Date(today);
                        break;

                    case "next_week":
                        eventDate = new Date(today);
                        eventDate.setDate(today.getDate() + 7);
                        break;

                    case "date":
                        eventDate = new Date(
                            parseInt(match[3]),
                            parseInt(match[1]) - 1,
                            parseInt(match[2])
                        );
                        break;

                    case "short_date":
                        eventDate = new Date(
                            today.getFullYear(),
                            parseInt(match[1]) - 1,
                            parseInt(match[2])
                        );
                        break;

                    case "month_day": {
                        const months = [
                            "january",
                            "february",
                            "march",
                            "april",
                            "may",
                            "june",
                            "july",
                            "august",
                            "september",
                            "october",
                            "november",
                            "december",
                        ];
                        const monthIndex = months.indexOf(match[1].toLowerCase());
                        eventDate = new Date(
                            today.getFullYear(),
                            monthIndex,
                            parseInt(match[2])
                        );
                        break;
                    }
                }
                break;
            }
        }

        // Clean title by removing parsed elements
        eventTitle = text
            .replace(
                /\b(next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
                ""
            )
            .replace(/\b(tomorrow|today|next\s+week)\b/gi, "")
            .replace(/(\d{1,2}):(\d{2})\s*(am|pm)/gi, "")
            .replace(/(\d{1,2})\s*(am|pm)/gi, "")
            .replace(/at\s+(\d{1,2}):(\d{2})\s*(am|pm)/gi, "")
            .replace(/at\s+(\d{1,2})\s*(am|pm)/gi, "")
            .replace(/@\s*(\d{1,2}):(\d{2})\s*(am|pm)/gi, "")
            .replace(/@\s*(\d{1,2})\s*(am|pm)/gi, "")
            .replace(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g, "")
            .replace(/\b(\d{1,2})\/(\d{1,2})\b/g, "")
            .replace(
                /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})\b/gi,
                ""
            )
            .replace(/\b(for|with)\s+(john|sarah|emma|liam|family)\b/gi, "")
            .replace(/\s+/g, " ")
            .trim();

        const colorObj =
            personColors[eventPerson as keyof typeof personColors] ||
            personColors.Family;
        return {
            title: eventTitle || "New Event",
            startTime: eventTime,
            date: eventDate.toISOString().split("T")[0],
            person: eventPerson,
            color: colorObj && typeof colorObj === "object" ? colorObj.color : "#10B981",
        };
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
    };

    const getWeekDays = (date: Date) => {
        const week = [];
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - day);

        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + i);
            week.push(currentDay);
        }
        return week;
    };

    const getMonthDays = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const current = new Date(startDate);

        while (current <= lastDay || current.getDay() !== 0) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
            if (days.length >= 42) break;
        }

        return days;
    };

    const navigateDate = (direction: "prev" | "next") => {
        setIsNavigating(true);
        const newDate = new Date(currentDate);

        switch (view) {
            case "Day":
                newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
                break;
            case "Week":
                newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
                break;
            case "Month":
                newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
                break;
            case "Year":
                newDate.setFullYear(
                    newDate.getFullYear() + (direction === "next" ? 1 : -1)
                );
                break;
        }

        setTimeout(() => {
            setCurrentDate(newDate);
            setIsNavigating(false);
        }, 150);
    };

    const getEventsForDate = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0];
        return finalData.events.filter((event) => event.date === dateStr);
    };

    const getMealsForDate = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0];
        return finalData.meals.filter((meal) => meal.date === dateStr);
    };

    const handleAddEvent = () => {
        if (newEventText.trim() && onAddEvent) {
            const parsedEvent = parseEventText(newEventText);
            onAddEvent(parsedEvent);
            setNewEventText("");
        }
    };

    // Consistent Event Card Component
    const EventCard = ({
        event,
        size = "normal",
        showTime = true,
        onClick,
    }: {
        event: Event;
        size?: "small" | "normal" | "large";
        showTime?: boolean;
        onClick?: () => void;
    }) => {
        const sizeStyles = {
            small: {
                padding: "6px 8px",
                fontSize: "10px",
                borderRadius: "4px",
                borderLeftWidth: "3px",
            },
            normal: {
                padding: "12px",
                fontSize: "13px",
                borderRadius: "8px",
                borderLeftWidth: "4px",
            },
            large: {
                padding: "16px 20px",
                fontSize: "16px",
                borderRadius: "12px",
                borderLeftWidth: "6px",
            },
        };

        return (
            <div
                onClick={onClick}
                onMouseEnter={() => setHoveredEvent(event.id)}
                onMouseLeave={() => setHoveredEvent(null)}
                style={{
                    backgroundColor: event.color + "20",
                    borderLeft: `${sizeStyles[size].borderLeftWidth} solid ${event.color}`,
                    ...sizeStyles[size],
                    cursor: "pointer",
                    lineHeight: "1.4",
                    transform: hoveredEvent === event.id ? "scale(1.02)" : "scale(1)",
                    boxShadow:
                        hoveredEvent === event.id ? `0 4px 12px ${event.color}40` : "none",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    marginBottom: size === "small" ? "4px" : "8px",
                }}
            >
                {showTime && (
                    <div
                        style={{
                            fontWeight: "700",
                            color: event.color,
                            marginBottom: size === "small" ? "2px" : "4px",
                            fontSize: size === "small" ? "9px" : sizeStyles[size].fontSize,
                        }}
                    >
                        {event.startTime}
                    </div>
                )}
                <div
                    style={{
                        color: "#374151",
                        fontWeight: "500",
                        fontSize: sizeStyles[size].fontSize,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: size === "small" ? "nowrap" : "normal",
                    }}
                >
                    {event.title}
                </div>
                {hoveredEvent === event.id && (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(45deg, ${event.color}10, ${event.color}05)`,
                            pointerEvents: "none",
                        }}
                    />
                )}
            </div>
        );
    };

    // Consistent Day Card Component
    const DayCard = ({
        date,
        events,
        meals,
        isCurrentMonth = true,
        showMeals = true,
        compactMode = false,
    }: {
        date: Date;
        events: Event[];
        meals: Meal[];
        isCurrentMonth?: boolean;
        showMeals?: boolean;
        compactMode?: boolean;
    }) => {
        const isToday = date.toDateString() === new Date().toDateString();

        return (
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: compactMode ? "8px" : "12px",
                    padding: compactMode ? "8px" : "16px",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    flexDirection: "column",
                    height: compactMode ? "140px" : "420px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    opacity: isCurrentMonth ? 1 : 0.4,
                }}
                onMouseEnter={(e) => {
                    if (isCurrentMonth) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)";
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
                }}
            >
                {/* Date Header */}
                <div
                    style={{
                        fontSize: compactMode ? "14px" : "24px",
                        fontWeight: isToday ? "700" : "600",
                        color: isToday ? "#3B82F6" : "#111827",
                        marginBottom: compactMode ? "6px" : "12px",
                        transition: "color 0.2s ease",
                    }}
                >
                    {date.getDate()}
                </div>

                {/* Events */}
                <div
                    style={{
                        flex: 1,
                        marginBottom: showMeals && meals.length > 0 ? "12px" : "0",
                        overflowY: "auto",
                        scrollbarWidth: "thin",
                        scrollbarColor: "#e5e7eb transparent",
                        paddingRight: "4px",
                    }}
                >
                    {events.slice(0, compactMode ? 2 : 6).map((event, eventIndex) => (
                        <div
                            key={event.id}
                            style={{
                                animation: `slideInUp 0.3s ease ${eventIndex * 0.1}s both`,
                            }}
                        >
                            <EventCard
                                event={event}
                                size="small"
                                showTime={!compactMode}
                                onClick={() => onEventClick?.(event)}
                            />
                        </div>
                    ))}
                    {events.length > (compactMode ? 2 : 6) && (
                        <div
                            style={{
                                fontSize: "10px",
                                color: "#6b7280",
                                padding: "3px 6px",
                                fontWeight: "500",
                                animation: "pulse 2s infinite",
                            }}
                        >
                            +{events.length - (compactMode ? 2 : 6)} more
                        </div>
                    )}
                </div>

                {showMeals && meals.length > 0 && (
                    <div
                        style={{
                            borderTop: "1px solid #f3f4f6",
                            paddingTop: "8px",
                            maxHeight: "60px",
                            overflowY: "auto",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "9px",
                                fontWeight: "700",
                                color: "#6b7280",
                                marginBottom: "4px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                            }}
                        >
                            MEALS
                        </div>
                        {meals.slice(0, 2).map((meal, mealIndex) => (
                            <div
                                key={meal.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontSize: "10px",
                                    color: "#6b7280",
                                    marginBottom: "4px",
                                    animation: `fadeInLeft 0.4s ease ${mealIndex * 0.1}s both`,
                                }}
                            >
                                <span style={{ fontSize: "12px" }}>{meal.emoji}</span>
                                <span style={{ fontWeight: "500" }}>{meal.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderWeekView = () => {
        const weekDays = getWeekDays(currentDate);

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "700px",
                    opacity: isNavigating ? 0.7 : 1,
                    transform: isNavigating ? "translateX(10px)" : "translateX(0)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                {/* Week Header */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "2px",
                        backgroundColor: "#e5e7eb",
                        borderRadius: "16px",
                        overflow: "hidden",
                        marginBottom: "20px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    }}
                >
                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
                        (day, index) => {
                            const isToday = weekDays[index].toDateString() === new Date().toDateString();
                            return (
                                <div
                                    key={day}
                                    style={{
                                        padding: "20px 12px",
                                        backgroundColor: isToday ? "#3B82F6" : "white",
                                        textAlign: "center",
                                        fontWeight: "600",
                                        color: isToday ? "white" : "#6b7280",
                                        fontSize: "13px",
                                        letterSpacing: "0.8px",
                                        position: "relative",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    <div style={{ marginBottom: "6px" }}>{day}</div>
                                    <div
                                        style={{
                                            fontSize: "24px",
                                            fontWeight: "800",
                                            color: isToday ? "white" : "#111827",
                                        }}
                                    >
                                        {weekDays[index].getDate()}
                                    </div>
                                    {isToday && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                bottom: "4px",
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                width: "6px",
                                                height: "6px",
                                                backgroundColor: "white",
                                                borderRadius: "50%",
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        }
                    )}
                </div>

                {/* Events Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "12px",
                        flex: 1,
                        overflow: "hidden",
                    }}
                >
                    {weekDays.map((day, index) => {
                        const dayEvents = getEventsForDate(day);
                        const dayMeals = getMealsForDate(day);
                        const hasContent = dayEvents.length > 0 || dayMeals.length > 0;

                        return (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "6px",
                                    minHeight: "450px",
                                    backgroundColor: hasContent ? "transparent" : "#fafafa",
                                    borderRadius: "12px",
                                    border: hasContent ? "none" : "2px dashed #d1d5db",
                                    padding: hasContent ? "0" : "16px",
                                    position: "relative",
                                    transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                    if (!hasContent) {
                                        e.currentTarget.style.borderColor = "#9ca3af";
                                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!hasContent) {
                                        e.currentTarget.style.borderColor = "#d1d5db";
                                        e.currentTarget.style.backgroundColor = "#fafafa";
                                    }
                                }}
                            >
                                {/* Empty State */}
                                {!hasContent && (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: "100%",
                                            color: "#9ca3af",
                                            textAlign: "center",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "48px",
                                                height: "48px",
                                                backgroundColor: "#f3f4f6",
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                marginBottom: "12px",
                                                transition: "all 0.2s ease",
                                            }}
                                        >
                                            <Plus size={20} color="#9ca3af" />
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "14px",
                                                fontWeight: "500",
                                                marginBottom: "4px",
                                            }}
                                        >
                                            No events
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "12px",
                                                color: "#d1d5db",
                                            }}
                                        >
                                            Click to add
                                        </div>
                                    </div>
                                )}

                                {/* Events */}
                                {dayEvents.map((event, eventIndex) => (
                                    <div
                                        key={event.id}
                                        style={{
                                            backgroundColor: event.color,
                                            color: "white",
                                            padding: "12px 10px",
                                            borderRadius: "10px",
                                            fontSize: "12px",
                                            fontWeight: "500",
                                            lineHeight: "1.3",
                                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                            cursor: "pointer",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            position: "relative",
                                            overflow: "hidden",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                                            e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0) scale(1)";
                                            e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                                        }}
                                    >
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: "3px",
                                                backgroundColor: "rgba(255, 255, 255, 0.3)",
                                            }}
                                        />
                                        <div style={{ fontWeight: "700", marginBottom: "4px", fontSize: "11px" }}>
                                            {event.startTime}
                                        </div>
                                        <div style={{ fontWeight: "600" }}>{event.title}</div>
                                    </div>
                                ))}

                                {/* Meals Section */}
                                {dayMeals.length > 0 && (
                                    <div
                                        style={{
                                            marginTop: "auto",
                                            padding: "12px",
                                            backgroundColor: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                                            borderRadius: "12px",
                                            border: "1px solid #e2e8f0",
                                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: "700",
                                                color: "#64748b",
                                                marginBottom: "8px",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.8px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px",
                                            }}
                                        >
                                            <span>🍽️</span>
                                            MEALS
                                        </div>
                                        {dayMeals.map((meal) => (
                                            <div
                                                key={meal.id}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                    fontSize: "12px",
                                                    color: "#475569",
                                                    marginBottom: "4px",
                                                    padding: "4px 0",
                                                    fontWeight: "500",
                                                }}
                                            >
                                                <span style={{ fontSize: "16px" }}>{meal.emoji}</span>
                                                <span>{meal.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const monthDays = getMonthDays(currentDate);
        const currentMonth = currentDate.getMonth();

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    opacity: isNavigating ? 0.7 : 1,
                    transform: isNavigating ? "scale(0.98)" : "scale(1)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                {/* Month Header */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "1px",
                        backgroundColor: "#f3f4f6",
                        borderRadius: "12px",
                        overflow: "hidden",
                        marginBottom: "12px",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                    }}
                >
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div
                            key={day}
                            style={{
                                padding: "12px",
                                backgroundColor: "white",
                                textAlign: "center",
                                fontWeight: "600",
                                color: "#6b7280",
                                fontSize: "12px",
                                letterSpacing: "0.3px",
                            }}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Month Grid with Scroll */}
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        scrollbarWidth: "thin",
                        scrollbarColor: "#e5e7eb transparent",
                        paddingRight: "4px",
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7, 1fr)",
                            gap: "4px",
                            minHeight: "fit-content",
                        }}
                    >
                        {monthDays.map((day, index) => {
                            const dayEvents = getEventsForDate(day);
                            const dayMeals = getMealsForDate(day);
                            const isCurrentMonth = day.getMonth() === currentMonth;

                            return (
                                <DayCard
                                    key={index}
                                    date={day}
                                    events={dayEvents}
                                    meals={dayMeals}
                                    isCurrentMonth={isCurrentMonth}
                                    showMeals={false}
                                    compactMode={true}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        const dayEvents = getEventsForDate(currentDate);
        const dayMeals = getMealsForDate(currentDate);

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    opacity: isNavigating ? 0.7 : 1,
                    transform: isNavigating ? "translateY(10px)" : "translateY(0)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <div
                    style={{
                        textAlign: "center",
                        padding: "20px",
                        backgroundColor: "white",
                        borderRadius: "16px",
                        marginBottom: "16px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        // background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        background: "#3b82f6",
                        color: "white",
                    }}
                >
                    <div
                        style={{
                            fontSize: "24px",
                            fontWeight: "700",
                            animation: "fadeInDown 0.6s ease",
                        }}
                    >
                        {currentDate.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </div>
                </div>

                <div
                    style={{ display: "flex", gap: "16px", flex: 1, overflow: "hidden" }}
                >
                    {/* Events */}
                    <div style={{ flex: 2 }}>
                        <div
                            style={{
                                backgroundColor: "white",
                                borderRadius: "16px",
                                padding: "20px",
                                border: "1px solid #e5e7eb",
                                height: "100%",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <h3
                                style={{
                                    margin: "0 0 16px 0",
                                    fontSize: "20px",
                                    fontWeight: "700",
                                    color: "#111827",
                                    animation: "slideInLeft 0.5s ease",
                                }}
                            >
                                Events
                            </h3>
                            <div
                                style={{
                                    flex: 1,
                                    overflowY: "auto",
                                    scrollbarWidth: "thin",
                                    scrollbarColor: "#e5e7eb transparent",
                                    paddingRight: "8px",
                                }}
                            >
                                {dayEvents.length === 0 ? (
                                    <p
                                        style={{
                                            color: "#6b7280",
                                            fontStyle: "italic",
                                            fontSize: "14px",
                                            textAlign: "center",
                                            padding: "40px",
                                            animation: "fadeIn 0.5s ease",
                                        }}
                                    >
                                        No events scheduled
                                    </p>
                                ) : (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "12px",
                                        }}
                                    >
                                        {dayEvents.map((event, index) => (
                                            <div
                                                key={event.id}
                                                style={{
                                                    animation: `slideInUp 0.5s ease ${index * 0.1}s both`,
                                                }}
                                            >
                                                <EventCard
                                                    event={event}
                                                    size="normal"
                                                    onClick={() => onEventClick?.(event)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1 }}>
                        <div
                            style={{
                                backgroundColor: "white",
                                borderRadius: "16px",
                                padding: "20px",
                                border: "1px solid #e5e7eb",
                                height: "100%",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <h3
                                style={{
                                    margin: "0 0 16px 0",
                                    fontSize: "20px",
                                    fontWeight: "700",
                                    color: "#111827",
                                    animation: "slideInRight 0.5s ease",
                                }}
                            >
                                Meals
                            </h3>
                            <div
                                style={{
                                    flex: 1,
                                    overflowY: "auto",
                                    scrollbarWidth: "thin",
                                    scrollbarColor: "#e5e7eb transparent",
                                    paddingRight: "8px",
                                }}
                            >
                                {dayMeals.length === 0 ? (
                                    <p
                                        style={{
                                            color: "#6b7280",
                                            fontStyle: "italic",
                                            fontSize: "14px",
                                            textAlign: "center",
                                            padding: "40px",
                                            animation: "fadeIn 0.5s ease",
                                        }}
                                    >
                                        No meals planned
                                    </p>
                                ) : (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "8px",
                                        }}
                                    >
                                        {dayMeals.map((meal, index) => (
                                            <div
                                                key={meal.id}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "12px",
                                                    padding: "12px",
                                                    backgroundColor: "#f9fafb",
                                                    borderRadius: "12px",
                                                    transition: "all 0.3s ease",
                                                    animation: `slideInRight 0.5s ease ${index * 0.1
                                                        }s both`,
                                                    cursor: "pointer",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                                                    e.currentTarget.style.transform = "translateX(4px)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = "#f9fafb";
                                                    e.currentTarget.style.transform = "translateX(0)";
                                                }}
                                            >
                                                <span style={{ fontSize: "20px" }}>{meal.emoji}</span>
                                                <span
                                                    style={{
                                                        fontSize: "14px",
                                                        color: "#374151",
                                                        fontWeight: "500",
                                                    }}
                                                >
                                                    {meal.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderYearView = () => {
        const currentYear = currentDate.getFullYear();
        const months = [];

        for (let i = 0; i < 12; i++) {
            months.push(new Date(currentYear, i, 1));
        }

        return (
            <div
                style={{
                    height: "100%",
                    opacity: isNavigating ? 0.7 : 1,
                    transform: isNavigating ? "scale(0.95)" : "scale(1)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#e5e7eb transparent",
                    paddingRight: "8px",
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "16px",
                        padding: "8px",
                    }}
                >
                    {months.map((month, index) => {
                        const monthDays = getMonthDays(month);
                        const monthEvents = finalData.events.filter((event) => {
                            const eventDate = new Date(event.date);
                            return (
                                eventDate.getFullYear() === currentYear &&
                                eventDate.getMonth() === index
                            );
                        });

                        return (
                            <div
                                key={index}
                                style={{
                                    backgroundColor: "white",
                                    borderRadius: "16px",
                                    padding: "16px",
                                    border: "1px solid #e5e7eb",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    animation: `fadeInUp 0.6s ease ${index * 0.05}s both`,
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                        "translateY(-4px) scale(1.02)";
                                    e.currentTarget.style.boxShadow =
                                        "0 12px 25px rgba(0, 0, 0, 0.15)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                                    e.currentTarget.style.boxShadow =
                                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                                }}
                            >
                                <div
                                    style={{
                                        textAlign: "center",
                                        fontWeight: "700",
                                        marginBottom: "12px",
                                        color: "#111827",
                                        fontSize: "16px",
                                    }}
                                >
                                    {month.toLocaleDateString("en-US", { month: "long" })}
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(7, 1fr)",
                                        gap: "2px",
                                        fontSize: "11px",
                                    }}
                                >
                                    {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                                        <div
                                            key={day}
                                            style={{
                                                textAlign: "center",
                                                fontWeight: "600",
                                                color: "#6b7280",
                                                padding: "4px",
                                            }}
                                        >
                                            {day}
                                        </div>
                                    ))}

                                    {monthDays.slice(0, 35).map((day, dayIndex) => {
                                        const dayEvents = getEventsForDate(day);
                                        const isCurrentMonth = day.getMonth() === index;
                                        const isToday =
                                            day.toDateString() === new Date().toDateString();

                                        return (
                                            <div
                                                key={dayIndex}
                                                style={{
                                                    textAlign: "center",
                                                    padding: "4px",
                                                    backgroundColor:
                                                        dayEvents.length > 0 ? "#dbeafe" : "transparent",
                                                    borderRadius: "4px",
                                                    opacity: isCurrentMonth ? 1 : 0.3,
                                                    fontWeight: isToday ? "700" : "400",
                                                    color: isToday ? "#3B82F6" : "#374151",
                                                    cursor: dayEvents.length > 0 ? "pointer" : "default",
                                                    transition: "all 0.2s ease",
                                                    position: "relative",
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (dayEvents.length > 0) {
                                                        e.currentTarget.style.backgroundColor = "#bfdbfe";
                                                        e.currentTarget.style.transform = "scale(1.1)";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (dayEvents.length > 0) {
                                                        e.currentTarget.style.backgroundColor = "#dbeafe";
                                                        e.currentTarget.style.transform = "scale(1)";
                                                    }
                                                }}
                                            >
                                                {day.getDate()}
                                                {dayEvents.length > 0 && (
                                                    <div
                                                        style={{
                                                            position: "absolute",
                                                            top: "1px",
                                                            right: "1px",
                                                            width: "4px",
                                                            height: "4px",
                                                            backgroundColor: "#3B82F6",
                                                            borderRadius: "50%",
                                                            animation: "pulse 2s infinite",
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {monthEvents.length > 0 && (
                                    <div
                                        style={{
                                            marginTop: "12px",
                                            fontSize: "11px",
                                            color: "#6b7280",
                                            textAlign: "center",
                                            fontWeight: "500",
                                            padding: "6px",
                                            backgroundColor: "#f8fafc",
                                            borderRadius: "6px",
                                        }}
                                    >
                                        {monthEvents.length} event
                                        {monthEvents.length > 1 ? "s" : ""}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div
            style={{
                padding: "24px",
                backgroundColor: "#f9fafb",
                minHeight: "100vh",
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
        >
            <style>
                {`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes fadeInLeft {
            from {
              opacity: 0;
              transform: translateX(-15px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          /* Custom Scrollbar Styles */
          ::-webkit-scrollbar {
            width: 6px;
          }

          ::-webkit-scrollbar-track {
            background: transparent;
          }

          ::-webkit-scrollbar-thumb {
            background: #e5e7eb;
            border-radius: 3px;
            transition: background 0.2s ease;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #d1d5db;
          }
        `}
            </style>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                    gap: "16px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {/* <h1
                        style={{
                            fontSize: "28px",
                            fontWeight: "800",
                            margin: 0,
                            color: "#111827",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            animation: "fadeInLeft 0.6s ease",
                        }}
                    >
                        {view === "Year"
                            ? currentDate.getFullYear()
                            : formatDate(currentDate)}
                    </h1> */}
                    <Title level={2} style={{
                        margin: 0, color: '#262626', WebkitBackgroundClip: "text",
                        // WebkitTextFillColor: "transparent",
                        animation: "fadeInLeft 0.6s ease",
                    }}>{view === "Year"
                        ? currentDate.getFullYear()
                        : formatDate(currentDate)}
                    </Title>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                            onClick={() => navigateDate("prev")}
                            style={{
                                padding: "10px",
                                backgroundColor: "white",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-1px)";
                                e.currentTarget.style.boxShadow =
                                    "0 4px 12px rgba(0, 0, 0, 0.15)";
                                e.currentTarget.style.backgroundColor = "#f8fafc";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow =
                                    "0 2px 4px rgba(0, 0, 0, 0.05)";
                                e.currentTarget.style.backgroundColor = "white";
                            }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => navigateDate("next")}
                            style={{
                                padding: "10px",
                                backgroundColor: "white",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-1px)";
                                e.currentTarget.style.boxShadow =
                                    "0 4px 12px rgba(0, 0, 0, 0.15)";
                                e.currentTarget.style.backgroundColor = "#f8fafc";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow =
                                    "0 2px 4px rgba(0, 0, 0, 0.05)";
                                e.currentTarget.style.backgroundColor = "white";
                            }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "4px" }}>
                    {(["Day", "Week", "Month", "Year"] as const).map((viewType) => (
                        <button
                            key={viewType}
                            onClick={() => setView(viewType)}
                            style={{
                                padding: "10px 16px",
                                backgroundColor: view === viewType ? "#3B82F6" : "white",
                                color: view === viewType ? "white" : "#6b7280",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "600",
                                boxShadow:
                                    view === viewType
                                        ? "0 4px 12px rgba(59, 130, 246, 0.4)"
                                        : "0 2px 4px rgba(0, 0, 0, 0.05)",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                transform:
                                    view === viewType ? "translateY(-1px)" : "translateY(0)",
                            }}
                            onMouseEnter={(e) => {
                                if (view !== viewType) {
                                    e.currentTarget.style.backgroundColor = "#f8fafc";
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                    e.currentTarget.style.boxShadow =
                                        "0 4px 12px rgba(0, 0, 0, 0.1)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (view !== viewType) {
                                    e.currentTarget.style.backgroundColor = "white";
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow =
                                        "0 2px 4px rgba(0, 0, 0, 0.05)";
                                }
                            }}
                        >
                            {viewType}
                        </button>
                    ))}
                </div>
            </div>

            {/* Add Event Input */}
            <div
                style={{
                    marginBottom: "20px",
                    animation: "slideInUp 0.5s ease",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                        marginBottom: "12px",
                    }}
                >
                    <div
                        style={{
                            flex: 1,
                            position: "relative",
                        }}
                    >
                        <input
                            type="text"
                            value={newEventText}
                            onChange={(e) => setNewEventText(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleAddEvent()}
                            placeholder="Try: 'Soccer practice for Emma next Monday at 4pm' or 'Family dinner tomorrow @6pm'"
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                border: "1px solid #d1d5db",
                                borderRadius: "10px",
                                fontSize: "14px",
                                backgroundColor: "white",
                                outline: "none",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                                transition: "all 0.3s ease",
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = "#3B82F6";
                                e.currentTarget.style.boxShadow =
                                    "0 0 0 3px rgba(59, 130, 246, 0.1)";
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = "#d1d5db";
                                e.currentTarget.style.boxShadow =
                                    "0 2px 4px rgba(0, 0, 0, 0.05)";
                            }}
                        />
                    </div>
                    <button
                        onClick={handleAddEvent}
                        style={{
                            padding: "14px",
                            backgroundColor: "#3B82F6",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px) scale(1.05)";
                            e.currentTarget.style.boxShadow =
                                "0 8px 25px rgba(59, 130, 246, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0) scale(1)";
                            e.currentTarget.style.boxShadow =
                                "0 4px 12px rgba(59, 130, 246, 0.4)";
                        }}
                    >
                        {/* <Plus size={16} /> */}
                        <ArrowRight size={16} />
                    </button>
                </div >
                < div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        fontSize: "11px",
                        color: "#6b7280",
                    }}
                >
                    <span style={{ fontWeight: "600" }}>Try:</span>
                    {
                        [
                            "Meeting tomorrow at 2pm",
                            "Lunch with John next Friday",
                            "Soccer practice Monday @4pm",
                        ].map((example, index) => (
                            <button
                                key={index}
                                onClick={() => setNewEventText(example)}
                                style={{
                                    padding: "3px 6px",
                                    backgroundColor: "#f3f4f6",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "4px",
                                    fontSize: "10px",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#e5e7eb";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                                }}
                            >
                                "{example}"
                            </button>
                        ))
                    }
                </ div>
            </div >

            {/* Calendar Content - CONSISTENT HEIGHT */}
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "20px",
                    boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    height: "750px", // CONSISTENT HEIGHT FOR ALL VIEWS
                    display: "flex",
                    flexDirection: "column",
                    animation: "fadeInUp 0.6s ease",
                }}
            >
                {view === "Week" && renderWeekView()}
                {view === "Month" && renderMonthView()}
                {view === "Day" && renderDayView()}
                {view === "Year" && renderYearView()}
            </div>

            {/* Legend */}
            <div
                style={{
                    marginTop: "20px",
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    animation: "fadeIn 0.8s ease",
                }}
            >
                {Object.entries(personColors).map(([person, color], index) => (
                    <Tooltip key={person} title={color.email}> {/* ⬅️ Show email on hover */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "13px",
                                padding: "6px 12px",
                                backgroundColor: "white",
                                borderRadius: "16px",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                                transition: "all 0.3s ease",
                                animation: `slideInUp 0.6s ease ${index * 0.1}s both`,
                                cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
                            }}
                        >
                            <div
                                style={{
                                    width: "12px",
                                    height: "12px",
                                    backgroundColor: color.color,
                                    borderRadius: "50%",
                                    boxShadow: `0 0 0 2px ${color.color}20`,
                                }}
                            />
                            <span style={{ color: "#374151", fontWeight: "500" }}>
                                {capitalizeEachWord(person)}
                            </span>
                        </div>
                    </Tooltip>
                ))}
            </div>
        </div >
    );
};

export default CustomCalendar;