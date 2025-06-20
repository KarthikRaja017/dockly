// 'use client';
// import React, { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import WeatherWidget from '../components/WeatherWidget';
// import NewsWidget from '../components/NewsWidget';
// import MarketsWidget from '../components/MarketsWidget';
// import BoardCard from '../components/BoardCard';
// import QuickActions from '../components/QuickActions';
// import CalendarSection from '../components/CalendarSection';
// import UpcomingActivities from '../components/UpcomingActivities1';
// import CalendarEventWidget from './calendar';
// import { useRouter } from 'next/navigation';
// import { getCalendarEvents } from '../../services/google';
// import { useCurrentUser } from '../../app/userContext';
// import DocklyLoader from '../../utils/docklyLoader';

// function App() {
//     const router = useRouter();
//     const [loading, setLoading] = useState<boolean>(false);
//     const [events, setEvents] = useState<any[]>([]);
//     const getCategoryFromTitle = (title: string): 'finance' | 'family' | 'health' | 'general' => {
//         const lower = title.toLowerCase();
//         if (lower.includes('bill') || lower.includes('payment') || lower.includes('invoice')) return 'finance';
//         if (lower.includes('mom') || lower.includes('dad') || lower.includes('family') || lower.includes('birthday')) return 'family';
//         if (lower.includes('doctor') || lower.includes('checkup') || lower.includes('hospital')) return 'health';
//         return 'general';
//     };
//     const parsedEvents = events
//         .filter(event => event?.start && event?.end)
//         .map(event => ({
//             id: event.id,
//             title: event.summary || '(No Title)',
//             start: new Date(event.start.dateTime || event.start.date),
//             end: new Date(event.end.dateTime || event.end.date),
//             source_email: event.source_email || '',
//             category: getCategoryFromTitle(event.summary || ''),
//             extendedProps: {
//                 status: event.status || 'pending',
//             },
//         }));

//     useEffect(() => {
//         const username = localStorage.getItem("username") || "";
//         if (localStorage.getItem('dashboard') === null) {
//             router.push(`/${username}/dashboard/setup`);
//         }
//     }, []);
//     const currentUser = useCurrentUser();


//     const fetchDashboardData = async () => {
//         setLoading(true);

//         try {
//             // 1. Fetch user get started steps
//             // const getStartedRes = await getUserGetStarted({});
//             // if (getStartedRes.data.status) {
//             //     const backend = getStartedRes.data.payload.steps || [];
//             //     setIncompleteKeys(backend);
//             //     setCompletedSteps(rawSteps.length - backend.length);
//             // }

//             // 2. Fetch Google Calendar events
//             const calendarRes = await getCalendarEvents({
//                 userId: currentUser?.userId,
//             });

//             const rawEvents = calendarRes.data.payload.events;
//             const gmailConnected = calendarRes.data.payload.connected_accounts;
//             const colors = calendarRes.data.payload.account_colors || {};

//             // if (gmailConnected && gmailConnected.length > 0) {
//             //     setAccounts(gmailConnected);
//             // }

//             // if (colors && Object.keys(colors).length > 0) {
//             //     setAccountColor(colors);
//             // }

//             const parsedEvents = rawEvents
//                 .filter((event: any) => event?.start && event?.end)
//                 .map((event: any) => ({
//                     id: event.id,
//                     title: event.summary || "(No Title)",
//                     start: new Date(event.start.dateTime || event.start.date),
//                     end: new Date(event.end.dateTime || event.end.date),
//                     allDay: !event.start.dateTime,
//                     extendedProps: {
//                         status: "confirmed",
//                     },
//                     source_email: event.source_email || "",
//                 }));

//             setEvents(parsedEvents);

//         } catch (error) {
//             console.error("Failed to fetch dashboard data", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchDashboardData();
//     }, []);

//     const boardsData = [
//         {
//             title: 'Home Management',
//             icon: 'home',
//             accounts: 8,
//             documents: 12,
//             statusItems: [
//                 { type: 'urgent' as const, text: 'Mortgage payment due in 2 days' },
//                 { type: 'pending' as const, text: '3 utility bills this week' },
//             ]
//         },
//         {
//             title: 'Family Hub',
//             icon: 'family',
//             accounts: 4,
//             documents: 15,
//             statusItems: [
//                 { type: 'pending' as const, text: "Emma's school permission slip" },
//                 { type: 'complete' as const, text: 'All health records updated' },
//             ]
//         },
//         {
//             title: 'Finance',
//             icon: 'finance',
//             accounts: 6,
//             documents: 9,
//             statusItems: [
//                 { type: 'complete' as const, text: 'Credit card autopay active' },
//                 { type: 'pending' as const, text: 'Review investment portfolio' },
//             ]
//         },
//         {
//             title: 'Health',
//             icon: 'health',
//             accounts: 3,
//             documents: 7,
//             statusItems: [
//                 { type: 'urgent' as const, text: 'Dental checkup overdue' },
//                 { type: 'pending' as const, text: 'Prescription refill needed' },
//             ]
//         },
//         {
//             title: 'Lifestyle',
//             icon: 'travel',
//             accounts: 4,
//             documents: 5,
//             statusItems: [
//                 { type: 'pending' as const, text: 'Passport expires in 45 days' },
//                 { type: 'complete' as const, text: 'Summer trip booked' },
//             ]
//         },
//         {
//             title: 'Projects',
//             icon: 'projects',
//             accounts: 3,
//             documents: 8,
//             statusItems: [
//                 { type: 'pending' as const, text: 'Kitchen renovation planning' },
//                 { type: 'complete' as const, text: 'Garden design complete' },
//             ]
//         },
//     ];

