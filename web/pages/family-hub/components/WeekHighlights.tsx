'use client';
import React, { useState } from 'react';
import { Card, Space, Typography, Button, Avatar } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
const { Text } = Typography;

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const WeekHighlights: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState('All');

    const filterButtons = [
        { key: 'All', label: 'All', color: '#3b82f6', bgColor: '#3b82f6' },
        { key: 'Family', label: 'Family', color: '#ef4444', bgColor: '#fef2f2', textColor: '#dc2626' },
        { key: 'Emma', label: 'Emma', color: '#8b5cf6', bgColor: '#f3e8ff', textColor: '#7c3aed' },
        { key: 'Liam', label: 'Liam', color: '#ec4899', bgColor: '#fce7f3', textColor: '#be185d' }
    ];

    const highlights = [
        {
            date: '12',
            day: 'THU',
            title: "Emma's Science Fair",
            person: 'Emma Smith',
            avatar: 'ES',
            avatarColor: '#8b5cf6',
            time: '4:00 PM - 7:00 PM',
            location: 'Springfield High School',
            icon: '🔬'
        },
        {
            date: '13',
            day: 'FRI',
            title: 'Dentist Appointment',
            person: 'Liam Smith',
            avatar: 'LS',
            avatarColor: '#ec4899',
            time: '2:30 PM',
            location: 'Dr. Wilson Pediatric Dentistry',
            icon: '🦷'
        },
        {
            date: '14',
            day: 'SAT',
            title: 'Family 5K Fun Run',
            person: 'Whole Family',
            avatar: '👥',
            avatarColor: '#f59e0b',
            time: '8:00 AM',
            location: 'Riverside Park',
            icon: '🏃'
        },
        {
            date: '14',
            day: 'SAT',
            title: 'Pizza & Movie Night',
            person: 'Whole Family',
            avatar: '👥',
            avatarColor: '#f59e0b',
            time: '6:00 PM',
            location: 'Family Room',
            icon: '🍕'
        },
        {
            date: '15',
            day: 'SUN',
            title: "Grandma's Birthday Brunch",
            person: 'Whole Family',
            avatar: '👥',
            avatarColor: '#f59e0b',
            time: '11:00 AM',
            location: 'The Garden Restaurant',
            icon: '🎂'
        }
    ];

    return (
        <Card
            title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Space>
                        <span style={{ fontSize: '16px' }}>⭐</span>
                        <span style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#1f2937',
                            fontFamily: FONT_FAMILY
                        }}>
                            Week Highlights
                        </span>
                    </Space>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '12px' }}>📅</span>
                        <Text style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            fontFamily: FONT_FAMILY
                        }}>
                            June 9-15, 2025
                        </Text>
                    </div>
                </div>
            }
            // bodyStyle={{ padding: '12px' }}
            // headStyle={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}
            bodyStyle={{ padding: '18px' }}
            headStyle={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}
            style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
        >
            {/* Filter Buttons */}
            <div style={{ marginBottom: '12px' }}>
                <Space wrap size={6}>
                    {filterButtons.map((filter) => (
                        <Button
                            key={filter.key}
                            size="small"
                            style={{
                                backgroundColor: activeFilter === filter.key ? filter.bgColor : '#f8fafc',
                                color: activeFilter === filter.key ? (filter.key === 'All' ? 'white' : filter.textColor) : '#64748b',
                                border: activeFilter === filter.key ? 'none' : '1px solid #e2e8f0',
                                borderRadius: '14px',
                                height: '24px',
                                padding: '0 10px',
                                fontWeight: 500,
                                fontSize: '11px',
                                fontFamily: FONT_FAMILY
                            }}
                            onClick={() => setActiveFilter(filter.key)}
                        >
                            {filter.key === 'All' && '👥 '}
                            {filter.key === 'Family' && '❤ '}
                            {filter.label}
                        </Button>
                    ))}
                </Space>
            </div>

            {/* Highlights Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {highlights.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                        {/* Date */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            backgroundColor: '#f8fafc',
                            borderRadius: '5px',
                            padding: '6px 6px',
                            minWidth: '40px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <Text strong style={{ fontSize: '14px', color: '#3b82f6', lineHeight: 1 }}>
                                {item.date}
                            </Text>
                            <Text style={{ fontSize: '9px', color: '#6b7280', fontWeight: 500 }}>
                                {item.day}
                            </Text>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ marginBottom: '4px' }}>
                                <Text strong style={{
                                    fontSize: '13px',
                                    color: '#111827',
                                    display: 'block',
                                    lineHeight: 1.3,
                                    fontFamily: FONT_FAMILY
                                }}>
                                    {item.title}
                                </Text>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                                    <Avatar
                                        size={16}
                                        style={{
                                            backgroundColor: item.avatarColor,
                                            fontSize: '8px',
                                            fontWeight: 600
                                        }}
                                    >
                                        {item.avatar}
                                    </Avatar>
                                    <Text style={{
                                        fontSize: '11px',
                                        color: '#6b7280',
                                        fontFamily: FONT_FAMILY
                                    }}>
                                        {item.person}
                                    </Text>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ color: '#ef4444', fontSize: '10px' }}>⏰</span>
                                <Text style={{
                                    fontSize: '11px',
                                    color: '#6b7280',
                                    fontFamily: FONT_FAMILY
                                }}>
                                    {item.time} • {item.location}
                                </Text>
                            </div>
                        </div>

                        {/* Icon */}
                        <div style={{
                            width: '30px',
                            height: '30px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            border: '1px solid #e2e8f0'
                        }}>
                            {item.icon}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default WeekHighlights;