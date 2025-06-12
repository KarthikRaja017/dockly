'use client';
import { Button, Card, Col, Grid, Layout, Row, Space, Tag, Typography } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import React, { useEffect } from "react";
import { useState } from "react";
import CalendarSection from "../../../../pages/components/CalendarSection";
import { useRouter } from "next/navigation";

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

// Custom SVG icons
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        style={{ width: '24px', height: '24px', fill: 'none', stroke: 'currentColor', strokeWidth: 2, ...props.style }}
        viewBox="0 0 24 24"
        {...props}
    >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);
const BookmarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        style={{ width: '24px', height: '24px', fill: 'none', stroke: 'currentColor', strokeWidth: 2, ...props.style }}
        viewBox="0 0 24 24"
        {...props}
    >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
);
const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        style={{ width: '24px', height: '24px', fill: 'none', stroke: 'currentColor', strokeWidth: 2, ...props.style }}
        viewBox="0 0 24 24"
        {...props}
    >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
    </svg>
);
const ShieldIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        style={{ width: '24px', height: '24px', fill: 'none', stroke: 'currentColor', strokeWidth: 2, ...props.style }}
        viewBox="0 0 24 24"
        {...props}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
);
const LayoutDashboardIcon = (props: any) => (
    <svg style={{ width: '24px', height: '24px', fill: 'none', stroke: 'currentColor', strokeWidth: 2, ...props.style }} viewBox="0 0 24 24" {...props}>
        <rect x="3" y="3" width="7" height="9"></rect>
        <rect x="14" y="3" width="7" height="5"></rect>
        <rect x="14" y="12" width="7" height="9"></rect>
        <rect x="3" y="16" width="7" height="5"></rect>
    </svg>
);
const UsersIcon = () => <svg style={{ width: '24px', height: '24px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const HomeIcon = () => <svg style={{ width: '24px', height: '24px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }} viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const DollarSignIcon = () => <svg style={{ width: '24px', height: '24px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }} viewBox="0 0 24 24"><line x1="12" x2="12" y1="1" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const HeartIcon = () => <svg style={{ width: '24px', height: '24px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }} viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const MapPinIcon = () => <svg style={{ width: '24px', height: '24px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const FolderOpenIcon = () => <svg style={{ width: '24px', height: '24px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }} viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M20 7H8l-2-3H2v14l2-1.5V7h14l2 3z"></path></svg>;
const ChevronRightIcon = (props: any) => (
    <svg style={{ width: '24px', height: '24px', fill: 'none', stroke: 'currentColor', strokeWidth: 2, ...props.style }} viewBox="0 0 24 24" {...props}>
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);
const SparklesIcon = () => <svg style={{ width: '24px', height: '24px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }} viewBox="0 0 24 24"><path d="M12 2v4m0 12v4M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path></svg>;
const ZapIcon = () => <svg style={{ width: '24px', height: '24px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const LockIcon = (props: any) => (
    <svg style={{ width: '24px', height: '24px', fill: 'none', stroke: 'currentColor', strokeWidth: 2, ...props.style }} viewBox="0 0 24 24" {...props}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);
const CloudIcon = () => <svg style={{ width: '24px', height: '24px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }} viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>;
const CheckCircleIcon = (props: any) => (
    <svg style={{ width: '24px', height: '24px', fill: 'none', stroke: 'currentColor', strokeWidth: 2, ...props.style }} viewBox="0 0 24 24" {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);
const ArrowRightIcon = () => <svg style={{ width: '24px', height: '24px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }} viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const StarIcon = (props: any) => (
    <svg style={{ width: '24px', height: '24px', fill: 'none', stroke: 'currentColor', strokeWidth: 2, ...props.style }} viewBox="0 0 24 24" {...props}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

function App() {
    const [activeStep, setActiveStep] = useState(0);
    const screens = useBreakpoint();

    const hubs = [
        // { icon: LayoutDashboardIcon, name: 'Dashboard', description: 'Your command center with quick actions and insights', color: 'linear-gradient(to right, #6b46c169, #2b6cb069)' },
        { icon: CalendarIcon, name: 'Planner', description: 'Unified calendar and to-do lists for everything', color: 'linear-gradient(to right, #2b6cb069, #2c7a7b69)' },
        { icon: BookmarkIcon, name: 'Accounts', description: 'Easy access to all your frequently visited sites', color: 'linear-gradient(to right, #2c7a7b69, #2f855a69)' },
        // { icon: FileTextIcon, name: 'Files', description: 'Central repository for all important documents', color: 'linear-gradient(to right, #2f855a69, #b7791f69)' },
        { icon: ShieldIcon, name: 'Vault', description: 'Unified password manager with secure access', color: 'linear-gradient(to right, #b7791f69, #c5303069)' },
    ];

    const boards = [
        { icon: UsersIcon, name: 'Family', description: 'Shared planning and digital legacy management', color: 'linear-gradient(to right, #b8328069, #9f123969)' },
        { icon: HomeIcon, name: 'Home', description: 'Property management and maintenance tracking', color: 'linear-gradient(to right, #4c51bf69, #6b46c169)' },
        { icon: DollarSignIcon, name: 'Finance', description: 'Complete financial dashboard and budgeting', color: 'linear-gradient(to right, #05966969, #2c7a7b69)' },
        { icon: HeartIcon, name: 'Health', description: 'Health tracking and medical records', color: 'linear-gradient(to right, #c5303069, #b8328069)' },
        { icon: MapPinIcon, name: 'Lifestyle', description: 'Travel, hobbies, and personal interests', color: 'linear-gradient(to right, #d9770669, #dd6b2069)' },
        { icon: FolderOpenIcon, name: 'Projects', description: 'Collaborative project management workspace', color: 'linear-gradient(to right, #6b46c169, #9748d169)' },
    ];

    const steps = [
        {
            title: 'Connect Your Digital Life',
            description: 'Link your calendars, accounts, and services',
            icon: ZapIcon,
            features: ['Google Calendar', 'Microsoft Outlook', 'Apple iCloud', 'Social Accounts'],
        },
        {
            title: 'Organize Your Data',
            description: 'Set up your Hubs for centralized management',
            icon: CloudIcon,
            features: ['File Storage', 'Password Manager', 'Bookmarks', 'Documents'],
        },
        {
            title: 'Customize Your Boards',
            description: 'Create specialized workspaces for different areas of life',
            icon: SparklesIcon,
            features: ['Family Planning', 'Financial Tracking', 'Health Records', 'Project Management'],
        },
    ];
    const [username, setUsername] = useState<string | null>(null);
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, [])
    const router = useRouter();
    const handlesubmit = () => {
        localStorage.setItem("dashboard", "1");
        router.push(`/${username}/dashboard`);
    }

    return (
        <Layout style={{ minHeight: '100vh', background: '#fff', overflow: 'hidden', marginTop: '-40px' }}>
            {/* Animated Background */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-160px', right: '-160px', width: '320px', height: '320px', background: '#6b46c1', borderRadius: '50%', mixBlendMode: 'multiply', filter: 'blur(64px)', opacity: 0.1, animation: 'pulse 5s infinite' }}></div>
                <div style={{ position: 'absolute', bottom: '-160px', left: '-160px', width: '320px', height: '320px', background: '#2b6cb0', borderRadius: '50%', mixBlendMode: 'multiply', filter: 'blur(64px)', opacity: 0.1, animation: 'pulse 5s infinite 1s' }}></div>
                <div style={{ position: 'absolute', top: '160px', left: '50%', width: '240px', height: '240px', background: '#2c7a7b', borderRadius: '50%', mixBlendMode: 'multiply', filter: 'blur(64px)', opacity: 0.1, animation: 'pulse 5s infinite 2s' }}></div>
            </div>

            <style>{`
            @keyframes pulse {
              0% { transform: scale(1); opacity: 0.1; }
              50% { transform: scale(1.15); opacity: 0.2; }
              100% { transform: scale(1); opacity: 0.1; }
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
          `}</style>

            {/* <Header style={{ background: 'transparent', padding: '24px', position: 'relative', zIndex: 10 }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(to right, #6b46c1, #2b6cb0)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LayoutDashboardIcon style={{ color: '#fff', width: '24px', height: '24px' }} />
                        </div>
                        <Title level={3} style={{ color: '#1f2937', margin: 0, fontWeight: 'bold' }}>Dockly</Title>
                    </div>
                    {screens.md && (
                        <Space size="large">
                            {['Features', 'Pricing', 'Support'].map(item => (
                                <Text key={item} style={{ color: '#4b5563', cursor: 'pointer', transition: 'color 0.3s', fontSize: '16px' }} onMouseEnter={e => e.target.style.color = '#1f2937'} onMouseLeave={e => e.target.style.color = '#4b5563'}>{item}</Text>
                            ))}
                        </Space>
                    )}
                </div>
            </Header> */}

            <Content style={{ padding: '48px 24px', position: 'relative', zIndex: 10 }}>
                {/* Hero Section */}
                <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
                    {/* <Tag color="purple" icon={<StarIcon style={{ verticalAlign: 'middle', marginRight: '8px', color: '#d97706' }} />} style={{ marginBottom: '32px', padding: '8px 16px', borderRadius: '999px', background: '#f3e8ff', color: '#6b46c1', fontSize: '14px' }}>
                        Connect and Organize Your Digital Life
                    </Tag> */}
                    <Row
                        gutter={24}
                        style={{
                            marginTop: 75,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Col xs={24} md={12}>
                            <img
                                src="/dashboard.png"
                                alt="dashboard"
                                style={{
                                    width: '100%',
                                    maxWidth: '100%',
                                    borderRadius: 12,
                                    objectFit: 'cover',
                                }}
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <Title level={1} style={{ fontSize: screens.md ? '62px' : '48px', color: '#1f2937', marginBottom: '24px', fontWeight: 'bold', lineHeight: 1.1 }}>
                                Welcome to <span style={{ background: 'linear-gradient(to right, #9748d1, #b83280, #2b6cb0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Dockly</span>
                            </Title>
                            <Paragraph style={{ fontSize: screens.md ? '20px' : '20px', color: '#4b5563', marginBottom: '48px', maxWidth: '768px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
                                Your complete digital command center. Manage everything from calendars and finances to family planning and personal projects - all in one beautifully organized place.
                            </Paragraph>
                            <Space direction={screens.sm ? 'horizontal' : 'vertical'} size="middle" style={{ marginBottom: '64px', justifyContent: 'center' }}>
                                <Button onClick={handlesubmit} type="primary" size="large" style={{ background: 'linear-gradient(to right, #6b46c1, #2b6cb0)', border: 'none', padding: '12px 32px', borderRadius: '12px', fontSize: '18px', fontWeight: '600', transition: 'all 0.3s', transform: 'scale(1)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} >
                                    Get Started  <span style={{ marginLeft: '8px', transition: 'transform 0.3s', display: 'inline-block' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}><ArrowRightIcon /></span>
                                </Button>
                                <Button size="large" style={{ border: '1px solid #d1d5db', color: '#1f2937', padding: '12px 32px', borderRadius: '12px', fontSize: '18px', fontWeight: '600', background: '#f9fafb', transition: 'all 0.3s', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} >
                                    Watch Demo
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                    <Card style={{ maxWidth: '1126px', margin: '0 auto', background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.05)', padding: '32px' }}>
                        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                            {[
                                { icon: CalendarIcon, label: 'Planner', active: true },
                                { icon: DollarSignIcon, label: 'Finance', active: false },
                                { icon: FileTextIcon, label: 'Files', active: false },
                                { icon: UsersIcon, label: 'Family', active: false },
                            ].map((item, index) => (
                                <Col xs={12} md={6} key={index}>
                                    <div style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        background: item.active ? 'linear-gradient(to right, #6b46c1, #2b6cb0)' : '#f9fafb',
                                        color: item.active ? '#fff' : '#4b5563',
                                        textAlign: 'center',
                                        transition: 'all 0.3s',
                                        cursor: 'pointer',
                                        boxShadow: item.active ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                                    }} onMouseEnter={e => {
                                        if (!item.active) (e.target as HTMLElement).style.background = '#e5e7eb';
                                    }} onMouseLeave={e => {
                                        if (!item.active) (e.target as HTMLElement).style.background = '#f9fafb';
                                    }}>
                                        {React.createElement(item.icon, { style: { width: '24px', height: '24px' } })}
                                        <Text style={{ fontSize: '14px', fontWeight: '500', color: item.active ? '#fff' : 'black', marginLeft: 4 }}>{item.label}</Text>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                        <Text style={{ color: '#6b7280', fontSize: '14px' }}>
                            <CalendarSection />
                        </Text>
                    </Card>
                </div>

                {/* Getting Started Steps */}
                <div style={{ maxWidth: '1280px', margin: '80px auto', background: '#f9fafb', padding: '48px', borderRadius: '16px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <Title level={2} style={{ fontSize: screens.md ? '48px' : '36px', color: '#1f2937', marginBottom: '16px', fontWeight: 'bold' }}>
                            Get Started in Minutes
                        </Title>
                        <Paragraph style={{ fontSize: '20px', color: '#4b5563', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
                            Simple setup process to connect all your digital services and create your personal command center
                        </Paragraph>
                    </div>
                    <Row gutter={[32, 32]}>
                        {steps.map((step, index) => (
                            <Col xs={24} md={8} key={index}>
                                <Card
                                    style={{
                                        background: activeStep === index ? '#ede9fe' : '#fff',
                                        border: activeStep === index ? '1px solid #6b46c1' : '1px solid #e5e7eb',
                                        borderRadius: '16px',
                                        padding: '32px',
                                        transition: 'all 0.5s',
                                        transform: activeStep === index ? 'scale(1.05)' : 'scale(1)',
                                        boxShadow: activeStep === index ? '0 8px 32px rgba(0,0,0,0.1)' : 'none',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={() => setActiveStep(index)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: 'linear-gradient(to right, #6b46c1, #2b6cb0)', borderRadius: '16px', marginBottom: '24px', animation: activeStep === index ? 'bounce 1s infinite' : 'none' }}>
                                        {React.createElement(step.icon, { style: { color: '#fff', width: '32px', height: '32px' } })}
                                    </div>
                                    <Title level={3} style={{ color: '#1f2937', marginBottom: '16px', fontWeight: 'bold', fontSize: '24px' }}>{step.title}</Title>
                                    <Paragraph style={{ color: '#4b5563', marginBottom: '24px', lineHeight: 1.6, fontSize: '16px' }}>{step.description}</Paragraph>
                                    <Space direction="vertical" size="small">
                                        {step.features.map((feature, featureIndex) => (
                                            <div key={featureIndex} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <CheckCircleIcon style={{ color: '#2f855a', width: '16px', height: '16px' }} />
                                                <Text style={{ color: '#4b5563', fontSize: '14px' }}>{feature}</Text>
                                            </div>
                                        ))}
                                    </Space>
                                    <div style={{ position: 'absolute', top: '16px', right: '16px', color: '#6b46c1', fontWeight: 'bold', fontSize: '24px' }}>{index + 1}</div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* Hubs Section */}
                <div style={{ maxWidth: '1280px', margin: '80px auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <Title level={2} style={{ fontSize: screens.md ? '48px' : '36px', color: '#1f2937', marginBottom: '16px', fontWeight: 'bold' }}>
                            Powerful <span style={{ background: 'linear-gradient(to right, #9748d1, #2b6cb0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Hubs</span>
                        </Title>
                        <Paragraph style={{ fontSize: '20px', color: '#4b5563', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
                            Centralized utilities that bring together all your digital services and data
                        </Paragraph>
                    </div>
                    <Row gutter={[24, 24]}>
                        {hubs.map((hub, index) => (
                            <Col xs={24} md={12} lg={8} key={index}>
                                <Card
                                    style={{
                                        background: '#fff',
                                        borderRadius: '16px',
                                        border: '1px solid #e5e7eb',
                                        padding: '32px',
                                        transition: 'all 0.3s',
                                        transform: 'scale(1)',
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.border = '1px solid #d1d5db';
                                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.border = '1px solid #e5e7eb';
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)';
                                    }}
                                >
                                    <div style={{ width: '56px', height: '56px', background: hub.color, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', transition: 'transform 0.3s' }} onMouseEnter={e => (e.target as HTMLElement).style.transform = 'scale(1.1)'} onMouseLeave={e => (e.target as HTMLElement).style.transform = 'scale(1)'}>
                                        <hub.icon style={{ color: '#fff', width: '28px', height: '28px' }} />
                                    </div>
                                    <Title level={3} style={{ color: '#1f2937', marginBottom: '12px', fontWeight: 'bold', fontSize: '24px' }}>{hub.name}</Title>
                                    <Paragraph style={{ color: '#4b5563', marginBottom: '16px', lineHeight: 1.6, fontSize: '16px' }}>{hub.description}</Paragraph>
                                    <div style={{ display: 'flex', alignItems: 'center', color: '#6b46c1', fontWeight: '500', transition: 'transform 0.3s' }} >
                                        <Text style={{ color: '#6b46c1', fontSize: '14px' }}>Learn more</Text>
                                        <ChevronRightIcon style={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* Boards Section */}
                <div style={{ maxWidth: '1280px', margin: '80px auto', background: '#f9fafb', padding: '48px', borderRadius: '16px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <Title level={2} style={{ fontSize: screens.md ? '48px' : '36px', color: '#1f2937', marginBottom: '16px', fontWeight: 'bold' }}>
                            Specialized <span style={{ background: 'linear-gradient(to right, #2c7a7b, #2f855a)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Boards</span>
                        </Title>
                        <Paragraph style={{ fontSize: '20px', color: '#4b5563', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
                            Domain-specific workspaces tailored for different areas of your life
                        </Paragraph>
                    </div>
                    <Row gutter={[24, 24]}>
                        {boards.map((board, index) => (
                            <Col xs={24} md={12} lg={8} key={index}>
                                <Card
                                    style={{
                                        background: '#fff',
                                        borderRadius: '16px',
                                        border: '1px solid #e5e7eb',
                                        padding: '32px',
                                        transition: 'all 0.3s',
                                        transform: 'scale(1)',
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.border = '1px solid #d1d5db';
                                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.border = '1px solid #e5e7eb';
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)';
                                    }}
                                >
                                    <div style={{ width: '56px', height: '56px', background: board.color, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', transition: 'transform 0.3s' }} >
                                        {React.createElement(board.icon, { style: { color: '#fff', width: '28px', height: '28px' } })}
                                    </div>
                                    <Title level={3} style={{ color: '#1f2937', marginBottom: '12px', fontWeight: 'bold', fontSize: '24px' }}>{board.name}</Title>
                                    <Paragraph style={{ color: '#4b5563', marginBottom: '16px', lineHeight: 1.6, fontSize: '16px' }}>{board.description}</Paragraph>
                                    <div style={{ display: 'flex', alignItems: 'center', color: '#2c7a7b', fontWeight: '500', transition: 'transform 0.3s' }} onMouseEnter={e => (e.target as HTMLElement).style.transform = 'translateX(8px)'} onMouseLeave={e => (e.target as HTMLElement).style.transform = 'translateX(0)'}>
                                        <Text style={{ color: '#2c7a7b', fontSize: '14px' }}>Explore</Text>
                                        <ChevronRightIcon style={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </Content>
        </Layout>
    );
}

export default App;