//     if (loading) {
//         return <DocklyLoader />
//     }

//     return (
//         <div style={{
//             minHeight: '100vh',
//             // background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
//             fontFamily: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
//         }}>

//             <div style={{
//                 maxWidth: '1700px',
//                 margin: '0 auto',
//                 padding: '32px 24px',
//                 marginLeft: '40px'
//             }}>
//                 <div
//                     style={{
//                         background: 'rgba(255, 255, 255, 0.95)',
//                         borderRadius: '32px',
//                         padding: '40px',
//                         marginBottom: '32px',
//                         boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
//                         backdropFilter: 'blur(20px)',
//                         border: '1px solid rgba(255, 255, 255, 0.2)',
//                     }}
//                 >
//                     <div>
//                         <h1 style={{
//                             fontSize: '48px',
//                             fontWeight: '500',
//                             color: '#1e293b',
//                             marginBottom: '8px',
//                             lineHeight: 1.2,
//                         }}>
//                             Tuesday, June 10, 2025
//                         </h1>

//                         <p style={{
//                             fontSize: '18px',
//                             color: '#64748b',
//                             fontWeight: '500',
//                         }}>
//                             Good morning, John! Here's your daily snapshot. ✨
//                         </p>
//                     </div>

//                     <div style={{
//                         display: 'grid',
//                         gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
//                         gap: '24px',
//                         marginBottom: '40px',
//                     }}>
//                         <WeatherWidget />
//                         <NewsWidget />
//                         <MarketsWidget />
//                     </div>

//                     <div
//                     >
//                         <h2 style={{
//                             fontSize: '32px',
//                             fontWeight: '500',
//                             color: '#1a202c',
//                             marginBottom: '24px',
//                             display: 'flex',
//                             alignItems: 'center',
//                             gap: '12px',
//                         }}>
//                             <span style={{
//                                 background: '#1e293b',
//                                 WebkitBackgroundClip: 'text',
//                                 WebkitTextFillColor: 'transparent',
//                             }}>
//                                 Your Boards
//                             </span>
//                         </h2>

//                         <div style={{
//                             display: 'grid',
//                             gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
//                             gap: '24px',
//                             marginBottom: '32px',
//                         }}>
//                             {boardsData.map((board, index) => (
//                                 <BoardCard
//                                     key={board.title}
//                                     title={board.title}
//                                     icon={board.icon}
//                                     accounts={board.accounts}
//                                     documents={board.documents}
//                                     statusItems={board.statusItems}
//                                     index={index}
//                                 />
//                             ))}
//                         </div>
//                     </div>

//                     <QuickActions />
//                 </div>

//                 <div style={{
//                     display: 'flex',
//                     marginBottom: '32px',
//                     gap: '20px'
//                 }}>
//                     <UpcomingActivities events={events || []} />
//                     {/* <CalendarSection rawEvents={parsedEvents} /> */}
//                     <CalendarEventWidget events={events} accountColor={{}} />
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default App;

// 'use client';
// import React, { useEffect, useState } from 'react';
// import CalendarView from '../components/CalendarSection';
// import Markets from '../components/MarketsWidget';
// import QuickActions from '../components/QuickActions';
// import Weather from '../components/WeatherWidget';
// import TopNews from '../components/NewsWidget';
// import YourBoards from '../components/BoardCard';
// import UpcomingActivities from '../components/UpcomingActivities1';
// import { fetchDocklyUser } from '../../services/user';
// import DocklyLoader from '../../utils/docklyLoader';


// const Dashboard = () => {
//     const [loading, setLoading] = useState<boolean>(false);
//     const getDocklyUser = async () => {
//         setLoading(true);
//         const response = await fetchDocklyUser({});
//         const { status, payload } = response.data;
//         if (status) {
//             const { isRedirect } = payload;
//             if (isRedirect === true) {
//                 const username = localStorage.getItem('username') || '';
//                 window.location.href = `/${username}/dashboard/setup`;
//             }
//         }
//         setLoading(false);
//     }

