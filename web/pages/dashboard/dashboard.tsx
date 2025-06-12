'use client';
import React, { useEffect } from 'react';
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

function App() {
    const router = useRouter();
    useEffect(() => {
        const username = localStorage.getItem("username") || "";
        if (localStorage.getItem('dashboard') === null) {
            router.push(`/${username}/dashboard/setup`);
        }
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

                    {/* Boards Overview */}
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

                    {/* Quick Actions */}
                    <QuickActions />
                </div>

                {/* Calendar and Activities Section */}
                <div style={{
                    display: 'flex',
                    marginBottom: '32px',
                }}>
                    <UpcomingActivities />
                    {/* <CalendarSection /> */}
                    <CalendarEventWidget events={[]} accountColor={{}} />
                </div>
            </div>
        </div>
    );
}

export default App;