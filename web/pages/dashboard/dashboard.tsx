'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import WeatherWidget from '../components/WeatherWidget';
import NewsWidget from '../components/NewsWidget';
import MarketsWidget from '../components/MarketsWidget';
import BoardCard from '../components/BoardCard';
import QuickActions from '../components/QuickActions';
import CalendarSection from '../components/CalendarSection';
import UpcomingActivities from '../components/UpcomingActivities1';
import CalendarEventWidget from './calendar';
import { useRouter } from 'next/navigation';
import { getCalendarEvents } from '../../services/google';
import { useCurrentUser } from '../../app/userContext';
import DocklyLoader from '../../utils/docklyLoader';

function App() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [events, setEvents] = useState<any[]>([]);
    const getCategoryFromTitle = (title: string): 'finance' | 'family' | 'health' | 'general' => {
        const lower = title.toLowerCase();
        if (lower.includes('bill') || lower.includes('payment') || lower.includes('invoice')) return 'finance';
        if (lower.includes('mom') || lower.includes('dad') || lower.includes('family') || lower.includes('birthday')) return 'family';
        if (lower.includes('doctor') || lower.includes('checkup') || lower.includes('hospital')) return 'health';
        return 'general';
    };
    const parsedEvents = events
        .filter(event => event?.start && event?.end)
        .map(event => ({
            id: event.id,
            title: event.summary || '(No Title)',
            start: new Date(event.start.dateTime || event.start.date),
            end: new Date(event.end.dateTime || event.end.date),
            source_email: event.source_email || '',
            category: getCategoryFromTitle(event.summary || ''),
            extendedProps: {
                status: event.status || 'pending',
            },
        }));

    useEffect(() => {
        const username = localStorage.getItem("username") || "";
        if (localStorage.getItem('dashboard') === null) {
            router.push(`/${username}/dashboard/setup`);
        }
    }, []);
    const currentUser = useCurrentUser();


    const fetchDashboardData = async () => {
        setLoading(true);

        try {
            // 1. Fetch user get started steps
            // const getStartedRes = await getUserGetStarted({});
            // if (getStartedRes.data.status) {
            //     const backend = getStartedRes.data.payload.steps || [];
            //     setIncompleteKeys(backend);
            //     setCompletedSteps(rawSteps.length - backend.length);
            // }

            // 2. Fetch Google Calendar events
            const calendarRes = await getCalendarEvents({
                userId: currentUser?.userId,
            });

            const rawEvents = calendarRes.data.payload.events;
            const gmailConnected = calendarRes.data.payload.connected_accounts;
            const colors = calendarRes.data.payload.account_colors || {};

            // if (gmailConnected && gmailConnected.length > 0) {
            //     setAccounts(gmailConnected);
            // }

            // if (colors && Object.keys(colors).length > 0) {
            //     setAccountColor(colors);
            // }

            const parsedEvents = rawEvents
                .filter((event: any) => event?.start && event?.end)
                .map((event: any) => ({
                    id: event.id,
                    title: event.summary || "(No Title)",
                    start: new Date(event.start.dateTime || event.start.date),
                    end: new Date(event.end.dateTime || event.end.date),
                    allDay: !event.start.dateTime,
                    extendedProps: {
                        status: "confirmed",
                    },
                    source_email: event.source_email || "",
                }));

            setEvents(parsedEvents);

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const boardsData = [
        {
            title: 'Home Management',
            icon: 'home',
            accounts: 8,
            documents: 12,
            statusItems: [
                { type: 'urgent' as const, text: 'Mortgage payment due in 2 days' },
                { type: 'pending' as const, text: '3 utility bills this week' },
            ]
        },
        {
            title: 'Family Hub',
            icon: 'family',
            accounts: 4,
            documents: 15,
            statusItems: [
                { type: 'pending' as const, text: "Emma's school permission slip" },
                { type: 'complete' as const, text: 'All health records updated' },
            ]
        },
        {
            title: 'Finance',
            icon: 'finance',
            accounts: 6,
            documents: 9,
            statusItems: [
                { type: 'complete' as const, text: 'Credit card autopay active' },
                { type: 'pending' as const, text: 'Review investment portfolio' },
            ]
        },
        {
            title: 'Health',
            icon: 'health',
            accounts: 3,
            documents: 7,
            statusItems: [
                { type: 'urgent' as const, text: 'Dental checkup overdue' },
                { type: 'pending' as const, text: 'Prescription refill needed' },
            ]
        },
        {
            title: 'Lifestyle',
            icon: 'travel',
            accounts: 4,
            documents: 5,
            statusItems: [
                { type: 'pending' as const, text: 'Passport expires in 45 days' },
                { type: 'complete' as const, text: 'Summer trip booked' },
            ]
        },
        {
            title: 'Projects',
            icon: 'projects',
            accounts: 3,
            documents: 8,
            statusItems: [
                { type: 'pending' as const, text: 'Kitchen renovation planning' },
                { type: 'complete' as const, text: 'Garden design complete' },
            ]
        },
    ];

    if (loading) {
        return <DocklyLoader />
    }

    return (
        <div style={{
            minHeight: '100vh',
            // background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            fontFamily: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
        }}>

            <div style={{
                maxWidth: '1700px',
                margin: '0 auto',
                padding: '32px 24px',
                marginLeft: '40px'
            }}>
                <div
                    style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '32px',
                        padding: '40px',
                        marginBottom: '32px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                >
                    <div>
                        <h1 style={{
                            fontSize: '48px',
                            fontWeight: '500',
                            color: '#1e293b',
                            marginBottom: '8px',
                            lineHeight: 1.2,
                        }}>
                            Tuesday, June 10, 2025
                        </h1>

                        <p style={{
                            fontSize: '18px',
                            color: '#64748b',
                            fontWeight: '500',
                        }}>
                            Good morning, John! Here's your daily snapshot. ✨
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '24px',
                        marginBottom: '40px',
                    }}>
                        <WeatherWidget />
                        <NewsWidget />
                        <MarketsWidget />
                    </div>

                    <div
                    >
                        <h2 style={{
                            fontSize: '32px',
                            fontWeight: '500',
                            color: '#1a202c',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}>
                            <span style={{
                                background: '#1e293b',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                Your Boards
                            </span>
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: '24px',
                            marginBottom: '32px',
                        }}>
                            {boardsData.map((board, index) => (
                                <BoardCard
                                    key={board.title}
                                    title={board.title}
                                    icon={board.icon}
                                    accounts={board.accounts}
                                    documents={board.documents}
                                    statusItems={board.statusItems}
                                    index={index}
                                />
                            ))}
                        </div>
                    </div>

                    <QuickActions />
                </div>

                <div style={{
                    display: 'flex',
                    marginBottom: '32px',
                    gap: '20px'
                }}>
                    <UpcomingActivities events={events || []} />
                    {/* <CalendarSection rawEvents={parsedEvents} /> */}
                    <CalendarEventWidget events={events} accountColor={{}} />
                </div>
            </div>
        </div>
    );
}

export default App;