//     useEffect(() => {
//         getDocklyUser();
//     }, []);

//     if (loading) {
//         return <DocklyLoader />;
//     }

//     return (
//         <div
//             style={{
//                 fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
//                 backgroundColor: '#f5f7fa',
//                 color: '#1a202c',
//                 lineHeight: 1.6,
//                 minHeight: '100vh',
//             }}
//         >
//             <div
//                 style={{
//                     maxWidth: '1400px',
//                     margin: '0 auto',
//                     padding: '24px',
//                 }}
//             >
//                 <div
//                     style={{
//                         background: 'white',
//                         borderRadius: '12px',
//                         padding: '32px',
//                         marginBottom: '32px',
//                         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
//                         position: 'relative',
//                         overflow: 'hidden',
//                     }}
//                 >
//                     <div
//                         style={{
//                             position: 'absolute',
//                             top: '-50%',
//                             right: '-20%',
//                             width: '300px',
//                             height: '300px',
//                             background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(147, 197, 253, 0.05) 100%)',
//                             borderRadius: '50%',
//                             zIndex: 0,
//                         }}
//                     />

//                     <div style={{ position: 'relative', zIndex: 1 }}>
//                         <h1
//                             style={{
//                                 fontSize: '32px',
//                                 fontWeight: 700,
//                                 marginBottom: '8px',
//                                 background: 'linear-gradient(135deg, #1e293b 0%, #2563eb 100%)',
//                                 WebkitBackgroundClip: 'text',
//                                 WebkitTextFillColor: 'transparent',
//                                 backgroundClip: 'text',
//                             }}
//                         >
//                             Tuesday, June 10, 2025
//                         </h1>
//                         <p
//                             style={{
//                                 color: '#64748b',
//                                 marginBottom: '32px',
//                                 fontSize: '16px',
//                             }}
//                         >
//                             Good morning, John! Here's your daily snapshot.
//                         </p>

//                         <div
//                             style={{
//                                 display: 'grid',
//                                 gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
//                                 gap: '20px',
//                                 marginBottom: '32px',
//                             }}
//                         >
//                             <Weather />
//                             <TopNews />
//                             <Markets />
//                         </div>

//                         <YourBoards />
//                         <QuickActions />
//                     </div>
//                 </div>

//                 <div
//                     style={{
//                         display: 'grid',
//                         gridTemplateColumns: '1fr 2fr',
//                         gap: '32px',
//                     }}
//                 >
//                     <UpcomingActivities />
//                     <CalendarView />
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Dashboard;


// -----------------
// 'use client'
// import React, { useEffect, useState } from 'react';
// // import Header from './Header';
// import WeatherWidget from './WeatherWidget';
// import TopNewsWidget from './TopNewsWidget';
// import MarketsWidget from './MarketsWidget';
// import AlertsSuggestions from './AlertsSuggestions';
// import QuickActions from './QuickActions';
// import UpcomingActivities from './UpcomingActivities';
// import RecentActivity from './RecentActivity';
// import FinanceSnapshot from './FinanceSnapshot';
// import HealthPulse from './HealthPulse';
// import ProductivityStats from './ProductivityStats';
// import TasksOverview from './TasksOverview';
// import SmartInsights from './SmartInsights';

// const Dashboard: React.FC = () => {
//     const [currentDate, setCurrentDate] = useState('');
//     const [userName] = useState('Karthik Raja');

//     useEffect(() => {
//         const options: Intl.DateTimeFormatOptions = {
//             weekday: 'long',
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         };
//         const date = new Date().toLocaleDateString('en-US', options);
//         setCurrentDate(date);
//     }, []);

//     const getGreeting = () => {
//         const hour = new Date().getHours();
//         if (hour < 12) return 'Good morning';
//         if (hour < 18) return 'Good afternoon';
//         return 'Good evening';
//     };

//     return (
//         <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', marginTop: 50, marginLeft: 30 }}>
//             {/* <Header /> */}

//             <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
//                 {/* Welcome Section */}
//                 <div style={{
//                     marginBottom: '24px',
//                     opacity: 0,
//                     animation: 'fadeInUp 0.6s ease-out forwards'
//                 }}>
//                     <h2 style={{
//                         fontSize: '32px',
//                         fontWeight: '700',
//                         color: '#1e293b',
//                         margin: '0 0 8px 0',
//                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                         WebkitBackgroundClip: 'text',
//                         WebkitTextFillColor: 'transparent'
//                     }}>
//                         {getGreeting()}, {userName}!
//                     </h2>
//                     <p style={{
//                         color: '#64748b',
//                         fontSize: '16px',
//                         margin: 0
//                     }}>
//                         {currentDate}
//                     </p>
//                 </div>

//                 {/* Top Widgets Row - More Compact */}
//                 <div style={{
//                     display: 'grid',
//                     gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
//                     gap: '16px',
//                     marginBottom: '32px'
//                 }}>
//                     <WeatherWidget />
//                     <TopNewsWidget />
//                     <MarketsWidget />
//                 </div>

//                 {/* Smart Insights - New Component */}
//                 {/* <SmartInsights /> */}

//                 {/* Alerts & Quick Actions */}
//                 <AlertsSuggestions />
//                 <QuickActions />

//                 {/* Main Content Grid */}
//                 <div style={{
//                     display: 'grid',
//                     gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
//                     gap: '24px',
//                     marginBottom: '32px'
//                 }}>
//                     <UpcomingActivities />
//                     <RecentActivity />
//                 </div>

//                 {/* Secondary Content Grid */}
//                 <div style={{
//                     display: 'grid',
//                     gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
//                     gap: '24px',
//                     marginBottom: '32px'
//                 }}>
//                     <TasksOverview />
//                     <ProductivityStats />
//                 </div>

//                 {/* Finance and Health Row */}
//                 <div style={{
//                     display: 'grid',
//                     gridTemplateColumns: '2fr 1fr',
//                     gap: '24px',
//                     // '@media (max-width: 1024px)': {
//                     //     gridTemplateColumns: '1fr'
//                     // }
//                 }}>
//                     <FinanceSnapshot />
//                     <HealthPulse />
//                 </div>
//             </main>

//             <style>{`
//         @keyframes fadeInUp {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         @keyframes slideIn {
//           from {
//             opacity: 0;
//             transform: translateX(-20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateX(0);
//           }
//         }

//         @keyframes pulse {
//           0%, 100% {
//             transform: scale(1);
//             opacity: 1;
//           }
//           50% {
//             transform: scale(1.05);
//             opacity: 0.8;
//           }
//         }

//         @keyframes glow {
//           0%, 100% {
//             box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
//           }
//           50% {
//             box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
//           }
//         }

//         .card-hover {
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//         }

//         .card-hover:hover {
//           transform: translateY(-4px);
//           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
//         }

//         .gradient-text {
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//         }

//         .animate-delay-1 { animation-delay: 0.1s; }
//         .animate-delay-2 { animation-delay: 0.2s; }
//         .animate-delay-3 { animation-delay: 0.3s; }
//         .animate-delay-4 { animation-delay: 0.4s; }
//       `}</style>
//         </div>
//     );
// };

// export default Dashboard;


'use client';
import React, { useEffect, useState } from 'react';
import {
    Layout,
    Card,
    Button,
    Progress,
    Badge,
    Avatar,
    Input,
    Upload,
    Tag,
    Row,
    Col,
    Typography,
    Space,
    Divider
} from 'antd';
import {
    SearchOutlined,
    BellOutlined,
    CalendarOutlined,
    PlusOutlined,
    FileTextOutlined,
    StarOutlined,
    StarFilled,
    CloudUploadOutlined,
    CloudOutlined,
    // TrendingUpOutlined,
    ExclamationCircleOutlined,
    BulbOutlined,
    RobotOutlined,
    HeartOutlined,
    FireOutlined,
    EyeOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

function App() {
    const [currentDate, setCurrentDate] = useState('');
    const [budgetProgress, setBudgetProgress] = useState({
        needs: 0,
        wants: 0,
        savings: 0
    });
    const [activities, setActivities] = useState([
        { id: 1, name: 'Tax Return 2024.pdf', description: 'Added 2 hours ago • Finance Hub', color: '#1890ff', starred: false },
        { id: 2, name: 'Monthly Budget.xlsx', description: 'Viewed 5 hours ago • Finance Hub', color: '#52c41a', starred: true },
        { id: 3, name: 'Passport Scan.jpg', description: 'Added yesterday • Documents', color: '#722ed1', starred: false },
        { id: 4, name: 'Insurance Policy.pdf', description: 'Added 3 days ago • Documents', color: '#f5222d', starred: false },
        { id: 5, name: 'Travel Itinerary.doc', description: 'Viewed 1 week ago • Travel Hub', color: '#faad14', starred: false },
    ]);

    useEffect(() => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateString = new Date().toLocaleDateString('en-US');
        setCurrentDate(dateString);

        // Animate progress bars
        setTimeout(() => {
            setBudgetProgress({
                needs: 83,
                wants: 76,
                savings: 100
            });
        }, 500);

        // Add fade-in animations
        const sections = document.querySelectorAll('.fade-section');
        // sections.forEach((section, index) => {
        //     const element = section;
        //     element.style.opacity = '0';
        //     element.style.transform = 'translateY(20px)';

        //     setTimeout(() => {
        //         element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        //         element.style.opacity = '1';
        //         element.style.transform = 'translateY(0)';
        //     }, index * 100);
        // });
    }, []);

    const toggleStar = (id: any) => {
        setActivities(activities.map(activity =>
            activity.id === id ? { ...activity, starred: !activity.starred } : activity
        ));
    };

    const uploadProps = {
        name: 'file',
        multiple: true,
        showUploadList: false,
        beforeUpload: () => false,
        onChange: (info: any) => {
            console.log('Files:', info.fileList);
        },
    };

    return (
        <Layout style={{ minHeight: '100vw', backgroundColor: '#f5f5f5', marginTop: 55 }}>
            {/* Header */}
            {/* <Header style={{
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e8e8e8',
                padding: '0 24px',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#1890ff',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                        }}>
                            D
                        </div>
                        <Title level={4} style={{ margin: 0, color: '#262626' }}>Dockly</Title>
                        <div style={{ display: 'flex', gap: '24px', marginLeft: '32px' }}>
                            <Text style={{ color: '#1890ff', fontWeight: 500, cursor: 'pointer' }}>Dashboard</Text>
                            <Text style={{ color: '#8c8c8c', cursor: 'pointer' }}>Hubs</Text>
                            <Text style={{ color: '#8c8c8c', cursor: 'pointer' }}>Utilities</Text>
                            <Text style={{ color: '#8c8c8c', cursor: 'pointer' }}>Documents</Text>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Button type="text" icon={<SearchOutlined />} />
                        <Badge dot style={{ backgroundColor: '#f5222d' }}>
                            <Button type="text" icon={<BellOutlined />} />
                        </Badge>
                        <Avatar style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}>JS</Avatar>
                    </div>
                </div>
            </Header> */}

            <Content style={{ padding: '24px', maxWidth: '1300px', margin: '0 auto', width: '100%' }}>
                {/* Welcome Section */}
                <div className="fade-section" style={{ marginBottom: '24px' }}>
                    <Title level={2} style={{ margin: 0, color: '#262626' }}>Good morning, John!</Title>
                    <Text style={{ color: '#8c8c8c' }}>{currentDate}</Text>
                </div>

                {/* Top Widgets */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col xs={24} md={8}>
                        <Card
                            className="fade-section"
                            style={{
                                background: 'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease',
                            }}
                            bodyStyle={{ padding: '16px' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div>
                                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 500 }}>Weather</Text>
                                    <br />
                                    <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}>Ashburn, VA</Text>
                                </div>
                                <CloudOutlined style={{ color: 'rgba(255,255,255,0.8)', fontSize: '24px' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <Text style={{ color: 'white', fontSize: '32px', fontWeight: 'bold' }}>72°F</Text>
                                    <br />
                                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>Partly Cloudy</Text>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>H: 78° L: 65°</Text>
                                    <br />
                                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>20% rain</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card
                            className="fade-section"
                            style={{
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease',
                            }}
                            bodyStyle={{ padding: '16px' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <Text style={{ fontSize: '14px', fontWeight: 500, color: '#262626' }}>Top News</Text>
                                <FileTextOutlined style={{ color: '#bfbfbf' }} />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ borderLeft: '2px solid #1890ff', paddingLeft: '12px', marginBottom: '8px' }}>
                                    <Text style={{ fontSize: '12px', fontWeight: 500, color: '#262626', display: 'block' }}>Fed Announces Rate Decision</Text>
                                    <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>2 hours ago</Text>
                                </div>
                                <div style={{ borderLeft: '2px solid #d9d9d9', paddingLeft: '12px' }}>
                                    <Text style={{ fontSize: '12px', fontWeight: 500, color: '#262626', display: 'block' }}>Tech Giants Report Earnings</Text>
                                    <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>5 hours ago</Text>
                                </div>
                            </div>
                            <Text style={{ fontSize: '12px', color: '#1890ff', cursor: 'pointer' }}>View all news →</Text>
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card
                            className="fade-section"
                            style={{
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease',
                            }}
                            bodyStyle={{ padding: '16px' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <Text style={{ fontSize: '14px', fontWeight: 500, color: '#262626' }}>Markets</Text>
                                {/* <TrendingUpOutlined style={{ color: '#bfbfbf' }} /> */}
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <Text style={{ fontSize: '12px', fontWeight: 500 }}>S&P 500</Text>
                                    <div>
                                        <Text style={{ fontSize: '12px', fontWeight: 500, color: '#52c41a' }}>5,487.03</Text>
                                        <Text style={{ fontSize: '12px', color: '#52c41a', marginLeft: '4px' }}>↑ 0.85%</Text>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <Text style={{ fontSize: '12px', fontWeight: 500 }}>NASDAQ</Text>
                                    <div>
                                        <Text style={{ fontSize: '12px', fontWeight: 500, color: '#52c41a' }}>17,862.31</Text>
                                        <Text style={{ fontSize: '12px', color: '#52c41a', marginLeft: '4px' }}>↑ 1.24%</Text>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ fontSize: '12px', fontWeight: 500 }}>DOW</Text>
                                    <div>
                                        <Text style={{ fontSize: '12px', fontWeight: 500, color: '#f5222d' }}>39,308.00</Text>
                                        <Text style={{ fontSize: '12px', color: '#f5222d', marginLeft: '4px' }}>↓ 0.22%</Text>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Alerts Section */}
                <Card className="fade-section" style={{ marginBottom: '24px', borderRadius: '12px' }}>
                    <Title level={5} style={{ margin: '0 0 16px 0' }}>Alerts & Suggestions</Title>
                    <Row gutter={[12, 12]}>
                        <Col xs={24} md={8}>
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#fff2f0',
                                border: '1px solid #ffccc7',
                                borderRadius: '8px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <ExclamationCircleOutlined style={{ color: '#f5222d', marginTop: '2px', marginRight: '8px' }} />
                                    <div>
                                        <Text style={{ fontSize: '14px', fontWeight: 500, color: '#a8071a', display: 'block' }}>Password Security Alert</Text>
                                        <Text style={{ fontSize: '12px', color: '#cf1322' }}>3 accounts using weak passwords</Text>
                                        <br />
                                        <Button type="link" size="small" style={{ padding: 0, fontSize: '12px', color: '#f5222d' }}>Update Now →</Button>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={8}>
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#fffbf0',
                                border: '1px solid #ffe7ba',
                                borderRadius: '8px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <BulbOutlined style={{ color: '#faad14', marginTop: '2px', marginRight: '8px' }} />
                                    <div>
                                        <Text style={{ fontSize: '14px', fontWeight: 500, color: '#ad6800', display: 'block' }}>Save on Subscriptions</Text>
                                        <Text style={{ fontSize: '12px', color: '#d48806' }}>Bundle Netflix & Hulu to save $5/month</Text>
                                        <br />
                                        <Button type="link" size="small" style={{ padding: 0, fontSize: '12px', color: '#faad14' }}>Learn More →</Button>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={8}>
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#f6ffed',
                                border: '1px solid #b7eb8f',
                                borderRadius: '8px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <RobotOutlined style={{ color: '#1890ff', marginTop: '2px', marginRight: '8px' }} />
                                    <div>
                                        <Text style={{ fontSize: '14px', fontWeight: 500, color: '#135200', display: 'block' }}>AI Suggestion</Text>
                                        <Text style={{ fontSize: '12px', color: '#389e0d' }}>Set up auto-pay for recurring bills</Text>
                                        <br />
                                        <Button type="link" size="small" style={{ padding: 0, fontSize: '12px', color: '#1890ff' }}>Set Up →</Button>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* Quick Actions */}
                <Card className="fade-section" style={{ marginBottom: '24px', borderRadius: '12px' }}>
                    <Title level={5} style={{ margin: '0 0 12px 0' }}>Quick Actions</Title>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                        <Button
                            style={{
                                backgroundColor: '#e6f7ff',
                                borderColor: '#91d5ff',
                                color: '#1890ff',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease',
                                padding: "40px"
                            }}
                            icon={<CalendarOutlined />}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.backgroundColor = '#bae7ff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.backgroundColor = '#e6f7ff';
                            }}
                        >
                            Add Event
                        </Button>
                        <Button
                            style={{
                                backgroundColor: '#f6ffed',
                                borderColor: '#b7eb8f',
                                color: '#52c41a',
                                borderRadius: '8px',
                                padding: "40px",
                                transition: 'all 0.2s ease'
                            }}
                            icon={<PlusOutlined />}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.backgroundColor = '#d9f7be';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.backgroundColor = '#f6ffed';
                            }}
                        >
                            Add Task
                        </Button>
                        <Button
                            style={{
                                backgroundColor: '#fffbf0',
                                borderColor: '#ffe7ba',
                                color: '#faad14',
                                borderRadius: '8px',
                                padding: "40px",
                                transition: 'all 0.2s ease'
                            }}
                            icon={<FileTextOutlined />}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.backgroundColor = '#fff1b8';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.backgroundColor = '#fffbf0';
                            }}
                        >
                            Add Note
                        </Button>
                        <Button
                            style={{
                                backgroundColor: '#f9f0ff',
                                borderColor: '#d3adf7',
                                color: '#722ed1',
                                borderRadius: '8px',
                                padding: "40px",
                                transition: 'all 0.2s ease'
                            }}
                            icon={<StarOutlined />}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.backgroundColor = '#efdbff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.backgroundColor = '#f9f0ff';
                            }}
                        >
                            Add Bookmark
                        </Button>
                        <div style={{ flex: '1', minWidth: '200px' }}>
                            <Dragger
                                {...uploadProps}
                                style={{
                                    border: '2px dashed #d9d9d9',
                                    borderRadius: '8px',
                                    backgroundColor: 'transparent',
                                    padding: '16px',
                                    textAlign: 'center'
                                }}
                            >
                                <CloudUploadOutlined style={{ fontSize: '24px', color: '#bfbfbf', marginBottom: '4px' }} />
                                <Text style={{ fontSize: '12px', color: '#8c8c8c', display: 'block' }}>Drag & Drop Files</Text>
                            </Dragger>
                        </div>
                    </div>
                </Card>

                <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
                    {/* Upcoming Activities */}
                    <Col xs={24} lg={12}>
                        <Card className="fade-section" style={{ borderRadius: '12px', height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <Title level={5} style={{ margin: 0 }}>Upcoming Activities</Title>
                                <Text style={{ fontSize: '12px', color: '#1890ff', cursor: 'pointer' }}>View Calendar →</Text>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <Text style={{ fontSize: '12px', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today - Thursday, June 19</Text>
                                <div style={{ marginTop: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', padding: '12px', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s ease' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <div style={{ width: '4px', height: '48px', backgroundColor: '#1890ff', borderRadius: '2px', marginRight: '12px' }}></div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <Text style={{ fontSize: '14px', fontWeight: 500, color: '#262626', display: 'block' }}>Team Standup Meeting</Text>
                                                    <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>Video Conference - Zoom</Text>
                                                </div>
                                                <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>9:00 AM</Text>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'flex-start', padding: '12px', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s ease' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <div style={{ width: '4px', height: '48px', backgroundColor: '#52c41a', borderRadius: '2px', marginRight: '12px' }}></div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <Text style={{ fontSize: '14px', fontWeight: 500, color: '#262626', display: 'block' }}>Doctor's Appointment</Text>
                                                    <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>Annual Checkup - Dr. Smith</Text>
                                                </div>
                                                <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>2:00 PM</Text>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'flex-start', padding: '12px', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s ease' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <div style={{ width: '4px', height: '48px', backgroundColor: '#faad14', borderRadius: '2px', marginRight: '12px' }}></div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <Text style={{ fontSize: '14px', fontWeight: 500, color: '#262626', display: 'block' }}>Mortgage Payment Due</Text>
                                                    <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>Chase Bank - $1,450.00</Text>
                                                </div>
                                                <Tag color="orange" style={{ fontSize: '12px' }}>Due Today</Tag>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Text style={{ fontSize: '12px', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Next 7 Days</Text>
                                <div style={{ marginTop: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                                        <div style={{ width: '40px', height: '40px', backgroundColor: '#f5f5f5', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                                            <Text style={{ fontSize: '12px', fontWeight: 'bold' }}>20</Text>
                                            <Text style={{ fontSize: '12px' }}>Jun</Text>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <Text style={{ fontSize: '14px', fontWeight: 500, display: 'block' }}>Car Insurance</Text>
                                            <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>Progressive - $132.50</Text>
                                        </div>
                                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>Tomorrow</Text>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                                        <div style={{ width: '40px', height: '40px', backgroundColor: '#f5f5f5', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                                            <Text style={{ fontSize: '12px', fontWeight: 'bold' }}>23</Text>
                                            <Text style={{ fontSize: '12px' }}>Jun</Text>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <Text style={{ fontSize: '14px', fontWeight: 500, display: 'block' }}>Sarah's Birthday</Text>
                                            <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>Family Event</Text>
                                        </div>
                                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>in 4 days</Text>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
                                        <div style={{ width: '40px', height: '40px', backgroundColor: '#f5f5f5', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                                            <Text style={{ fontSize: '12px', fontWeight: 'bold' }}>25</Text>
                                            <Text style={{ fontSize: '12px' }}>Jun</Text>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <Text style={{ fontSize: '14px', fontWeight: 500, display: 'block' }}>Internet Bill</Text>
                                            <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>Xfinity - $89.99</Text>
                                        </div>
                                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>in 6 days</Text>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Recent Activity */}
                    <Col xs={24} lg={12}>
                        <Card className="fade-section" style={{ borderRadius: '12px', height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <Title level={5} style={{ margin: 0 }}>Recent Activity</Title>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Button type="text" size="small" style={{ fontSize: '12px', color: '#8c8c8c' }}>All</Button>
                                    <Button type="text" size="small" style={{ fontSize: '12px', color: '#1890ff', fontWeight: 500 }}>Documents</Button>
                                    <Button type="text" size="small" style={{ fontSize: '12px', color: '#8c8c8c' }}>Favorites</Button>
                                </div>
                            </div>

                            <div>
                                {activities.map((activity) => (
                                    <div key={activity.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            backgroundColor: activity.color + '20',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px'
                                        }}>
                                            <FileTextOutlined style={{ color: activity.color }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <Text style={{ fontSize: '14px', fontWeight: 500, color: '#262626', display: 'block' }}>{activity.name}</Text>
                                            <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>{activity.description}</Text>
                                        </div>
                                        <Button
                                            type="text"
                                            icon={activity.starred ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined style={{ color: '#bfbfbf' }} />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleStar(activity.id);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Finance and Health Row */}
                <Row gutter={[24, 24]}>
                    {/* Finance Snapshot */}
                    <Col xs={24} lg={16}>
                        <Card className="fade-section" style={{ borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <Title level={5} style={{ margin: 0 }}>Finance Snapshot</Title>
                                <Text style={{ fontSize: '12px', color: '#1890ff', cursor: 'pointer' }}>View Details →</Text>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <Text style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '8px', display: 'block' }}>Account Activity (Last 7 days)</Text>
                                <Row gutter={[12, 12]}>
                                    <Col span={8} style={{ textAlign: 'center' }}>
                                        <Text style={{ fontSize: '18px', fontWeight: 600, color: '#262626', display: 'block' }}>$12,847</Text>
                                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>Total Balance</Text>
                                    </Col>
                                    <Col span={8} style={{ textAlign: 'center' }}>
                                        <Text style={{ fontSize: '18px', fontWeight: 600, color: '#52c41a', display: 'block' }}>+$2,340</Text>
                                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>Income</Text>
                                    </Col>
                                    <Col span={8} style={{ textAlign: 'center' }}>
                                        <Text style={{ fontSize: '18px', fontWeight: 600, color: '#f5222d', display: 'block' }}>-$1,827</Text>
                                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>Expenses</Text>
                                    </Col>
                                </Row>
                            </div>

                            <div>
                                <Text style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '8px', display: 'block' }}>Budget Progress (50/30/20 Rule)</Text>
                                <div style={{ marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                        <span>Needs (50%)</span>
                                        <span>$1,250 / $1,500</span>
                                    </div>
                                    <Progress percent={budgetProgress.needs} strokeColor="#1890ff" showInfo={false} />
                                </div>
                                <div style={{ marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                        <span>Wants (30%)</span>
                                        <span>$680 / $900</span>
                                    </div>
                                    <Progress percent={budgetProgress.wants} strokeColor="#52c41a" showInfo={false} />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                        <span>Savings (20%)</span>
                                        <span>$600 / $600</span>
                                    </div>
                                    <Progress percent={budgetProgress.savings} strokeColor="#722ed1" showInfo={false} />
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Health Pulse */}
                    <Col xs={24} lg={8}>
                        <Card className="fade-section" style={{ borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <Title level={5} style={{ margin: 0 }}>Health Pulse</Title>
                                <Text style={{ fontSize: '12px', color: '#52c41a' }}>Connected</Text>
                            </div>

                            <Row gutter={[12, 12]} style={{ marginBottom: '16px' }}>
                                <Col span={12}>
                                    <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fafafa', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '20px', color: '#1890ff', marginBottom: '4px' }}>🚶</div>
                                        <Text style={{ fontSize: '18px', fontWeight: 600, display: 'block' }}>7,842</Text>
                                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>Steps</Text>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fafafa', borderRadius: '8px' }}>
                                        <HeartOutlined style={{ fontSize: '20px', color: '#f5222d', marginBottom: '4px' }} />
                                        <Text style={{ fontSize: '18px', fontWeight: 600, display: 'block' }}>72</Text>
                                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>BPM</Text>
                                    </div>
                                </Col>
                            </Row>

                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', marginRight: '4px' }}>🌙</span>
                                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>Sleep</Text>
                                    </div>
                                    <Text style={{ fontSize: '12px', fontWeight: 500 }}>7h 23m</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <FireOutlined style={{ fontSize: '12px', color: '#bfbfbf', marginRight: '4px' }} />
                                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>Calories</Text>
                                    </div>
                                    <Text style={{ fontSize: '12px', fontWeight: 500 }}>1,847 cal</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', marginRight: '4px' }}>💧</span>
                                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>Water</Text>
                                    </div>
                                    <Text style={{ fontSize: '12px', fontWeight: 500 }}>5/8 glasses</Text>
                                </div>
                            </div>

                            <Button type="link" style={{ width: '100%', fontSize: '12px', color: '#1890ff', padding: 0 }}>
                                View Health Dashboard →
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
}

export default App;