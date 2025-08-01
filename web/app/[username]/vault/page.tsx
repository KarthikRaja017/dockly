
// 'use client';
// import React, { useState, useEffect } from 'react';
// import WifiOutlined from '@ant-design/icons/WifiOutlined';
// import DisconnectOutlined from '@ant-design/icons/DisconnectOutlined';
// import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
// import CheckCircleTwoTone from '@ant-design/icons/CheckCircleTwoTone';
// import CloseCircleTwoTone from '@ant-design/icons/CloseCircleTwoTone';
// import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
// import EyeOutlined from '@ant-design/icons/EyeOutlined';
// import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';
// import CopyOutlined from '@ant-design/icons/CopyOutlined';
// import LinkOutlined from '@ant-design/icons/LinkOutlined';
// import UserOutlined from '@ant-design/icons/UserOutlined';
// import GlobalOutlined from '@ant-design/icons/GlobalOutlined';
// import StarFilled from '@ant-design/icons/StarFilled';
// import SearchOutlined from '@ant-design/icons/SearchOutlined';
// import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
// import PlusOutlined from '@ant-design/icons/PlusOutlined';
// import ExclamationCircleOutlined from '@ant-design/icons/ExclamationCircleOutlined';
// import DatabaseOutlined from '@ant-design/icons/DatabaseOutlined';
// import RiseOutlined from '@ant-design/icons/RiseOutlined';
// import UnlockOutlined from '@ant-design/icons/UnlockOutlined';
// import CloseOutlined from '@ant-design/icons/CloseOutlined';
// import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
// import { Button, Input, Spin, Card, Statistic, Tabs, Form, message, Space, Badge } from 'antd';
// import { PasswordItem as PasswordItemType, apiClient } from '../../../services/api';
// import { socketManager } from '../../../services/socket';
// import { AlertTriangle, Wifi, WifiOff, Shield, ShieldCheck, ShieldX, LogOut, Database, TrendingUp, Star, Globe, ExternalLink, User, Copy, EyeOff, Eye, RefreshCw, Plus, Search, Unlock } from 'lucide-react';
// import { useGlobalLoading } from '../../loadingContext';

// // Message Component
// interface MessageProps {
//     message: string;
//     type: 'success' | 'error';
//     onClose: () => void;
// }

// const Message: React.FC<MessageProps> = ({ message, type, onClose }) => {
//     useEffect(() => {
//         const timer = setTimeout(onClose, 5000);
//         return () => clearTimeout(timer);
//     }, [onClose]);

//     return (
//         <div style={{
//             position: 'fixed',
//             top: '16px',
//             right: '16px',
//             zIndex: 1000,
//             padding: '16px',
//             borderRadius: '8px',
//             boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '12px',
//             backgroundColor: type === 'success' ? '#f0fff4' : '#fff1f0',
//             color: type === 'success' ? '#2f855a' : '#c53030',
//             border: `1px solid ${type === 'success' ? '#c6f6d5' : '#feb2b2'}`
//         }}>
//             {type === 'success' ? (
//                 <CheckCircleOutlined style={{ fontSize: '20px' }} />
//             ) : (
//                 <AlertTriangle style={{ fontSize: '20px' }} />
//             )}
//             <span style={{ fontWeight: 500 }}>{message}</span>
//             <Button type="text" onClick={onClose} icon={<CloseOutlined style={{ fontSize: '16px' }} />} />
//         </div>
//     );
// };

// // Status Bar Component
// interface StatusBarProps {
//     isConnected: boolean;
//     isLoggedIn: boolean;
//     vaultStatus: 'locked' | 'unlocked' | 'unknown';
//     onLogout: () => Promise<void>;
// }

// const StatusBar: React.FC<StatusBarProps> = ({
//     isConnected,
//     isLoggedIn,
//     vaultStatus,
//     onLogout
// }) => {
//     return (
//         <div style={{
//             borderBottom: '1px solid #e8e8e8',
//             background: 'rgba(255,255,255,0.95)',
//             padding: '16px 24px',
//             position: 'sticky',
//             top: 0,
//             zIndex: 40,
//             boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
//         }}>
//             <div style={{
//                 maxWidth: '1200px',
//                 margin: '0 auto',
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center'
//             }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
//                     <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a202c' }}>
//                         🔐 Dockly Bitwarden Vault
//                     </h1>
//                     <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                             {isConnected ? (
//                                 <Wifi style={{ fontSize: '16px', color: '#48bb78' }} />
//                             ) : (
//                                 <WifiOff style={{ fontSize: '16px', color: '#c53030' }} />
//                             )}
//                             <span style={{
//                                 fontSize: '14px',
//                                 fontWeight: 500,
//                                 color: isConnected ? '#48bb78' : '#c53030'
//                             }}>
//                                 {isConnected ? 'Connected' : 'Disconnected'}
//                             </span>
//                         </div>

//                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                             <Shield style={{
//                                 fontSize: '16px',
//                                 color: isLoggedIn ? '#48bb78' : '#a0aec0'
//                             }} />
//                             <span style={{
//                                 fontSize: '14px',
//                                 fontWeight: 500,
//                                 color: isLoggedIn ? '#48bb78' : '#718096'
//                             }}>
//                                 {isLoggedIn ? 'Authenticated' : 'Not Authenticated'}
//                             </span>
//                         </div>

//                         {isLoggedIn && (
//                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                                 {vaultStatus === 'unlocked' ? (
//                                     <ShieldCheck style={{ fontSize: '16px', color: '#48bb78' }} />
//                                 ) : (
//                                     <ShieldX style={{ fontSize: '16px', color: '#c53030' }} />
//                                 )}
//                                 <span style={{
//                                     fontSize: '14px',
//                                     fontWeight: 500,
//                                     color: vaultStatus === 'unlocked' ? '#48bb78' : '#c53030'
//                                 }}>
//                                     {vaultStatus === 'unlocked' ? 'Vault Unlocked' : 'Vault Locked'}
//                                 </span>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
//                     <span style={{ fontSize: '14px', color: '#718096', fontWeight: 500 }}>
//                         Real-time sync enabled
//                     </span>
//                     {isLoggedIn && (
//                         <Button
//                             onClick={onLogout}
//                             icon={<LogOut style={{ fontSize: '16px' }} />}
//                             style={{
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: '8px',
//                                 padding: '8px 16px',
//                                 fontSize: '14px',
//                                 fontWeight: 500,
//                                 color: '#4a5568',
//                                 border: '1px solid #e2e8f0',
//                                 borderRadius: '8px',
//                                 background: '#fff',
//                                 cursor: 'pointer'
//                             }}
//                         >
//                             Logout
//                         </Button>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// // Password Stats Component
// interface PasswordStatsProps {
//     stats: { total: number; strong: number; weak: number };
// }

// const PasswordStats: React.FC<PasswordStatsProps> = ({ stats }) => {
//     const strengthPercentage = stats.total > 0 ? Math.round((stats.strong / stats.total) * 100) : 0;

//     return (
//         <div style={{
//             display: 'grid',
//             gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
//             gap: '24px',
//             marginBottom: '32px'
//         }}>
//             <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
//                 <Statistic
//                     title="Total Passwords"
//                     value={stats.total}
//                     suffix="items"
//                     prefix={<Database style={{ color: '#3182ce' }} />}
//                     valueStyle={{ color: '#1a202c', fontSize: '32px', fontWeight: 700 }}
//                 />
//             </Card>

//             <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
//                 <Statistic
//                     title="Strong Passwords"
//                     value={stats.strong}
//                     suffix="secure"
//                     prefix={<Shield style={{ color: '#48bb78' }} />}
//                     valueStyle={{ color: '#48bb78', fontSize: '32px', fontWeight: 700 }}
//                 />
//             </Card>

//             <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
//                 <Statistic
//                     title="Weak Passwords"
//                     value={stats.weak}
//                     suffix="need attention"
//                     prefix={<AlertTriangle style={{ color: '#c53030' }} />}
//                     valueStyle={{ color: '#c53030', fontSize: '32px', fontWeight: 700 }}
//                 />
//             </Card>

//             <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
//                 <Statistic
//                     title="Security Score"
//                     value={strengthPercentage}
//                     suffix="% overall"
//                     prefix={<TrendingUp style={{ color: '#3182ce' }} />}
//                     valueStyle={{ color: '#3182ce', fontSize: '32px', fontWeight: 700 }}
//                 />
//             </Card>
//         </div>
//     );
// };

// // Password Item Component
// interface PasswordItemProps {
//     password: PasswordItemType;
//     onMessage: (message: string, type: 'success' | 'error') => void;
// }

// const PasswordItem: React.FC<PasswordItemProps> = ({ password, onMessage }) => {
//     const [showPassword, setShowPassword] = useState(false);
//     const [actualPassword, setActualPassword] = useState<string | null>(null);
//     const { loading, setLoading } = useGlobalLoading();

//     const getStrengthColor = (strength: number) => {
//         if (strength >= 80) return { color: '#48bb78', background: '#f0fff4' };
//         if (strength >= 60) return { color: '#d69e2e', background: '#fefcbf' };
//         return { color: '#c53030', background: '#fff1f0' };
//     };

//     const getStrengthLabel = (strength: number) => {
//         if (strength >= 80) return 'Strong';
//         if (strength >= 60) return 'Medium';
//         return 'Weak';
//     };

//     const getStrengthBarColor = (strength: number) => {
//         if (strength >= 80) return '#48bb78';
//         if (strength >= 60) return '#d69e2e';
//         return '#c53030';
//     };

//     const handleShowPassword = async () => {
//         if (!showPassword && !actualPassword) {
//             setLoading(true);
//             try {
//                 const result = await apiClient.getPassword(password.id);
//                 if (result.status === 1) {
//                     setActualPassword(result.payload.password || '');
//                     setShowPassword(true);
//                 } else {
//                     onMessage(result.message || 'Failed to retrieve password', 'error');
//                 }
//             } catch (error) {
//                 onMessage('Failed to connect to server', 'error');
//             } finally {
//                 setLoading(false);
//             }
//         } else {
//             setShowPassword(!showPassword);
//         }
//     };

//     const handleCopyPassword = async () => {
//         if (!actualPassword) {
//             setLoading(true);
//             try {
//                 const result = await apiClient.getPassword(password.id);
//                 if (result.status === 1) {
//                     await navigator.clipboard.writeText(result.payload.password || '');
//                     onMessage('Password copied to clipboard', 'success');
//                 } else {
//                     onMessage(result.message || 'Failed to retrieve password', 'error');
//                 }
//             } catch (error) {
//                 onMessage('Failed to copy password', 'error');
//             } finally {
//                 setLoading(false);
//             }
//         } else {
//             await navigator.clipboard.writeText(actualPassword);
//             onMessage('Password copied to clipboard', 'success');
//         }
//     };

//     const handleCopyUsername = async () => {
//         if (password.username) {
//             await navigator.clipboard.writeText(password.username);
//             onMessage('Username copied to clipboard', 'success');
//         }
//     };

//     const handleOpenWebsite = () => {
//         if (password.uri) {
//             window.open(password.uri, '_blank');
//         }
//     };

//     return (
//         <Card style={{
//             borderRadius: '12px',
//             border: '1px solid #e8e8e8',
//             marginBottom: '16px',
//             boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//             transition: 'all 0.2s',
//             padding: '24px'
//         }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
//                 <div style={{ flex: 1 }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
//                         <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a202c' }}>{password.name}</h3>
//                         {password.favorite && <Star style={{ fontSize: '16px', color: '#ecc94b' }} />}
//                     </div>

//                     {password.uri && (
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#718096', marginBottom: '8px' }}>
//                             <Globe style={{ fontSize: '16px' }} />
//                             <span style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{password.uri}</span>
//                             <Button
//                                 type="text"
//                                 onClick={handleOpenWebsite}
//                                 icon={<ExternalLink style={{ fontSize: '12px' }} />}
//                                 style={{ padding: '4px' }}
//                             />
//                         </div>
//                     )}

//                     {password.username && (
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#718096' }}>
//                             <User style={{ fontSize: '16px' }} />
//                             <span style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{password.username}</span>
//                             <Button
//                                 type="text"
//                                 onClick={handleCopyUsername}
//                                 icon={<Copy style={{ fontSize: '12px' }} />}
//                                 style={{ padding: '4px' }}
//                             />
//                         </div>
//                     )}
//                 </div>

//                 <Badge style={{ ...getStrengthColor(password.strength), padding: '4px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: 500 }}>
//                     {getStrengthLabel(password.strength)}
//                 </Badge>
//             </div>

//             <div style={{ marginBottom: '20px' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
//                     <span style={{ fontSize: '14px', fontWeight: 500, color: '#718096' }}>Password Strength</span>
//                     <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a202c' }}>{password.strength}%</span>
//                 </div>
//                 <div style={{ width: '100%', background: '#edf2f7', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
//                     <div style={{
//                         height: '8px',
//                         width: `${password.strength}%`,
//                         background: getStrengthBarColor(password.strength),
//                         borderRadius: '999px',
//                         transition: 'width 0.3s'
//                     }} />
//                 </div>
//             </div>

//             <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
//                 <div style={{
//                     flex: 1,
//                     fontFamily: 'monospace',
//                     background: '#f7fafc',
//                     padding: '12px 16px',
//                     borderRadius: '8px',
//                     border: '1px solid #e8e8e8',
//                     fontSize: '14px',
//                     color: '#4a5568'
//                 }}>
//                     {showPassword && actualPassword ? actualPassword : '••••••••••••'}
//                 </div>
//                 <Button
//                     onClick={handleShowPassword}
//                     disabled={loading}
//                     icon={loading ? <Spin size="small" /> : showPassword ? <EyeOff /> : <Eye />}
//                     style={{ padding: '12px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e8e8e8' }}
//                 />
//                 <Button
//                     onClick={handleCopyPassword}
//                     disabled={loading}
//                     icon={loading ? <Spin size="small" /> : <Copy />}
//                     style={{ padding: '12px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e8e8e8' }}
//                 />
//             </div>

//             <div style={{ marginTop: '16px', fontSize: '12px', color: '#718096' }}>
//                 Last modified: {new Date(password.lastModified).toLocaleDateString()}
//             </div>
//         </Card>
//     );
// };

// // Password Dashboard Component
// interface PasswordDashboardProps {
//     onMessage: (message: string, type: 'success' | 'error') => void;
// }

// const PasswordDashboard: React.FC<PasswordDashboardProps> = ({ onMessage }) => {
//     const [passwords, setPasswords] = useState<PasswordItemType[]>([]);
//     const [filteredPasswords, setFilteredPasswords] = useState<PasswordItemType[]>([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const { loading, setLoading } = useGlobalLoading();
//     const [syncing, setSyncing] = useState(false);
//     const [selectedFilter, setSelectedFilter] = useState<'all' | 'weak' | 'favorites'>('all');

//     useEffect(() => {
//         loadPasswords();

//         socketManager.on('items_updated', (data: any) => {
//             if (data.items) {
//                 setPasswords(data.items);
//                 onMessage(`${data.count} items synchronized`, 'success');
//             }
//         });

//         socketManager.on('sync_complete', () => {
//             setSyncing(false);
//             onMessage('Sync completed successfully', 'success');
//         });

//         socketManager.on('sync_error', (data: any) => {
//             setSyncing(false);
//             onMessage(data.message || 'Sync failed', 'error');
//         });

//         return () => {
//             socketManager.off('items_updated', () => { });
//             socketManager.off('sync_complete', () => { });
//             socketManager.off('sync_error', () => { });
//         };
//     }, [onMessage]);

//     useEffect(() => {
//         filterPasswords();
//     }, [passwords, searchTerm, selectedFilter]);

//     const loadPasswords = async () => {
//         try {
//             setLoading(true);
//             const result = await apiClient.getItems();
//             if (result.status === 1 && result.payload.items) {
//                 setPasswords(result.payload.items);
//             } else {
//                 onMessage(result.message || 'Failed to load passwords', 'error');
//             }
//         } catch (error) {
//             onMessage('Failed to connect to server', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const filterPasswords = () => {
//         let filtered = passwords;

//         if (searchTerm) {
//             filtered = filtered.filter(item =>
//                 item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 item.uri.toLowerCase().includes(searchTerm.toLowerCase())
//             );
//         }

//         switch (selectedFilter) {
//             case 'weak':
//                 filtered = filtered.filter(item => item.strength < 60);
//                 break;
//             case 'favorites':
//                 filtered = filtered.filter(item => item.favorite);
//                 break;
//         }

//         setFilteredPasswords(filtered);
//     };

//     const handleSync = async () => {
//         setSyncing(true);
//         onMessage('Starting sync...', 'success');
//         socketManager.emit('request_sync');

//         try {
//             const result = await apiClient.syncVault();
//             if (result.status === 1) {
//                 await loadPasswords();
//             } else {
//                 setSyncing(false);
//                 onMessage(result.message || 'Sync failed', 'error');
//             }
//         } catch (error) {
//             setSyncing(false);
//             onMessage('Failed to sync vault', 'error');
//         }
//     };

//     const getPasswordStats = () => {
//         const weak = passwords.filter(p => p.strength < 60).length;
//         const strong = passwords.filter(p => p.strength >= 80).length;
//         const total = passwords.length;
//         return { weak, strong, total };
//     };

//     const stats = getPasswordStats();

//     return (
//         <div style={{ padding: '32px 0' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
//                 <div>
//                     <h2 style={{ fontSize: '30px', fontWeight: 700, color: '#1a202c', marginBottom: '8px' }}>
//                         Password Vault
//                     </h2>
//                     <p style={{ fontSize: '18px', color: '#718096' }}>
//                         Manage and monitor your Bitwarden passwords
//                     </p>
//                 </div>
//                 <Space>
//                     <Button
//                         onClick={handleSync}
//                         disabled={syncing}
//                         icon={<RefreshCw style={{ fontSize: '16px', transform: syncing ? 'rotate(360deg)' : 'none', transition: 'transform 0.3s' }} />}
//                         style={{ borderRadius: '8px', border: '1px solid #e8e8e8' }}
//                     >
//                         {syncing ? 'Syncing...' : 'Sync Vault'}
//                     </Button>
//                     <Button
//                         type="primary"
//                         icon={<Plus style={{ fontSize: '16px' }} />}
//                         style={{ borderRadius: '8px', background: '#3182ce' }}
//                     >
//                         Add Password
//                     </Button>
//                 </Space>
//             </div>

//             <PasswordStats stats={stats} />

//             <Card style={{ borderRadius: '12px', marginBottom: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
//                 <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
//                     <div style={{ flex: 1, minWidth: '320px' }}>
//                         <Input
//                             prefix={<Search style={{ fontSize: '16px', color: '#a0aec0' }} />}
//                             placeholder="Search passwords..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             style={{ borderRadius: '8px', padding: '12px' }}
//                         />
//                     </div>
//                     <Space>
//                         <Button
//                             onClick={() => setSelectedFilter('all')}
//                             type={selectedFilter === 'all' ? 'primary' : 'default'}
//                             style={{
//                                 borderRadius: '8px',
//                                 background: selectedFilter === 'all' ? '#e6f3ff' : '#f7fafc',
//                                 color: selectedFilter === 'all' ? '#2b6cb0' : '#4a5568',
//                                 border: selectedFilter === 'all' ? '1px solid #bee3f8' : '1px solid #e8e8e8'
//                             }}
//                         >
//                             All
//                         </Button>
//                         <Button
//                             onClick={() => setSelectedFilter('weak')}
//                             type={selectedFilter === 'weak' ? 'primary' : 'default'}
//                             icon={<AlertTriangle style={{ fontSize: '16px' }} />}
//                             style={{
//                                 borderRadius: '8px',
//                                 background: selectedFilter === 'weak' ? '#fff1f0' : '#f7fafc',
//                                 color: selectedFilter === 'weak' ? '#c53030' : '#4a5568',
//                                 border: selectedFilter === 'weak' ? '1px solid #feb2b2' : '1px solid #e8e8e8'
//                             }}
//                         >
//                             Weak
//                         </Button>
//                         <Button
//                             onClick={() => setSelectedFilter('favorites')}
//                             type={selectedFilter === 'favorites' ? 'primary' : 'default'}
//                             style={{
//                                 borderRadius: '8px',
//                                 background: selectedFilter === 'favorites' ? '#fefcbf' : '#f7fafc',
//                                 color: selectedFilter === 'favorites' ? '#b7791f' : '#4a5568',
//                                 border: selectedFilter === 'favorites' ? '1px solid #faf089' : '1px solid #e8e8e8'
//                             }}
//                         >
//                             Favorites
//                         </Button>
//                     </Space>
//                 </div>
//             </Card>

//             <div>
//                 {filteredPasswords.length === 0 ? (
//                     <Card style={{
//                         borderRadius: '12px',
//                         border: '1px solid #e8e8e8',
//                         padding: '64px',
//                         textAlign: 'center',
//                         boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//                     }}>
//                         <Database style={{ fontSize: '64px', color: '#e2e8f0', marginBottom: '24px' }} />
//                         <p style={{ fontSize: '18px', color: '#718096' }}>
//                             {searchTerm || selectedFilter !== 'all'
//                                 ? 'No passwords match your filters'
//                                 : 'No passwords found in your vault'
//                             }
//                         </p>
//                     </Card>
//                 ) : (
//                     filteredPasswords.map((password) => (
//                         <PasswordItem key={password.id} password={password} onMessage={onMessage} />
//                     ))
//                 )}
//             </div>
//         </div>
//     );
// };

// // Login Form Component
// interface LoginFormProps {
//     onLogin: (email: string, password: string, code: string) => Promise<{ success: boolean; status: number; message?: string }>;
//     onUnlock: (password: string) => Promise<{ success: boolean; status: number; message?: string }>;
//     isLoggedIn: boolean;
//     vaultStatus: 'locked' | 'unlocked' | 'unknown';
//     onMessage: (message: string, type: 'success' | 'error') => void;
// }

// const LoginForm: React.FC<LoginFormProps> = ({
//     onLogin,
//     onUnlock,
//     isLoggedIn,
//     vaultStatus,
//     onMessage
// }) => {
//     const [form] = Form.useForm();
//     const [unlockForm] = Form.useForm();
//     const { loading, setLoading } = useGlobalLoading();
//     const [error, setError] = useState('');
//     const [showPassword, setShowPassword] = useState(false);
//     const [showUnlockPassword, setShowUnlockPassword] = useState(false);

//     const handleLogin = async (values: { email: string; password: string; code: string }) => {
//         setLoading(true);
//         setError('');

//         try {
//             const result = await onLogin(values.email, values.password, values.code);
//             if (result.status === 1) {
//                 onMessage('Successfully logged in to Bitwarden', 'success');
//             } else {
//                 setError(result.message || 'Login failed');
//             }
//         } catch (error) {
//             setError('Failed to connect to server');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleUnlock = async (values: { unlockPassword: string }) => {
//         setLoading(true);
//         setError('');

//         try {
//             const result = await onUnlock(values.unlockPassword);
//             if (result.status === 1) {
//                 onMessage('Vault unlocked successfully', 'success');
//             } else {
//                 setError(result.message || 'Unlock failed');
//             }
//         } catch (error) {
//             setError('Failed to unlock vault');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const currentTab = isLoggedIn && vaultStatus === 'locked' ? 'unlock' : 'login';

//     return (
//         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '18px 16px' }}>
//             <Card style={{ width: '100%', maxWidth: '700px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #e8e8e8' }}>
//                 <div style={{ padding: '12px', textAlign: 'center' }}>
//                     <div style={{
//                         width: '64px',
//                         height: '64px',
//                         background: 'linear-gradient(45deg, #3182ce, #805ad5)',
//                         borderRadius: '16px',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         margin: '0 auto 24px',
//                         boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
//                     }}>
//                         <Shield style={{ fontSize: '32px', color: '#fff' }} />
//                     </div>
//                     <h2 style={{ fontSize: '30px', fontWeight: 700, color: '#1a202c', marginBottom: '8px' }}>
//                         Bitwarden Access
//                     </h2>
//                     <p style={{ fontSize: '18px', color: '#718096' }}>
//                         Secure access to your password vault
//                     </p>
//                 </div>

//                 <div style={{ padding: '0 32px' }}>
//                     <Tabs
//                         activeKey={currentTab}
//                         items={[
//                             {
//                                 key: 'login',
//                                 label: 'Login',
//                                 disabled: isLoggedIn,
//                                 children: (
//                                     <Form form={form} onFinish={handleLogin} layout="vertical" style={{ marginTop: '24px' }}>
//                                         <Form.Item
//                                             name="email"
//                                             label="Email Address"
//                                             rules={[{ required: true, message: 'Please input your email!' }]}
//                                         >
//                                             <Input
//                                                 prefix={<User style={{ color: '#a0aec0' }} />}
//                                                 placeholder="Enter your Bitwarden email"
//                                                 disabled={loading}
//                                                 style={{ borderRadius: '8px', padding: '12px' }}
//                                             />
//                                         </Form.Item>

//                                         <Form.Item
//                                             name="password"
//                                             label="Master Password"
//                                             rules={[{ required: true, message: 'Please input your password!' }]}
//                                         >
//                                             <Input
//                                                 type={showPassword ? 'text' : 'password'}
//                                                 placeholder="Enter your master password"
//                                                 disabled={loading}
//                                                 style={{ borderRadius: '8px', padding: '12px' }}
//                                                 suffix={
//                                                     <Button
//                                                         type="text"
//                                                         onClick={() => setShowPassword(!showPassword)}
//                                                         icon={showPassword ? <EyeOff /> : <Eye />}
//                                                         style={{ color: '#a0aec0' }}
//                                                     />
//                                                 }
//                                             />
//                                         </Form.Item>
//                                         {/*                     
//                     <Form.Item
//                       name="code"
//                       label="Code"
//                       rules={[{ required: true, message: 'Please input your code!' }]}
//                     >
//                       <Input
//                         type={showPassword ? 'text' : 'text'}
//                         placeholder="Enter your verification code"
//                         disabled={loading}
//                         style={{ borderRadius: '8px', padding: '12px' }}
//                         suffix={
//                           <Button
//                             type="text"
//                             onClick={() => setShowPassword(!showPassword)}
//                             icon={showPassword ? <EyeOff /> : <Eye />}
//                             style={{ color: '#a0aec0' }}
//                           />
//                         }
//                       />
//                     </Form.Item> */}

//                                         <Form.Item>
//                                             <Button
//                                                 type="primary"
//                                                 htmlType="submit"
//                                                 loading={loading}
//                                                 icon={<Shield />}
//                                                 style={{ width: '100%', borderRadius: '8px', background: 'linear-gradient(90deg, #3182ce, #805ad5)', height: '40px' }}
//                                             >
//                                                 {loading ? 'Logging in...' : 'Login to Bitwarden'}
//                                             </Button>
//                                         </Form.Item>
//                                     </Form>
//                                 )
//                             },
//                             {
//                                 key: 'unlock',
//                                 label: 'Unlock Vault',
//                                 disabled: !isLoggedIn || vaultStatus === 'unlocked',
//                                 children: (
//                                     <Form form={unlockForm} onFinish={handleUnlock} layout="vertical" style={{ marginTop: '24px' }}>
//                                         <Form.Item
//                                             name="unlockPassword"
//                                             label="Master Password"
//                                             rules={[{ required: true, message: 'Please input your password!' }]}
//                                         >
//                                             <Input
//                                                 type={showUnlockPassword ? 'text' : 'password'}
//                                                 placeholder="Enter your master password to unlock"
//                                                 disabled={loading}
//                                                 style={{ borderRadius: '8px', padding: '12px' }}
//                                                 suffix={
//                                                     <Button
//                                                         type="text"
//                                                         onClick={() => setShowUnlockPassword(!showUnlockPassword)}
//                                                         icon={showUnlockPassword ? <EyeOff /> : <Eye />}
//                                                         style={{ color: '#a0aec0' }}
//                                                     />
//                                                 }
//                                             />
//                                         </Form.Item>

//                                         <Form.Item>
//                                             <Button
//                                                 type="primary"
//                                                 htmlType="submit"
//                                                 loading={loading}
//                                                 icon={<Unlock />}
//                                                 style={{ width: '100%', borderRadius: '8px', background: 'linear-gradient(90deg, #3182ce, #805ad5)', height: '40px' }}
//                                             >
//                                                 {loading ? 'Unlocking...' : 'Unlock Vault'}
//                                             </Button>
//                                         </Form.Item>
//                                     </Form>
//                                 )
//                             }
//                         ]}
//                         style={{ marginBottom: '24px' }}
//                         tabBarStyle={{ borderBottom: '2px solid #e8e8e8' }}
//                     />

//                     {error && (
//                         <Card style={{
//                             marginTop: '16px',
//                             background: '#fff1f0',
//                             border: '1px solid #feb2b2',
//                             borderRadius: '8px',
//                             padding: '16px'
//                         }}>
//                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                                 <AlertTriangle style={{ fontSize: '20px', color: '#c53030' }} />
//                                 <span style={{ fontWeight: 500, color: '#c53030' }}>{error}</span>
//                             </div>
//                         </Card>
//                     )}
//                 </div>

//                 <div style={{ padding: '24px', background: '#f7fafc', borderTop: '1px solid #e8e8e8' }}>
//                     <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
//                         <Shield style={{ fontSize: '20px', color: '#3182ce', marginTop: '2px' }} />
//                         <div>
//                             <p style={{ fontSize: '14px', fontWeight: 500, color: '#1a202c' }}>Secure Access</p>
//                             <p style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
//                                 Use your Bitwarden email, master password, and code for secure access to your vault.
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             </Card>
//         </div>
//     );
// };

// // Main App Component
// function App() {
//     const [isLoggedIn, setIsLoggedIn] = useState(false);
//     const [isConnected, setIsConnected] = useState(false);
//     const [vaultStatus, setVaultStatus] = useState<'locked' | 'unlocked' | 'unknown'>('unknown');
//     const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

//     useEffect(() => {
//         socketManager.connect();

//         socketManager.on('connected', (data: any) => {
//             setIsConnected(true);
//             showMessage(data.message, 'success');
//         });

//         socketManager.on('login_success', (data: any) => {
//             showMessage(data.message, 'success');
//             setIsLoggedIn(true);
//         });

//         socketManager.on('vault_unlocked', (data: any) => {
//             showMessage(data.message, 'success');
//             setVaultStatus('unlocked');
//         });

//         socketManager.on('sync_complete', (data: any) => {
//             showMessage(data.message, 'success');
//         });

//         socketManager.on('sync_error', (data: any) => {
//             showMessage(data.message, 'error');
//         });

//         checkStatus();

//         return () => {
//             socketManager.disconnect();
//         };
//     }, []);

//     const showMessage = (text: string, type: 'success' | 'error') => {
//         setMessage({ text, type });
//     };

//     const hideMessage = () => {
//         setMessage(null);
//     };

//     const checkStatus = async () => {
//         try {
//             const status = await apiClient.getStatus();
//             if (status.payload.status.status === 'authenticated') {
//                 setIsLoggedIn(true);
//                 setVaultStatus('unlocked');
//             } else if (status.payload.status.status === 'locked') {
//                 setIsLoggedIn(true);
//                 setVaultStatus('locked');
//             } else {
//                 setIsLoggedIn(false);
//                 setVaultStatus('unknown');
//             }
//         } catch (error) {
//             console.error('Failed to check status:', error);
//         }
//     };

//     const handleLogin = async (email: string, password: string, code: string) => {
//         try {
//             const result = await apiClient.login(email, password);
//             if (result.status === 1) {
//                 setIsLoggedIn(true);
//                 setVaultStatus('unlocked');
//                 return { success: true, status: 1 };
//             } else {
//                 return {
//                     success: false,
//                     status: 0,
//                     message: result.message
//                 };
//             }
//         } catch (error) {
//             return { success: false, status: 0, message: 'Failed to connect to server' };
//         }
//     };

//     const handleUnlock = async (password: string) => {
//         try {
//             const result = await apiClient.unlock(password);
//             if (result.status === 1) {
//                 setVaultStatus('unlocked');
//                 return { success: true, status: 1 };
//             } else {
//                 return { success: false, status: 0, message: result.message };
//             }
//         } catch (error) {
//             return { success: false, status: 0, message: 'Failed to unlock vault' };
//         }
//     };

//     const handleLogout = async () => {
//         try {
//             const result = await apiClient.logout();
//             if (result.status === 1) {
//                 setIsLoggedIn(false);
//                 setVaultStatus('unknown');
//                 setIsConnected(false);
//                 socketManager.disconnect();
//                 showMessage('Successfully logged out', 'success');
//             } else {
//                 showMessage(result.message || 'Failed to logout', 'error');
//             }
//         } catch (error) {
//             showMessage('Failed to connect to server', 'error');
//         }
//     };

//     return (
//         <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
//             {message && (
//                 <Message
//                     message={message.text}
//                     type={message.type}
//                     onClose={hideMessage}
//                 />
//             )}

//             <StatusBar
//                 isConnected={isConnected}
//                 isLoggedIn={isLoggedIn}
//                 vaultStatus={vaultStatus}
//                 onLogout={handleLogout}
//             />

//             <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
//                 {!isLoggedIn || vaultStatus === 'locked' ? (
//                     <LoginForm
//                         onLogin={handleLogin}
//                         onUnlock={handleUnlock}
//                         isLoggedIn={isLoggedIn}
//                         vaultStatus={vaultStatus}
//                         onMessage={showMessage}
//                     />
//                 ) : (
//                     <PasswordDashboard onMessage={showMessage} />
//                 )}
//             </div>
//         </div>
//     );
// }

// export default App;
// 'use client';
// import React, { useState, useEffect } from 'react';
// import WifiOutlined from '@ant-design/icons/WifiOutlined';
// import DisconnectOutlined from '@ant-design/icons/DisconnectOutlined';
// import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
// import CheckCircleTwoTone from '@ant-design/icons/CheckCircleTwoTone';
// import CloseCircleTwoTone from '@ant-design/icons/CloseCircleTwoTone';
// import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
// import EyeOutlined from '@ant-design/icons/EyeOutlined';
// import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';
// import CopyOutlined from '@ant-design/icons/CopyOutlined';
// import LinkOutlined from '@ant-design/icons/LinkOutlined';
// import UserOutlined from '@ant-design/icons/UserOutlined';
// import GlobalOutlined from '@ant-design/icons/GlobalOutlined';
// import StarFilled from '@ant-design/icons/StarFilled';
// import SearchOutlined from '@ant-design/icons/SearchOutlined';
// import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
// import PlusOutlined from '@ant-design/icons/PlusOutlined';
// import ExclamationCircleOutlined from '@ant-design/icons/ExclamationCircleOutlined';
// import DatabaseOutlined from '@ant-design/icons/DatabaseOutlined';
// import RiseOutlined from '@ant-design/icons/RiseOutlined';
// import UnlockOutlined from '@ant-design/icons/UnlockOutlined';
// import CloseOutlined from '@ant-design/icons/CloseOutlined';
// import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
// import AppstoreOutlined from '@ant-design/icons/AppstoreOutlined';
// import BarsOutlined from '@ant-design/icons/BarsOutlined';
// import { Button, Input, Spin, Card, Statistic, Tabs, Form, message, Space, Badge, Typography, List, Image, Row, Col, Switch } from 'antd';
// import { PasswordItem as PasswordItemType, apiClient } from '../../../services/api';
// import { socketManager } from '../../../services/socket';
// import { AlertTriangle, Wifi, WifiOff, Shield, ShieldCheck, ShieldX, LogOut, Database, TrendingUp, Star, Globe, ExternalLink, User, Copy, EyeOff, Eye, RefreshCw, Plus, Search, Unlock, Lock, Users, Smartphone } from 'lucide-react';
// import DocklyLoader from '../../../utils/docklyLoader';

// const { Title, Paragraph, Text } = Typography;

// // Message Component
// interface MessageProps {
//     message: string;
//     type: 'success' | 'error';
//     onClose: () => void;
// }

// const Message: React.FC<MessageProps> = ({ message, type, onClose }) => {
//     useEffect(() => {
//         const timer = setTimeout(onClose, 5000);
//         return () => clearTimeout(timer);
//     }, [onClose]);

//     return (
//         <div style={{
//             position: 'fixed',
//             top: '16px',
//             right: '16px',
//             zIndex: 1000,
//             padding: '16px',
//             borderRadius: '12px',
//             boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '12px',
//             backgroundColor: type === 'success' ? '#f0fff4' : '#fff1f0',
//             color: type === 'success' ? '#2f855a' : '#c53030',
//             border: `1px solid ${type === 'success' ? '#c6f6d5' : '#feb2b2'}`,
//             backdropFilter: 'blur(10px)'
//         }}>
//             {type === 'success' ? (
//                 <CheckCircleOutlined style={{ fontSize: '20px' }} />
//             ) : (
//                 <AlertTriangle style={{ fontSize: '20px' }} />
//             )}
//             <span style={{ fontWeight: 500 }}>{message}</span>
//             <Button type="text" onClick={onClose} icon={<CloseOutlined style={{ fontSize: '16px' }} />} />
//         </div>
//     );
// };

// // Status Bar Component
// interface StatusBarProps {
//     isConnected: boolean;
//     isLoggedIn: boolean;
//     vaultStatus: 'locked' | 'unlocked' | 'unknown';
//     onLogout: () => Promise<void>;
// }

// const StatusBar: React.FC<StatusBarProps> = ({
//     isConnected,
//     isLoggedIn,
//     vaultStatus,
//     onLogout
// }) => {
//     return (
//         <div style={{
//             borderBottom: '1px solid #e8e8e8',
//             background: 'rgba(255,255,255,0.95)',
//             padding: '16px 24px',
//             position: 'sticky',
//             top: 0,
//             zIndex: 40,
//             boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
//             backdropFilter: 'blur(10px)'
//         }}>
//             <div style={{
//                 maxWidth: '1200px',
//                 margin: '0 auto',
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center'
//             }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
//                     <h1 style={{ 
//                         fontSize: '24px', 
//                         fontWeight: 700, 
//                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                         WebkitBackgroundClip: 'text',
//                         WebkitTextFillColor: 'transparent',
//                         margin: 0
//                     }}>
//                         🔐 Dockly  Vault
//                     </h1>
//                     <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                             {isConnected ? (
//                                 <Wifi style={{ fontSize: '16px', color: '#48bb78' }} />
//                             ) : (
//                                 <WifiOff style={{ fontSize: '16px', color: '#c53030' }} />
//                             )}
//                             <span style={{
//                                 fontSize: '14px',
//                                 fontWeight: 500,
//                                 color: isConnected ? '#48bb78' : '#c53030'
//                             }}>
//                                 {isConnected ? 'Connected' : 'Disconnected'}
//                             </span>
//                         </div>

//                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                             <Shield style={{
//                                 fontSize: '16px',
//                                 color: isLoggedIn ? '#48bb78' : '#a0aec0'
//                             }} />
//                             <span style={{
//                                 fontSize: '14px',
//                                 fontWeight: 500,
//                                 color: isLoggedIn ? '#48bb78' : '#718096'
//                             }}>
//                                 {isLoggedIn ? 'Authenticated' : 'Not Authenticated'}
//                             </span>
//                         </div>

//                         {isLoggedIn && (
//                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                                 {vaultStatus === 'unlocked' ? (
//                                     <ShieldCheck style={{ fontSize: '16px', color: '#48bb78' }} />
//                                 ) : (
//                                     <ShieldX style={{ fontSize: '16px', color: '#c53030' }} />
//                                 )}
//                                 <span style={{
//                                     fontSize: '14px',
//                                     fontWeight: 500,
//                                     color: vaultStatus === 'unlocked' ? '#48bb78' : '#c53030'
//                                 }}>
//                                     {vaultStatus === 'unlocked' ? 'Vault Unlocked' : 'Vault Locked'}
//                                 </span>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
//                     <span style={{ fontSize: '14px', color: '#718096', fontWeight: 500 }}>
//                         Real-time sync enabled
//                     </span>
//                     {isLoggedIn && (
//                         <Button
//                             onClick={onLogout}
//                             icon={<LogOut style={{ fontSize: '16px' }} />}
//                             style={{
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: '8px',
//                                 padding: '8px 16px',
//                                 fontSize: '14px',
//                                 fontWeight: 500,
//                                 color: '#4a5568',
//                                 border: '1px solid #e2e8f0',
//                                 borderRadius: '8px',
//                                 background: '#fff',
//                                 cursor: 'pointer'
//                             }}
//                         >
//                             Logout
//                         </Button>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// // Password Stats Component
// interface PasswordStatsProps {
//     stats: { total: number; strong: number; weak: number };
// }

// const PasswordStats: React.FC<PasswordStatsProps> = ({ stats }) => {
//     const strengthPercentage = stats.total > 0 ? Math.round((stats.strong / stats.total) * 100) : 0;

//     return (
//         <div style={{
//             display: 'grid',
//             gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
//             gap: '24px',
//             marginBottom: '32px'
//         }}>
//             <Card style={{ 
//                 borderRadius: '16px', 
//                 boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
//                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                 border: 'none'
//             }}>
//                 <Statistic
//                     title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Total Passwords</span>}
//                     value={stats.total}
//                     suffix={<span style={{ color: 'rgba(255,255,255,0.7)' }}>items</span>}
//                     prefix={<Database style={{ color: '#fff' }} />}
//                     valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}
//                 />
//             </Card>

//             <Card style={{ 
//                 borderRadius: '16px', 
//                 boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
//                 background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
//                 border: 'none'
//             }}>
//                 <Statistic
//                     title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Strong Passwords</span>}
//                     value={stats.strong}
//                     suffix={<span style={{ color: 'rgba(255,255,255,0.7)' }}>secure</span>}
//                     prefix={<Shield style={{ color: '#fff' }} />}
//                     valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}
//                 />
//             </Card>

//             <Card style={{ 
//                 borderRadius: '16px', 
//                 boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
//                 background: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
//                 border: 'none'
//             }}>
//                 <Statistic
//                     title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Weak Passwords</span>}
//                     value={stats.weak}
//                     suffix={<span style={{ color: 'rgba(255,255,255,0.7)' }}>need attention</span>}
//                     prefix={<AlertTriangle style={{ color: '#fff' }} />}
//                     valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}
//                 />
//             </Card>

//             <Card style={{ 
//                 borderRadius: '16px', 
//                 boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
//                 background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
//                 border: 'none'
//             }}>
//                 <Statistic
//                     title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Security Score</span>}
//                     value={strengthPercentage}
//                     suffix={<span style={{ color: 'rgba(255,255,255,0.7)' }}>% overall</span>}
//                     prefix={<TrendingUp style={{ color: '#fff' }} />}
//                     valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}
//                 />
//             </Card>
//         </div>
//     );
// };

// // Password Item Component
// interface PasswordItemProps {
//     password: PasswordItemType;
//     onMessage: (message: string, type: 'success' | 'error') => void;
//     viewMode: 'list' | 'grid';
// }

// const PasswordItem: React.FC<PasswordItemProps> = ({ password, onMessage, viewMode }) => {
//     const [showPassword, setShowPassword] = useState(false);
//     const [actualPassword, setActualPassword] = useState<string | null>(null);
//     const [loading, setLoading] = useState(false);

//     const getStrengthColor = (strength: number) => {
//         if (strength >= 80) return { color: '#48bb78', background: '#f0fff4' };
//         if (strength >= 60) return { color: '#d69e2e', background: '#fefcbf' };
//         return { color: '#c53030', background: '#fff1f0' };
//     };

//     const getStrengthLabel = (strength: number) => {
//         if (strength >= 80) return 'Strong';
//         if (strength >= 60) return 'Medium';
//         return 'Weak';
//     };

//     const getStrengthBarColor = (strength: number) => {
//         if (strength >= 80) return '#48bb78';
//         if (strength >= 60) return '#d69e2e';
//         return '#c53030';
//     };

//     const handleShowPassword = async () => {
//         if (!showPassword && !actualPassword) {
//             setLoading(true);
//             try {
//                 const result = await apiClient.getPassword(password.id);
//                 if (result.status === 1) {
//                     setActualPassword(result.payload.password || '');
//                     setShowPassword(true);
//                 } else {
//                     onMessage(result.message || 'Failed to retrieve password', 'error');
//                 }
//             } catch (error) {
//                 onMessage('Failed to connect to server', 'error');
//             } finally {
//                 setLoading(false);
//             }
//         } else {
//             setShowPassword(!showPassword);
//         }
//     };

//     const handleCopyPassword = async () => {
//         if (!actualPassword) {
//             setLoading(true);
//             try {
//                 const result = await apiClient.getPassword(password.id);
//                 if (result.status === 1) {
//                     await navigator.clipboard.writeText(result.payload.password || '');
//                     onMessage('Password copied to clipboard', 'success');
//                 } else {
//                     onMessage(result.message || 'Failed to retrieve password', 'error');
//                 }
//             } catch (error) {
//                 onMessage('Failed to connect to server', 'error');
//             } finally {
//                 setLoading(false);
//             }
//         } else {
//             await navigator.clipboard.writeText(actualPassword);
//             onMessage('Password copied to clipboard', 'success');
//         }
//     };

//     const handleCopyUsername = async () => {
//         if (password.username) {
//             await navigator.clipboard.writeText(password.username);
//             onMessage('Username copied to clipboard', 'success');
//         }
//     };

//     const handleOpenWebsite = () => {
//         if (password.uri) {
//             window.open(password.uri, '_blank');
//         }
//     };

//     if (viewMode === 'grid') {
//         return (
//             <Card style={{
//                 borderRadius: '16px',
//                 border: '1px solid #e8e8e8',
//                 boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
//                 transition: 'all 0.3s ease',
//                 height: '100%',
//                 background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
//             }}>
//                 <div style={{ marginBottom: '16px' }}>
//                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
//                         <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1a202c', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                             {password.name}
//                         </h4>
//                         {password.favorite && <Star style={{ fontSize: '14px', color: '#ecc94b' }} />}
//                     </div>
//                     <Badge style={{ 
//                         ...getStrengthColor(password.strength), 
//                         padding: '2px 8px', 
//                         borderRadius: '12px', 
//                         fontSize: '11px', 
//                         fontWeight: 500 
//                     }}>
//                         {getStrengthLabel(password.strength)}
//                     </Badge>
//                 </div>

//                 <div style={{ marginBottom: '12px' }}>
//                     {password.username && (
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
//                             <User style={{ fontSize: '12px', color: '#718096' }} />
//                             <span style={{ fontSize: '12px', color: '#718096', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                                 {password.username}
//                             </span>
//                         </div>
//                     )}
//                     {password.uri && (
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//                             <Globe style={{ fontSize: '12px', color: '#718096' }} />
//                             <span style={{ fontSize: '12px', color: '#718096', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                                 {password.uri}
//                             </span>
//                         </div>
//                     )}
//                 </div>

//                 <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
//                     <Button
//                         size="small"
//                         onClick={handleShowPassword}
//                         disabled={loading}
//                         icon={loading ? <Spin size="small" /> : showPassword ? <EyeOff style={{ fontSize: '12px' }} /> : <Eye style={{ fontSize: '12px' }} />}
//                         style={{ borderRadius: '6px' }}
//                     />
//                     <Button
//                         size="small"
//                         onClick={handleCopyPassword}
//                         disabled={loading}
//                         icon={loading ? <Spin size="small" /> : <Copy style={{ fontSize: '12px' }} />}
//                         style={{ borderRadius: '6px' }}
//                     />
//                     {password.uri && (
//                         <Button
//                             size="small"
//                             onClick={handleOpenWebsite}
//                             icon={<ExternalLink style={{ fontSize: '12px' }} />}
//                             style={{ borderRadius: '6px' }}
//                         />
//                     )}
//                 </div>

//                 {showPassword && actualPassword && (
//                     <div style={{
//                         marginTop: '12px',
//                         fontFamily: 'monospace',
//                         background: 'rgba(255,255,255,0.8)',
//                         padding: '8px',
//                         borderRadius: '6px',
//                         fontSize: '12px',
//                         color: '#4a5568',
//                         wordBreak: 'break-all'
//                     }}>
//                         {actualPassword}
//                     </div>
//                 )}
//             </Card>
//         );
//     }

//     return (
//         <Card style={{
//             borderRadius: '16px',
//             border: '1px solid #e8e8e8',
//             marginBottom: '16px',
//             boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
//             transition: 'all 0.3s ease',
//             padding: '24px',
//             background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
//         }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
//                 <div style={{ flex: 1 }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
//                         <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a202c' }}>{password.name}</h3>
//                         {password.favorite && <Star style={{ fontSize: '16px', color: '#ecc94b' }} />}
//                     </div>

//                     {password.uri && (
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#718096', marginBottom: '8px' }}>
//                             <Globe style={{ fontSize: '16px' }} />
//                             <span style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{password.uri}</span>
//                             <Button
//                                 type="text"
//                                 onClick={handleOpenWebsite}
//                                 icon={<ExternalLink style={{ fontSize: '12px' }} />}
//                                 style={{ padding: '4px' }}
//                             />
//                         </div>
//                     )}

//                     {password.username && (
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#718096' }}>
//                             <User style={{ fontSize: '16px' }} />
//                             <span style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{password.username}</span>
//                             <Button
//                                 type="text"
//                                 onClick={handleCopyUsername}
//                                 icon={<Copy style={{ fontSize: '12px' }} />}
//                                 style={{ padding: '4px' }}
//                             />
//                         </div>
//                     )}
//                 </div>

//                 <Badge style={{ 
//                     ...getStrengthColor(password.strength), 
//                     padding: '4px 12px', 
//                     borderRadius: '20px', 
//                     fontSize: '12px', 
//                     fontWeight: 500 
//                 }}>
//                     {getStrengthLabel(password.strength)}
//                 </Badge>
//             </div>

//             <div style={{ marginBottom: '20px' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
//                     <span style={{ fontSize: '14px', fontWeight: 500, color: '#718096' }}>Password Strength</span>
//                     <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a202c' }}>{password.strength}%</span>
//                 </div>
//                 <div style={{ width: '100%', background: 'rgba(255,255,255,0.5)', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
//                     <div style={{
//                         height: '8px',
//                         width: `${password.strength}%`,
//                         background: getStrengthBarColor(password.strength),
//                         borderRadius: '10px',
//                         transition: 'width 0.3s'
//                     }} />
//                 </div>
//             </div>

//             <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
//                 <div style={{
//                     flex: 1,
//                     fontFamily: 'monospace',
//                     background: 'rgba(255,255,255,0.8)',
//                     padding: '12px 16px',
//                     borderRadius: '12px',
//                     border: '1px solid rgba(255,255,255,0.3)',
//                     fontSize: '14px',
//                     color: '#4a5568'
//                 }}>
//                     {showPassword && actualPassword ? actualPassword : '••••••••••••'}
//                 </div>
//                 <Button
//                     onClick={handleShowPassword}
//                     disabled={loading}
//                     icon={loading ? <Spin size="small" /> : showPassword ? <EyeOff /> : <Eye />}
//                     style={{ 
//                         padding: '12px', 
//                         background: 'rgba(255,255,255,0.8)', 
//                         borderRadius: '12px', 
//                         border: '1px solid rgba(255,255,255,0.3)' 
//                     }}
//                 />
//                 <Button
//                     onClick={handleCopyPassword}
//                     disabled={loading}
//                     icon={loading ? <Spin size="small" /> : <Copy />}
//                     style={{ 
//                         padding: '12px', 
//                         background: 'rgba(255,255,255,0.8)', 
//                         borderRadius: '12px', 
//                         border: '1px solid rgba(255,255,255,0.3)' 
//                     }}
//                 />
//             </div>

//             <div style={{ marginTop: '16px', fontSize: '12px', color: '#718096' }}>
//                 Last modified: {new Date(password.lastModified).toLocaleDateString()}
//             </div>
//         </Card>
//     );
// };

// // Password Dashboard Component
// interface PasswordDashboardProps {
//     onMessage: (message: string, type: 'success' | 'error') => void;
// }

// const PasswordDashboard: React.FC<PasswordDashboardProps> = ({ onMessage }) => {
//     const [passwords, setPasswords] = useState<PasswordItemType[]>([]);
//     const [filteredPasswords, setFilteredPasswords] = useState<PasswordItemType[]>([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [loading, setLoading] = useState(true);
//     const [syncing, setSyncing] = useState(false);
//     const [selectedFilter, setSelectedFilter] = useState<'all' | 'weak' | 'favorites'>('all');
//     const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

//     useEffect(() => {
//         loadPasswords();

//         socketManager.on('items_updated', (data: any) => {
//             if (data.items) {
//                 setPasswords(data.items);
//                 onMessage(`${data.count} items synchronized`, 'success');
//             }
//         });

//         socketManager.on('sync_complete', () => {
//             setSyncing(false);
//             onMessage('Sync completed successfully', 'success');
//         });

//         socketManager.on('sync_error', (data: any) => {
//             setSyncing(false);
//             onMessage(data.message || 'Sync failed', 'error');
//         });

//         return () => {
//             socketManager.off('items_updated', () => { });
//             socketManager.off('sync_complete', () => { });
//             socketManager.off('sync_error', () => { });
//         };
//     }, [onMessage]);

//     useEffect(() => {
//         filterPasswords();
//     }, [passwords, searchTerm, selectedFilter]);

//     const loadPasswords = async () => {
//         try {
//             setLoading(true);
//             const result = await apiClient.getItems();
//             if (result.status === 1 && result.payload.items) {
//                 setPasswords(result.payload.items);
//             } else {
//                 onMessage(result.message || 'Failed to load passwords', 'error');
//             }
//         } catch (error) {
//             onMessage('Failed to connect to server', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const filterPasswords = () => {
//         let filtered = passwords;

//         if (searchTerm) {
//             filtered = filtered.filter(item =>
//                 item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 item.uri.toLowerCase().includes(searchTerm.toLowerCase())
//             );
//         }

//         switch (selectedFilter) {
//             case 'weak':
//                 filtered = filtered.filter(item => item.strength < 60);
//                 break;
//             case 'favorites':
//                 filtered = filtered.filter(item => item.favorite);
//                 break;
//         }

//         setFilteredPasswords(filtered);
//     };

//     const handleSync = async () => {
//         setSyncing(true);
//         onMessage('Starting sync...', 'success');
//         socketManager.emit('request_sync');

//         try {
//             const result = await apiClient.syncVault();
//             if (result.status === 1) {
//                 await loadPasswords();
//             } else {
//                 setSyncing(false);
//                 onMessage(result.message || 'Sync failed', 'error');
//             }
//         } catch (error) {
//             setSyncing(false);
//             onMessage('Failed to sync vault', 'error');
//         }
//     };

//     const getPasswordStats = () => {
//         const weak = passwords.filter(p => p.strength < 60).length;
//         const strong = passwords.filter(p => p.strength >= 80).length;
//         const total = passwords.length;
//         return { weak, strong, total };
//     };

//     const stats = getPasswordStats();

//     if (loading) {
//         return (
//             <div style={{
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 minHeight: '384px',
//                 flexDirection: 'column',
//                 gap: '16px'
//             }}>
//                 <DocklyLoader />
//                 <span style={{ color: '#718096', fontSize: '18px' }}>Loading your passwords...</span>
//             </div>
//         );
//     }

//     return (
//         <div style={{ padding: '32px 0' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
//                 <div>
//                     <h2 style={{ 
//                         fontSize: '30px', 
//                         fontWeight: 700, 
//                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                         WebkitBackgroundClip: 'text',
//                         WebkitTextFillColor: 'transparent',
//                         marginBottom: '8px' 
//                     }}>
//                         Password Vault
//                     </h2>
//                     <p style={{ fontSize: '18px', color: '#718096' }}>
//                         Manage and monitor your Bitwarden passwords
//                     </p>
//                 </div>
//                 <Space>
//                     <Button
//                         onClick={handleSync}
//                         disabled={syncing}
//                         icon={<RefreshCw style={{ fontSize: '16px', transform: syncing ? 'rotate(360deg)' : 'none', transition: 'transform 0.3s' }} />}
//                         style={{ borderRadius: '12px', border: '1px solid #e8e8e8' }}
//                     >
//                         {syncing ? 'Syncing...' : 'Sync Vault'}
//                     </Button>
//                     <Button
//                         type="primary"
//                         icon={<Plus style={{ fontSize: '16px' }} />}
//                         style={{ 
//                             borderRadius: '12px', 
//                             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                             border: 'none'
//                         }}
//                     >
//                         Add Password
//                     </Button>
//                 </Space>
//             </div>

//             <PasswordStats stats={stats} />

//             <Card style={{ 
//                 borderRadius: '16px', 
//                 marginBottom: '32px', 
//                 boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
//                 background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
//             }}>
//                 <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
//                     <div style={{ flex: 1, minWidth: '320px' }}>
//                         <Input
//                             prefix={<Search style={{ fontSize: '16px', color: '#a0aec0' }} />}
//                             placeholder="Search passwords..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             style={{ borderRadius: '12px', padding: '12px' }}
//                         />
//                     </div>
//                     <Space>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                             <BarsOutlined style={{ fontSize: '16px', color: viewMode === 'list' ? '#667eea' : '#a0aec0' }} />
//                             <Switch
//                                 checked={viewMode === 'grid'}
//                                 onChange={(checked) => setViewMode(checked ? 'grid' : 'list')}
//                                 style={{ background: viewMode === 'grid' ? '#667eea' : '#d9d9d9' }}
//                             />
//                             <AppstoreOutlined style={{ fontSize: '16px', color: viewMode === 'grid' ? '#667eea' : '#a0aec0' }} />
//                         </div>
//                         <Button
//                             onClick={() => setSelectedFilter('all')}
//                             type={selectedFilter === 'all' ? 'primary' : 'default'}
//                             style={{
//                                 borderRadius: '12px',
//                                 background: selectedFilter === 'all' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.8)',
//                                 color: selectedFilter === 'all' ? '#fff' : '#4a5568',
//                                 border: 'none'
//                             }}
//                         >
//                             All
//                         </Button>
//                         <Button
//                             onClick={() => setSelectedFilter('weak')}
//                             type={selectedFilter === 'weak' ? 'primary' : 'default'}
//                             icon={<AlertTriangle style={{ fontSize: '16px' }} />}
//                             style={{
//                                 borderRadius: '12px',
//                                 background: selectedFilter === 'weak' ? 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)' : 'rgba(255,255,255,0.8)',
//                                 color: selectedFilter === 'weak' ? '#fff' : '#4a5568',
//                                 border: 'none'
//                             }}
//                         >
//                             Weak
//                         </Button>
//                         <Button
//                             onClick={() => setSelectedFilter('favorites')}
//                             type={selectedFilter === 'favorites' ? 'primary' : 'default'}
//                             icon={<Star style={{ fontSize: '16px' }} />}
//                             style={{
//                                 borderRadius: '12px',
//                                 background: selectedFilter === 'favorites' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'rgba(255,255,255,0.8)',
//                                 color: selectedFilter === 'favorites' ? '#fff' : '#4a5568',
//                                 border: 'none'
//                             }}
//                         >
//                             Favorites
//                         </Button>
//                     </Space>
//                 </div>
//             </Card>

//             <div>
//                 {filteredPasswords.length === 0 ? (
//                     <Card style={{
//                         borderRadius: '16px',
//                         border: '1px solid #e8e8e8',
//                         padding: '64px',
//                         textAlign: 'center',
//                         boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
//                         background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
//                     }}>
//                         <Database style={{ fontSize: '64px', color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }} />
//                         <p style={{ fontSize: '18px', color: '#718096' }}>
//                             {searchTerm || selectedFilter !== 'all'
//                                 ? 'No passwords match your filters'
//                                 : 'No passwords found in your vault'
//                             }
//                         </p>
//                     </Card>
//                 ) : viewMode === 'grid' ? (
//                     <div style={{
//                         display: 'grid',
//                         gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
//                         gap: '20px'
//                     }}>
//                         {filteredPasswords.map((password) => (
//                             <PasswordItem key={password.id} password={password} onMessage={onMessage} viewMode="grid" />
//                         ))}
//                     </div>
//                 ) : (
//                     filteredPasswords.map((password) => (
//                         <PasswordItem key={password.id} password={password} onMessage={onMessage} viewMode="list" />
//                     ))
//                 )}
//             </div>
//         </div>
//     );
// };

// // Login Form Component
// interface LoginFormProps {
//     onLogin: (email: string, password: string, code: string) => Promise<{ success: boolean; status: number; message?: string }>;
//     onUnlock: (password: string) => Promise<{ success: boolean; status: number; message?: string }>;
//     isLoggedIn: boolean;
//     vaultStatus: 'locked' | 'unlocked' | 'unknown';
//     onMessage: (message: string, type: 'success' | 'error') => void;
// }

// const LoginForm: React.FC<LoginFormProps> = ({
//     onLogin,
//     onUnlock,
//     isLoggedIn,
//     vaultStatus,
//     onMessage
// }) => {
//     const [form] = Form.useForm();
//     const [unlockForm] = Form.useForm();
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');

//     const handleLogin = async (values: { email: string; password: string; code: string }) => {
//         setLoading(true);
//         setError('');

//         try {
//             const result = await onLogin(values.email, values.password, values.code);
//             if (result.status === 1) {
//                 onMessage('Successfully logged in to Bitwarden Vault', 'success');
//             } else {
//                 setError(result.message || 'Login failed');
//             }
//         } catch (error) {
//             setError('Failed to connect to server');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleUnlock = async (values: { unlockPassword: string }) => {
//         setLoading(true);
//         setError('');

//         try {
//             const result = await onUnlock(values.unlockPassword);
//             if (result.status === 1) {
//                 onMessage('Vault unlocked successfully', 'success');
//             } else {
//                 setError(result.message || 'Unlock failed');
//             }
//         } catch (error) {
//             setError('Failed to unlock vault');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const currentTab = isLoggedIn && vaultStatus === 'locked' ? 'unlock' : 'login';

//     return (
//         <div style={{ 
//             display: 'flex', 
//             justifyContent: 'center', 
//             alignItems: 'center', 
//             minHeight: '100vh', 
//             padding: '20px',
//             background: '#f7fafc',
//             position: 'relative'
//         }}>
//             <Card style={{ 
//                 width: '100%', 
//                 // maxWidth: '500px', 
//                 borderRadius: '24px', 
//                 boxShadow: '0 20px 60px rgba(0,0,0,0.3)', 
//                 border: 'none',
//                 background: 'rgba(255,255,255,0.95)',
//                 backdropFilter: 'blur(20px)',
//                 zIndex: 1
//             }}>
//                 <div style={{ padding: '32px', textAlign: 'center' }}>
//                     <div style={{
//                         width: '100px',
//                         height: '100px',
//                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                         borderRadius: '50%',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         margin: '0 auto 24px',
//                         boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
//                     }}>
//                         <Shield style={{ fontSize: '50px', color: '#fff' }} />
//                     </div>
//                     <Title level={1} style={{ 
//                         fontSize: '32px', 
//                         fontWeight: 700, 
//                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                         WebkitBackgroundClip: 'text',
//                         WebkitTextFillColor: 'transparent',
//                         marginBottom: '8px' 
//                     }}>
//                         Connect Your Bitwarden  Vault with Dockly
//                     </Title>
//                     <Paragraph style={{ fontSize: '18px', color: '#718096', marginBottom: '32px' }}>
//                         Let's get your password  working seamlessly with Dockly for safe and easy account access.
//                     </Paragraph>
//                     <Paragraph style={{ 
//                         backgroundColor: '#f0fff4',
//                         color: '#2f855a',
//                         padding: '12px',
//                         borderRadius: '8px',
//                         marginBottom: '32px'
//                     }}>
//                         <CheckCircleTwoTone style={{ marginRight: '8px' }} /> Your passwords stay private. Dockly never stores your actual passwords - we integrate with 1Password securely.
//                     </Paragraph>
//                 </div>

//                 <div style={{ padding: '0 32px 32px' }}>
//                     <Tabs
//                         activeKey={currentTab}
//                         items={[
//                             {
//                                 key: 'login',
//                                 label: <span style={{ fontSize: '16px', fontWeight: 500 }}>Login</span>,
//                                 disabled: isLoggedIn,
//                                 children: (
//                                     <Form form={form} onFinish={handleLogin} layout="vertical" style={{ marginTop: '24px' }}>
//                                         <Form.Item
//                                             name="email"
//                                             label={<span style={{ fontSize: '14px', fontWeight: 500, color: '#4a5568' }}>Email Address</span>}
//                                             rules={[{ required: true, message: 'Please input your email!' }]}
//                                         >
//                                             <Input
//                                                 prefix={<UserOutlined style={{ color: '#a0aec0' }} />}
//                                                 placeholder="Enter your email"
//                                                 disabled={loading}
//                                                 style={{ 
//                                                     borderRadius: '12px', 
//                                                     padding: '12px 16px',
//                                                     fontSize: '16px',
//                                                     border: '2px solid #e8e8e8',
//                                                     background: 'rgba(255,255,255,0.8)'
//                                                 }}
//                                             />
//                                         </Form.Item>

//                                         <Form.Item
//                                             name="password"
//                                             label={<span style={{ fontSize: '14px', fontWeight: 500, color: '#4a5568' }}>Master Password</span>}
//                                             rules={[{ required: true, message: 'Please input your password!' }]}
//                                         >
//                                             <Input.Password
//                                                 placeholder="Enter your master password"
//                                                 disabled={loading}
//                                                 style={{ 
//                                                     borderRadius: '12px', 
//                                                     padding: '12px 16px',
//                                                     fontSize: '16px',
//                                                     border: '2px solid #e8e8e8',
//                                                     background: 'rgba(255,255,255,0.8)'
//                                                 }}
//                                                 iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
//                                             />
//                                         </Form.Item>

//                                         <Form.Item
//                                             name="code"
//                                             label={<span style={{ fontSize: '14px', fontWeight: 500, color: '#4a5568' }}>Two-Factor Code (if enabled)</span>}
//                                         >
//                                             <Input
//                                                 placeholder="Enter your 2FA code"
//                                                 disabled={loading}
//                                                 style={{ 
//                                                     borderRadius: '12px', 
//                                                     padding: '12px 16px',
//                                                     fontSize: '16px',
//                                                     border: '2px solid #e8e8e8',
//                                                     background: 'rgba(255,255,255,0.8)'
//                                                 }}
//                                             />
//                                         </Form.Item>

//                                         <Form.Item style={{ marginTop: '32px' }}>
//                                             <Button
//                                                 type="primary"
//                                                 htmlType="submit"
//                                                 loading={loading}
//                                                 icon={<UnlockOutlined />}
//                                                 style={{ 
//                                                     width: '100%', 
//                                                     borderRadius: '12px', 
//                                                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
//                                                     height: '50px',
//                                                     fontSize: '16px',
//                                                     fontWeight: 600,
//                                                     border: 'none',
//                                                     boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
//                                                 }}
//                                             >
//                                                 {loading ? 'Logging in...' : 'Login to Vault'}
//                                             </Button>
//                                         </Form.Item>
//                                     </Form>
//                                 )
//                             },
//                             {
//                                 key: 'unlock',
//                                 label: <span style={{ fontSize: '16px', fontWeight: 500 }}>Unlock Vault</span>,
//                                 disabled: !isLoggedIn || vaultStatus === 'unlocked',
//                                 children: (
//                                     <Form form={unlockForm} onFinish={handleUnlock} layout="vertical" style={{ marginTop: '24px' }}>
//                                         <Form.Item
//                                             name="unlockPassword"
//                                             label={<span style={{ fontSize: '14px', fontWeight: 500, color: '#4a5568' }}>Master Password</span>}
//                                             rules={[{ required: true, message: 'Please input your password!' }]}
//                                         >
//                                             <Input.Password
//                                                 placeholder="Enter your master password"
//                                                 disabled={loading}
//                                                 style={{ 
//                                                     borderRadius: '12px', 
//                                                     padding: '12px 16px',
//                                                     fontSize: '16px',
//                                                     border: '2px solid #e8e8e8',
//                                                     background: 'rgba(255,255,255,0.8)'
//                                                 }}
//                                                 iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
//                                             />
//                                         </Form.Item>

//                                         <Form.Item style={{ marginTop: '32px' }}>
//                                             <Button
//                                                 type="primary"
//                                                 htmlType="submit"
//                                                 loading={loading}
//                                                 icon={<UnlockOutlined />}
//                                                 style={{ 
//                                                     width: '100%', 
//                                                     borderRadius: '12px', 
//                                                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
//                                                     height: '50px',
//                                                     fontSize: '16px',
//                                                     fontWeight: 600,
//                                                     border: 'none',
//                                                     boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
//                                                 }}
//                                             >
//                                                 {loading ? 'Unlocking...' : 'Unlock Vault'}
//                                             </Button>
//                                         </Form.Item>
//                                     </Form>
//                                 )
//                             }
//                         ]}
//                         style={{ marginBottom: '24px' }}
//                         tabBarStyle={{ 
//                             borderBottom: '2px solid #e8e8e8',
//                             marginBottom: '0'
//                         }}
//                     />

//                     {error && (
//                         <Card style={{
//                             marginTop: '20px',
//                             background: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
//                             border: 'none',
//                             borderRadius: '12px',
//                             padding: '16px'
//                         }}>
//                             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//                                 <ExclamationCircleOutlined style={{ fontSize: '20px', color: '#fff' }} />
//                                 <span style={{ fontWeight: 500, color: '#fff', fontSize: '14px' }}>{error}</span>
//                             </div>
//                         </Card>
//                     )}
//                 </div>

//                 <div style={{ 
//                     padding: '20px 32px', 
//                     background: 'rgba(247, 250, 252, 0.8)', 
//                     borderTop: '1px solid rgba(232, 232, 232, 0.5)', 
//                     textAlign: 'center',
//                     borderBottomLeftRadius: '24px',
//                     borderBottomRightRadius: '24px'
//                 }}>
//                     <Paragraph style={{ fontSize: '12px', color: '#718096', margin: 0 }}>
//                         Need help? <a href="https://support.bitwarden.com" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', fontWeight: 500 }}>Contact Support</a>
//                     </Paragraph>
//                 </div>
//             </Card>
//         </div>
//     );
// };

// // Get Started Component
// interface GetStartedProps {
//     onStart: () => void;
// }

// const GetStarted: React.FC<GetStartedProps> = ({ onStart }) => {
//     const features = [
//         {
//             title: 'Secure Password Storage',
//             description: 'Store all your passwords in an encrypted vault with military-grade security protocols.',
//             icon: <Lock style={{ fontSize: '32px', color: '#667eea' }} />
//         },
//         {
//             title: 'Cross-Platform Sync',
//             description: 'Access your passwords seamlessly across all your devices with real-time synchronization.',
//             icon: <RefreshCw style={{ fontSize: '32px', color: '#11998e' }} />
//         },
//         {
//             title: 'Password Health Monitoring',
//             description: 'Monitor password strength and get alerts for weak or compromised credentials.',
//             icon: <Shield style={{ fontSize: '32px', color: '#fc466b' }} />
//         },
//         {
//             title: 'Two-Factor Authentication',
//             description: 'Add an extra layer of security with built-in 2FA support for your accounts.',
//             icon: <Smartphone style={{ fontSize: '32px', color: '#f093fb' }} />
//         }
//     ];

//     const steps = [
//         'Connect your Bitwarden account with secure authentication',
//         'Import and organize your existing passwords automatically',
//         'Monitor password health and security across all accounts',
//         'Access your vault securely from any device, anywhere'
//     ];

//     return (
//         <div style={{ 
//             maxWidth: '1200px', 
//             margin: '0 auto', 
//             padding: '40px 20px', 
//             minHeight: '100vh', 
//             background: '#f7fafc', 
//             position: 'relative'
//         }}>
//             {/* Hero Section with Left Image, Right Text */}
//             <Row gutter={[48, 48]} align="middle" style={{ marginBottom: '80px' }}>
//                 <Col xs={24} lg={10}>
//                     <div style={{ textAlign: 'center' }}>
//                         <img 
//                             src="/manager/vaulthub.webp" 
//                             alt="Vault Hub" 
//                             style={{ 
//                                 width: '280px', 
//                                 height: '180px', 
//                                 objectFit: 'cover', 
//                                 borderRadius: '2px',
//                                 marginLeft: '30px',
//                                 marginTop: '60px',
//                                 boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
//                             }} 
//                         />
//                     </div>
//                 </Col>

//                 <Col xs={24} lg={14}>
//                     <div style={{ color: '#1a202c' }}>
//                         <Title level={1} style={{ 
//                             fontSize: '48px', 
//                             fontWeight: 700, 
//                             color: '#1a202c',
//                             marginBottom: '16px',
//                             lineHeight: '1.2'
//                         }}>
//                             Welcome to Your Bitwarden Vault Hub
//                         </Title>
//                         <Paragraph style={{ 
//                             fontSize: '20px', 
//                             color: '#718096',
//                             marginBottom: '32px',
//                             lineHeight: '1.6'
//                         }}>
//                             Your central dashboard for managing Bitwarden Vault and securing your digital life with enterprise-grade password management.
//                         </Paragraph>
//                         <Button
//                             type="primary"
//                             size="large"
//                             onClick={onStart}
//                             style={{ 
//                                 borderRadius: '12px', 
//                                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
//                                 height: '56px',
//                                 fontSize: '18px',
//                                 fontWeight: 600,
//                                 border: 'none',
//                                 color: '#fff',
//                                 boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
//                             }}
//                         >
//                             Get Started Now
//                         </Button>
//                     </div>
//                 </Col>
//             </Row>

//             {/* Features Grid */}
//             <div style={{
//                 display: 'grid',
//                 gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))',
//                 gap: '32px',
//                 marginBottom: '80px'
//             }}>
//                 {features.map((feature, index) => (
//                     <Card key={index} style={{ 
//                         borderRadius: '20px', 
//                         boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
//                         background: 'rgba(255,255,255,0.95)',
//                         border: 'none',
//                         backdropFilter: 'blur(20px)',
//                         padding: '24px',
//                         textAlign: 'center',
//                         transition: 'transform 0.3s ease'
//                     }}>
//                         <div style={{ marginBottom: '20px' }}>
//                             {feature.icon}
//                         </div>
//                         <Title level={3} style={{ 
//                             fontSize: '20px', 
//                             fontWeight: 600, 
//                             color: '#1a202c', 
//                             marginBottom: '12px' 
//                         }}>
//                             {feature.title}
//                         </Title>
//                         <Paragraph style={{ 
//                             fontSize: '15px', 
//                             color: '#718096',
//                             lineHeight: '1.6'
//                         }}>
//                             {feature.description}
//                         </Paragraph>
//                     </Card>
//                 ))}
//             </div>

//             {/* How it Works Section - Reverted to Original */}
//             <Card style={{ 
//                 borderRadius: '24px', 
//                 background: 'rgba(146, 191, 244, 0.95)',
//                 border: 'none',
//                 backdropFilter: 'blur(20px)',
//                 padding: '48px',
//                 marginBottom: '60px'
//             }}>
//                 <div style={{ marginBottom: '48px' }}>
//                     <Title level={2} style={{ 
//                         fontSize: '36px', 
//                         fontWeight: 700, 
//                         color: '#040810ff',
//                         marginBottom: '16px' 
//                     }}>
//                         How does it work?
//                     </Title>
//                     <Paragraph style={{ 
//                         fontSize: '18px', 
//                         color: '#718096',
//                     }}>
//                         To set up your Vault Hub, we'll help you connect your existing password managers to Dockly. This allows you to:
//                     </Paragraph>
//                 </div>

//                 <List
//                     dataSource={steps}
//                     renderItem={(item, index) => (
//                         <List.Item style={{ 
//                             border: 'none', 
//                             padding: '16px 0',
//                             borderBottom: index < steps.length - 1 ? '1px solid #e8e8e8' : 'none'
//                         }}>
//                             <List.Item.Meta
//                                 avatar={
//                                     <div style={{
//                                         borderRadius: '50%',
//                                         background: 'linear-gradient(135deg, #020305ff 0%, #131214ff 100%)',
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         justifyContent: 'center',
//                                         color: '#fff',
//                                         fontSize: '16px',
//                                         fontWeight: 600
//                                     }}>
//                                         {}
//                                     </div>
//                                 }
//                                 description={
//                                     <Text style={{ 
//                                         fontSize: '16px', 
//                                         color: '#4a5568',
//                                         lineHeight: '1.6'
//                                     }}>
//                                         {item}
//                                     </Text>
//                                 }
//                             />
//                         </List.Item>
//                     )}
//                     style={{ marginBottom: '32px' }}
//                 />

//                 <div style={{ 
//                     borderRadius: '16px',
//                     backgroundColor: '#77b2e2ff',
//                     color: '#fff'
//                 }}>
//                     <Paragraph style={{ 
//                         fontSize: '14px', 
//                         color: 'rgba(14, 13, 13, 0.9)',
//                     }}>
//                         🔒 Dockly never stores your actual passwords - it provides a secure interface to your trusted password managers.
//                     </Paragraph>
//                 </div>
//             </Card>
//         </div>
//     );
// };

// // Main App Component
// function App() {
//     const [isLoggedIn, setIsLoggedIn] = useState(false);
//     const [isConnected, setIsConnected] = useState(false);
//     const [vaultStatus, setVaultStatus] = useState<'locked' | 'unlocked' | 'unknown'>('unknown');
//     const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
//     const [showGetStarted, setShowGetStarted] = useState(true);

//     useEffect(() => {
//         socketManager.connect();

//         socketManager.on('connected', (data: any) => {
//             setIsConnected(true);
//             showMessage(data.message, 'success');
//         });

//         socketManager.on('login_success', (data: any) => {
//             showMessage(data.message, 'success');
//             setIsLoggedIn(true);
//             setShowGetStarted(false);
//         });

//         socketManager.on('vault_unlocked', (data: any) => {
//             showMessage(data.message, 'success');
//             setVaultStatus('unlocked');
//         });

//         socketManager.on('sync_complete', (data: any) => {
//             showMessage(data.message, 'success');
//         });

//         socketManager.on('sync_error', (data: any) => {
//             showMessage(data.message, 'error');
//         });

//         checkStatus();

//         return () => {
//             socketManager.disconnect();
//         };
//     }, []);

//     const showMessage = (text: string, type: 'success' | 'error') => {
//         setMessage({ text, type });
//     };

//     const hideMessage = () => {
//         setMessage(null);
//     };

//     const checkStatus = async () => {
//         try {
//             const status = await apiClient.getStatus();
//             if (status.payload.status.status === 'authenticated') {
//                 setIsLoggedIn(true);
//                 setVaultStatus('unlocked');
//                 setShowGetStarted(false);
//             } else if (status.payload.status.status === 'locked') {
//                 setIsLoggedIn(true);
//                 setVaultStatus('locked');
//                 setShowGetStarted(false);
//             } else {
//                 setIsLoggedIn(false);
//                 setVaultStatus('unknown');
//             }
//         } catch (error) {
//             console.error('Failed to check status:', error);
//         }
//     };

//     const handleLogin = async (email: string, password: string, code: string) => {
//         try {
//             const result = await apiClient.login(email, password);
//             if (result.status === 1) {
//                 setIsLoggedIn(true);
//                 setVaultStatus('unlocked');
//                 setShowGetStarted(false);
//                 return { success: true, status: 1 };
//             } else {
//                 return {
//                     success: false,
//                     status: 0,
//                     message: result.message
//                 };
//             }
//         } catch (error) {
//             return { success: false, status: 0, message: 'Failed to connect to server' };
//         }
//     };

//     const handleUnlock = async (password: string) => {
//         try {
//             const result = await apiClient.unlock(password);
//             if (result.status === 1) {
//                 setVaultStatus('unlocked');
//                 return { success: true, status: 1 };
//             } else {
//                 return { success: false, status: 0, message: result.message };
//             }
//         } catch (error) {
//             return { success: false, status: 0, message: 'Failed to unlock vault' };
//         }
//     };

//     const handleLogout = async () => {
//         try {
//             const result = await apiClient.logout();
//             if (result.status === 1) {
//                 setIsLoggedIn(false);
//                 setVaultStatus('unknown');
//                 setIsConnected(false);
//                 setShowGetStarted(true);
//                 socketManager.disconnect();
//                 showMessage('Successfully logged out', 'success');
//             } else {
//                 showMessage(result.message || 'Failed to logout', 'error');
//             }
//         } catch (error) {
//             showMessage('Failed to connect to server', 'error');
//         }
//     };

//     const handleStart = () => {
//         setShowGetStarted(false);
//     };

//     return (
//         <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
//             {message && (
//                 <Message
//                     message={message.text}
//                     type={message.type}
//                     onClose={hideMessage}
//                 />
//             )}

//             <StatusBar
//                 isConnected={isConnected}
//                 isLoggedIn={isLoggedIn}
//                 vaultStatus={vaultStatus}
//                 onLogout={handleLogout}
//             />

//             <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
//                 {showGetStarted ? (
//                     <GetStarted onStart={handleStart} />
//                 ) : !isLoggedIn || vaultStatus === 'locked' ? (
//                     <LoginForm
//                         onLogin={handleLogin}
//                         onUnlock={handleUnlock}
//                         isLoggedIn={isLoggedIn}
//                         vaultStatus={vaultStatus}
//                         onMessage={showMessage}
//                     />
//                 ) : (
//                     <PasswordDashboard onMessage={showMessage} />
//                 )}
//             </div>
//         </div>
//     );
// }

// export default App;

'use client';
import React, { useState, useEffect } from 'react';
import WifiOutlined from '@ant-design/icons/WifiOutlined';
import DisconnectOutlined from '@ant-design/icons/DisconnectOutlined';
import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
import CheckCircleTwoTone from '@ant-design/icons/CheckCircleTwoTone';
import CloseCircleTwoTone from '@ant-design/icons/CloseCircleTwoTone';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import LinkOutlined from '@ant-design/icons/LinkOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import GlobalOutlined from '@ant-design/icons/GlobalOutlined';
import StarFilled from '@ant-design/icons/StarFilled';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import ExclamationCircleOutlined from '@ant-design/icons/ExclamationCircleOutlined';
import DatabaseOutlined from '@ant-design/icons/DatabaseOutlined';
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import UnlockOutlined from '@ant-design/icons/UnlockOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import AppstoreOutlined from '@ant-design/icons/AppstoreOutlined';
import BarsOutlined from '@ant-design/icons/BarsOutlined';
import { Button, Input, Spin, Card, Statistic, Tabs, Form, message, Space, Badge, Typography, List, Image, Row, Col, Switch, Dropdown, Menu } from 'antd';
import { PasswordItem as PasswordItemType, apiClient } from '../../../services/api';
import { socketManager } from '../../../services/socket';
import { AlertTriangle, Wifi, WifiOff, Shield, ShieldCheck, ShieldX, LogOut, Database, TrendingUp, Star, Globe, ExternalLink, User, Copy, EyeOff, Eye, RefreshCw, Plus, Search, Unlock, Lock, Users, Smartphone } from 'lucide-react';
import DocklyLoader from '../../../utils/docklyLoader';
import { DownOutlined, EllipsisOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

// Message Component
interface MessageProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

const Message: React.FC<MessageProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            zIndex: 1000,
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: type === 'success' ? '#f0fff4' : '#fff1f0',
            color: type === 'success' ? '#2f855a' : '#c53030',
            border: `1px solid ${type === 'success' ? '#c6f6d5' : '#feb2b2'}`,
            backdropFilter: 'blur(10px)'
        }}>
            {type === 'success' ? (
                <CheckCircleOutlined style={{ fontSize: '20px' }} />
            ) : (
                <AlertTriangle style={{ fontSize: '20px' }} />
            )}
            <span style={{ fontWeight: 500 }}>{message}</span>
            <Button type="text" onClick={onClose} icon={<CloseOutlined style={{ fontSize: '16px' }} />} />
        </div>
    );
};

// Status Bar Component
interface StatusBarProps {
    isConnected: boolean;
    isLoggedIn: boolean;
    vaultStatus: 'locked' | 'unlocked' | 'unknown';
    onLogout: () => Promise<void>;
}

const StatusBar: React.FC<StatusBarProps> = ({
    isConnected,
    isLoggedIn,
    vaultStatus,
    onLogout
}) => {
    return (
        <div style={{
            borderBottom: '1px solid #e8e8e8',
            background: 'rgba(255,255,255,0.95)',
            padding: '16px 24px',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0
                    }}>
                        🔐 Dockly  Vault
                    </h1>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isConnected ? (
                                <Wifi style={{ fontSize: '16px', color: '#48bb78' }} />
                            ) : (
                                <WifiOff style={{ fontSize: '16px', color: '#c53030' }} />
                            )}
                            <span style={{
                                fontSize: '14px',
                                fontWeight: 500,
                                color: isConnected ? '#48bb78' : '#c53030'
                            }}>
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield style={{
                                fontSize: '16px',
                                color: isLoggedIn ? '#48bb78' : '#a0aec0'
                            }} />
                            <span style={{
                                fontSize: '14px',
                                fontWeight: 500,
                                color: isLoggedIn ? '#48bb78' : '#718096'
                            }}>
                                {isLoggedIn ? 'Authenticated' : 'Not Authenticated'}
                            </span>
                        </div>

                        {isLoggedIn && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {vaultStatus === 'unlocked' ? (
                                    <ShieldCheck style={{ fontSize: '16px', color: '#48bb78' }} />
                                ) : (
                                    <ShieldX style={{ fontSize: '16px', color: '#c53030' }} />
                                )}
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: vaultStatus === 'unlocked' ? '#48bb78' : '#c53030'
                                }}>
                                    {vaultStatus === 'unlocked' ? 'Vault Unlocked' : 'Vault Locked'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '14px', color: '#718096', fontWeight: 500 }}>
                        Real-time sync enabled
                    </span>
                    {isLoggedIn && (
                        <Button
                            onClick={onLogout}
                            icon={<LogOut style={{ fontSize: '16px' }} />}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#4a5568',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                background: '#fff',
                                cursor: 'pointer'
                            }}
                        >
                            Logout
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Password Stats Component
interface PasswordStatsProps {
    stats: { total: number; strong: number; weak: number };
}

const PasswordStats: React.FC<PasswordStatsProps> = ({ stats }) => {
    const strengthPercentage = stats.total > 0 ? Math.round((stats.strong / stats.total) * 100) : 0;

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
        }}>
            <Card style={{
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: 'none'
            }}>
                <Statistic
                    title={<span style={{ color: '#160383ff', fontSize: '24px' }}>Total Passwords</span>}
                    value={stats.total}
                    suffix={<span style={{ color: '#718096' }}>items</span>}
                    prefix={<Database style={{ color: '#2d3748' }} />}
                    valueStyle={{ color: '#2d3748', fontSize: '32px', fontWeight: 700 }}
                />
            </Card>

            {/* <Card style={{ 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: 'none'
        }}>
            <Statistic
                title={<span style={{ color: '#03690eff', fontSize: '24px' }}>Strong Passwords</span>}
                value={stats.strong}
                suffix={<span style={{ color: '#48bb78' }}>secure</span>}
                prefix={<Shield style={{ color: '#2a4365' }} />}
                valueStyle={{ color: '#2a4365', fontSize: '32px', fontWeight: 700 }}
            />
        </Card> */}

            <Card style={{
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: 'none'
            }}>
                <Statistic
                    title={<span style={{ color: '#744210', fontSize: '24px' }}>Weak Passwords</span>}
                    value={stats.weak}
                    suffix={<span style={{ color: '#c53030' }}>need attention</span>}
                    prefix={<AlertTriangle style={{
                        color: '#c53030',
                        textShadow: '0 0 10px #c53030, 0 0 20px #c53030, 0 0 30px #c53030',
                        animation: 'glow 1.5s ease-in-out infinite alternate'
                    }} />}
                    valueStyle={{ color: '#744210', fontSize: '32px', fontWeight: 700 }}
                />
                <style>
                    {`
                    @keyframes glow {
                        from { text-shadow: 0 0 5px #c53030, 0 0 10px #c53030, 0 0 15px #c53030; }
                        to { text-shadow: 0 0 10px #c53030, 0 0 20px #c53030, 0 0 30px #c53030; }
                    }
                `}
                </style>
            </Card>

            {/* <Card style={{ 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: 'none'
        }}>
            <Statistic
                title={<span style={{ color: '#1366f4ff', fontSize: '24px' }}>Security Score</span>}
                value={strengthPercentage}
                suffix={<span style={{ color: '#718096' }}>% overall</span>}
                prefix={<TrendingUp style={{ color: '#4a5568' }} />}
                valueStyle={{ color: '#4a5568', fontSize: '32px', fontWeight: 700 }}
            />
        </Card> */}
        </div>
    );
};

// Password Item Component
interface PasswordItemProps {
    password: PasswordItemType;
    onMessage: (message: string, type: 'success' | 'error') => void;
    viewMode: 'list' | 'grid';
}

const PasswordItem: React.FC<PasswordItemProps> = ({ password, onMessage, viewMode }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [actualPassword, setActualPassword] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getStrengthColor = (strength: number) => {
        if (strength >= 80) return { color: '#48bb78', background: '#f0fff4' };
        if (strength >= 60) return { color: '#d69e2e', background: '#fefcbf' };
        return { color: '#c53030', background: '#fff1f0' };
    };

    const getStrengthLabel = (strength: number) => {
        if (strength >= 80) return 'Strong';
        if (strength >= 60) return 'Medium';
        return 'Weak';
    };

    const getStrengthBarColor = (strength: number) => {
        if (strength >= 80) return '#48bb78';
        if (strength >= 60) return '#d69e2e';
        return '#c53030';
    };

    const handleShowPassword = async () => {
        if (!showPassword && !actualPassword) {
            setLoading(true);
            try {
                const result = await apiClient.getPassword(password.id);
                if (result.status === 1) {
                    setActualPassword(result.payload.password || '');
                    setShowPassword(true);
                } else {
                    onMessage(result.message || 'Failed to retrieve password', 'error');
                }
            } catch (error) {
                onMessage('Failed to connect to server', 'error');
            } finally {
                setLoading(false);
            }
        } else {
            setShowPassword(!showPassword);
        }
    };

    const handleCopyPassword = async () => {
        if (!actualPassword) {
            setLoading(true);
            try {
                const result = await apiClient.getPassword(password.id);
                if (result.status === 1) {
                    await navigator.clipboard.writeText(result.payload.password || '');
                    onMessage('Password copied to clipboard', 'success');
                } else {
                    onMessage(result.message || 'Failed to retrieve password', 'error');
                }
            } catch (error) {
                onMessage('Failed to connect to server', 'error');
            } finally {
                setLoading(false);
            }
        } else {
            await navigator.clipboard.writeText(actualPassword);
            onMessage('Password copied to clipboard', 'success');
        }
    };

    const handleCopyUsername = async () => {
        if (password.username) {
            await navigator.clipboard.writeText(password.username);
            onMessage('Username copied to clipboard', 'success');
        }
    };

    const handleOpenWebsite = () => {
        if (password.uri) {
            window.open(password.uri, '_blank');
        }
    };

    if (viewMode === 'grid') {
        return (
            <Card style={{
                borderRadius: '16px',
                border: '1px solid #e8e8e8',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                height: '100%'
            }}>
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1a202c', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {password.name}
                        </h4>
                        {password.favorite && <Star style={{ fontSize: '14px', color: '#ecc94b' }} />}
                    </div>
                    <Badge style={{
                        ...getStrengthColor(password.strength),
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 500
                    }}>
                        {getStrengthLabel(password.strength)}
                    </Badge>
                </div>

                <div style={{ marginBottom: '12px' }}>
                    {password.username && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <User style={{ fontSize: '12px', color: '#718096' }} />
                            <span style={{ fontSize: '12px', color: '#718096', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {password.username}
                            </span>
                        </div>
                    )}
                    {password.uri && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Globe style={{ fontSize: '12px', color: '#718096' }} />
                            <span style={{ fontSize: '12px', color: '#718096', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {password.uri}
                            </span>
                        </div>
                    )}
                </div>

                {/* <div style={{ display: 'flex', gap: '48px', justifyContent: 'center' ,border:'1px solid #100e0eff'}}>
                    <Button
                        size="small"
                        onClick={handleShowPassword}
                        disabled={loading}
                        icon={loading ? <Spin size="small" /> : showPassword ? <EyeOff style={{ fontSize: '12px' }} /> : <Eye style={{ fontSize: '12px' }} />}
                        style={{ borderRadius: '6px',background: 'rgba(5, 98, 239, 0.8)', border: '1px solid rgba(255,255,255,0.3)' }}
                    />
                    <Button
                        size="small"
                        onClick={handleCopyPassword}
                        disabled={loading}
                        icon={loading ? <Spin size="small" /> : <Copy style={{ fontSize: '12px' }} />}
                        style={{ borderRadius: '6px' }}
                    />
                    {password.uri && (
                        <Button
                            size="small"
                            onClick={handleOpenWebsite}
                            icon={<ExternalLink style={{ fontSize: '12px' }} />}
                            style={{ borderRadius: '6px' }}
                        />
                    )}
                </div> */}

                <div style={{ display: 'flex', borderRadius: '6px' }}>
                    <Dropdown overlay={
                        <Menu>
                            <Menu.Item key="view" onClick={handleShowPassword} disabled={loading} icon={<Eye style={{ fontSize: '12px' }} />}>
                                {loading ? 'Loading...' : showPassword ? 'Hide Password' : 'View Password'}
                            </Menu.Item>
                            <Menu.Item key="copy" onClick={handleCopyPassword} disabled={loading} icon={<Copy style={{ fontSize: '12px' }} />}>
                                {loading ? 'Loading...' : 'Copy Password'}
                            </Menu.Item>
                            {password.uri && (
                                <Menu.Item key="open" onClick={handleOpenWebsite} icon={<ExternalLink style={{ fontSize: '12px' }} />}>
                                    Go to Site
                                </Menu.Item>
                            )}
                        </Menu>
                    } trigger={['click']}>
                        <Button
                            size="small"
                            style={{
                                borderRadius: '6px',
                                background: loading ? '#d1d5db' : '#4a5568',
                                border: '1px solid rgba(255,255,255,0.3)',
                                color: '#fff',
                                padding: '0 6px',
                                // minWidth: '120px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px'
                            }}
                            icon={loading ? <Spin size="small" /> : <EllipsisOutlined />}
                        >
                            {loading ? 'Loading...' : ''}
                        </Button>
                    </Dropdown>
                </div>

                {showPassword && actualPassword && (
                    <div style={{
                        marginTop: '12px',
                        fontFamily: 'monospace',
                        background: 'rgba(255,255,255,0.8)',
                        padding: '8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#4a5568',
                        wordBreak: 'break-all'
                    }}>
                        {actualPassword}
                    </div>
                )}
            </Card>
        );
    }

    return (
        <Card style={{
            borderRadius: '16px',
            border: '1px solid #e8e8e8',
            marginBottom: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            padding: '24px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a202c' }}>{password.name}</h3>
                        {password.favorite && <Star style={{ fontSize: '16px', color: '#ecc94b' }} />}
                    </div>

                    {password.uri && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#718096', marginBottom: '8px' }}>
                            <Globe style={{ fontSize: '16px' }} />
                            <span style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{password.uri}</span>
                            <Button
                                type="text"
                                onClick={handleOpenWebsite}
                                icon={<ExternalLink style={{ fontSize: '12px' }} />}
                                style={{ padding: '4px' }}
                            />
                        </div>
                    )}

                    {password.username && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#718096' }}>
                            <User style={{ fontSize: '16px' }} />
                            <span style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{password.username}</span>
                            <Button
                                type="text"
                                onClick={handleCopyUsername}
                                icon={<Copy style={{ fontSize: '12px' }} />}
                                style={{ padding: '4px' }}
                            />
                        </div>
                    )}
                </div>

                <Badge style={{
                    ...getStrengthColor(password.strength),
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 500
                }}>
                    {getStrengthLabel(password.strength)}
                </Badge>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#718096' }}>Password Strength</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a202c' }}>{password.strength}%</span>
                </div>
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.5)', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                    <div style={{
                        height: '8px',
                        width: `${password.strength}%`,
                        background: getStrengthBarColor(password.strength),
                        borderRadius: '10px',
                        transition: 'width 0.3s'
                    }} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                    flex: 1,
                    fontFamily: 'monospace',
                    background: 'rgba(255,255,255,0.8)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    fontSize: '14px',
                    color: '#4a5568'
                }}>
                    {showPassword && actualPassword ? actualPassword : '••••••••••••'}
                </div>
                <Button
                    onClick={handleShowPassword}
                    disabled={loading}
                    icon={loading ? <Spin size="small" /> : showPassword ? <EyeOff /> : <Eye />}
                    style={{
                        padding: '12px',
                        background: 'rgba(255,255,255,0.8)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.3)'
                    }}
                />
                <Button
                    onClick={handleCopyPassword}
                    disabled={loading}
                    icon={loading ? <Spin size="small" /> : <Copy />}
                    style={{
                        padding: '12px',
                        background: 'rgba(255,255,255,0.8)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.3)'
                    }}
                />
            </div>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#718096' }}>
                Last modified: {new Date(password.lastModified).toLocaleDateString()}
            </div>
        </Card>
    );
};

// Password Dashboard Component
interface PasswordDashboardProps {
    onMessage: (message: string, type: 'success' | 'error') => void;
}

const PasswordDashboard: React.FC<PasswordDashboardProps> = ({ onMessage }) => {
    const [passwords, setPasswords] = useState<PasswordItemType[]>([]);
    const [filteredPasswords, setFilteredPasswords] = useState<PasswordItemType[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'weak' | 'favorites'>('all');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    useEffect(() => {
        loadPasswords();

        socketManager.on('items_updated', (data: any) => {
            if (data.items) {
                setPasswords(data.items);
                onMessage(`${data.count} items synchronized`, 'success');
            }
        });

        socketManager.on('sync_complete', () => {
            setSyncing(false);
            onMessage('Sync completed successfully', 'success');
        });

        socketManager.on('sync_error', (data: any) => {
            setSyncing(false);
            onMessage(data.message || 'Sync failed', 'error');
        });

        return () => {
            socketManager.off('items_updated', () => { });
            socketManager.off('sync_complete', () => { });
            socketManager.off('sync_error', () => { });
        };
    }, [onMessage]);

    useEffect(() => {
        filterPasswords();
    }, [passwords, searchTerm, selectedFilter]);

    const loadPasswords = async () => {
        try {
            setLoading(true);
            const result = await apiClient.getItems();
            if (result.status === 1 && result.payload.items) {
                setPasswords(result.payload.items);
            } else {
                onMessage(result.message || 'Failed to load passwords', 'error');
            }
        } catch (error) {
            onMessage('Failed to connect to server', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterPasswords = () => {
        let filtered = passwords;

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.uri.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        switch (selectedFilter) {
            case 'weak':
                filtered = filtered.filter(item => item.strength < 60);
                break;
            case 'favorites':
                filtered = filtered.filter(item => item.favorite);
                break;
        }

        setFilteredPasswords(filtered);
    };

    const handleSync = async () => {
        setSyncing(true);
        onMessage('Starting sync...', 'success');
        socketManager.emit('request_sync');

        try {
            const result = await apiClient.syncVault();
            if (result.status === 1) {
                await loadPasswords();
            } else {
                setSyncing(false);
                onMessage(result.message || 'Sync failed', 'error');
            }
        } catch (error) {
            setSyncing(false);
            onMessage('Failed to sync vault', 'error');
        }
    };

    const getPasswordStats = () => {
        const weak = passwords.filter(p => p.strength < 60).length;
        const strong = passwords.filter(p => p.strength >= 80).length;
        const total = passwords.length;
        return { weak, strong, total };
    };

    const stats = getPasswordStats();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '384px',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <DocklyLoader />
                <span style={{ color: '#718096', fontSize: '18px' }}>Loading your passwords...</span>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{
                        fontSize: '30px',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '8px'
                    }}>
                        Bitwarden Vault
                    </h2>
                    <p style={{ fontSize: '18px', color: '#718096' }}>
                        Manage and monitor your Bitwarden passwords
                    </p>
                </div>
                <Space>
                    <Button
                        onClick={handleSync}
                        disabled={syncing}
                        icon={<RefreshCw style={{ fontSize: '16px', transform: syncing ? 'rotate(360deg)' : 'none', transition: 'transform 0.3s' }} />}
                        style={{ borderRadius: '12px', border: '1px solid #e8e8e8' }}
                    >
                        {syncing ? 'Syncing...' : 'Sync Vault'}
                    </Button>
                    {/* <Button
                        type="primary"
                        icon={<Plus style={{ fontSize: '16px' }} />}
                        style={{ 
                            borderRadius: '12px', 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none'
                        }}
                    >
                        Add Password
                    </Button> */}
                </Space>
            </div>

            <PasswordStats stats={stats} />

            <Card style={{
                borderRadius: '16px',
                marginBottom: '32px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, minWidth: '320px' }}>
                        <Input
                            prefix={<Search style={{ fontSize: '16px', color: '#a0aec0' }} />}
                            placeholder="Search passwords..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ borderRadius: '12px', padding: '12px' }}
                        />
                    </div>
                    <Space>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BarsOutlined style={{ fontSize: '16px', color: viewMode === 'list' ? '#667eea' : '#a0aec0' }} />
                            <Switch
                                checked={viewMode === 'grid'}
                                onChange={(checked) => setViewMode(checked ? 'grid' : 'list')}
                                style={{ background: viewMode === 'grid' ? '#667eea' : '#d9d9d9' }}
                            />
                            <AppstoreOutlined style={{ fontSize: '16px', color: viewMode === 'grid' ? '#667eea' : '#a0aec0' }} />
                        </div>
                        <Button
                            onClick={() => setSelectedFilter('all')}
                            type={selectedFilter === 'all' ? 'primary' : 'default'}
                            style={{
                                borderRadius: '12px',
                                background: selectedFilter === 'all' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.8)',
                                color: selectedFilter === 'all' ? '#fff' : '#4a5568',
                                border: 'none'
                            }}
                        >
                            All
                        </Button>
                        <Button
                            onClick={() => setSelectedFilter('weak')}
                            type={selectedFilter === 'weak' ? 'primary' : 'default'}
                            icon={<AlertTriangle style={{ fontSize: '16px' }} />}
                            style={{
                                borderRadius: '12px',
                                background: selectedFilter === 'weak' ? 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)' : 'rgba(255,255,255,0.8)',
                                color: selectedFilter === 'weak' ? '#fff' : '#4a5568',
                                border: 'none'
                            }}
                        >
                            Weak
                        </Button>
                        <Button
                            onClick={() => setSelectedFilter('favorites')}
                            type={selectedFilter === 'favorites' ? 'primary' : 'default'}
                            icon={<Star style={{ fontSize: '16px' }} />}
                            style={{
                                borderRadius: '12px',
                                background: selectedFilter === 'favorites' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'rgba(255,255,255,0.8)',
                                color: selectedFilter === 'favorites' ? '#fff' : '#4a5568',
                                border: 'none'
                            }}
                        >
                            Favorites
                        </Button>
                    </Space>
                </div>
            </Card>

            <div>
                {filteredPasswords.length === 0 ? (
                    <Card style={{
                        borderRadius: '16px',
                        border: '1px solid #e8e8e8',
                        padding: '64px',
                        textAlign: 'center',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                    }}>
                        <Database style={{ fontSize: '64px', color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }} />
                        <p style={{ fontSize: '18px', color: '#718096' }}>
                            {searchTerm || selectedFilter !== 'all'
                                ? 'No passwords match your filters'
                                : 'No passwords found in your vault'
                            }
                        </p>
                    </Card>
                ) : viewMode === 'grid' ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '20px'
                    }}>
                        {filteredPasswords.map((password) => (
                            <PasswordItem key={password.id} password={password} onMessage={onMessage} viewMode="grid" />
                        ))}
                    </div>
                ) : (
                    filteredPasswords.map((password) => (
                        <PasswordItem key={password.id} password={password} onMessage={onMessage} viewMode="list" />
                    ))
                )}
            </div>
        </div>
    );
};

// Login Form Component
interface LoginFormProps {
    onLogin: (email: string, password: string, code: string) => Promise<{ success: boolean; status: number; message?: string }>;
    onUnlock: (password: string) => Promise<{ success: boolean; status: number; message?: string }>;
    isLoggedIn: boolean;
    vaultStatus: 'locked' | 'unlocked' | 'unknown';
    onMessage: (message: string, type: 'success' | 'error') => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
    onLogin,
    onUnlock,
    isLoggedIn,
    vaultStatus,
    onMessage
}) => {
    const [form] = Form.useForm();
    const [unlockForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (values: { email: string; password: string; code: string }) => {
        setLoading(true);
        setError('');

        try {
            const result = await onLogin(values.email, values.password, values.code);
            if (result.status === 1) {
                onMessage('Successfully logged in to Bitwarden Vault', 'success');
            } else {
                setError(result.message || 'Login failed');
            }
        } catch (error) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleUnlock = async (values: { unlockPassword: string }) => {
        setLoading(true);
        setError('');

        try {
            const result = await onUnlock(values.unlockPassword);
            if (result.status === 1) {
                onMessage('Vault unlocked successfully', 'success');
            } else {
                setError(result.message || 'Unlock failed');
            }
        } catch (error) {
            setError('Failed to unlock vault');
        } finally {
            setLoading(false);
        }
    };

    const currentTab = isLoggedIn && vaultStatus === 'locked' ? 'unlock' : 'login';

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '20px',
            background: '#f7fafc',
            position: 'relative'
        }}>
            <Card style={{
                width: '100%',
                // maxWidth: '500px', 
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                border: 'none',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                zIndex: 1
            }}>
                <div style={{ padding: '32px', textAlign: 'center' }}>
                    {/* <div style={{
                        width: '100px',
                        height: '100px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
                    }}>
                        <Shield style={{ fontSize: '50px', color: '#fff' }} />
                    </div> */}
                    <Title level={1} style={{
                        fontSize: '32px',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '8px'
                    }}>
                        <Shield style={{ fontSize: '50px', color: '#fff' }} />

                        Connect Your Bitwarden Vault with Dockly
                    </Title>
                    <Paragraph style={{ fontSize: '18px', color: '#718096', marginBottom: '32px' }}>
                        Let's get your password manager working seamlessly with Dockly for safe and easy account access.
                    </Paragraph>
                    <Paragraph style={{
                        backgroundColor: '#f0fff4',
                        color: '#2f855a',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '32px'
                    }}>
                        <CheckCircleTwoTone style={{ marginRight: '8px' }} /> Your passwords stay private. Dockly never stores your actual passwords - we integrate with 1Password securely.
                    </Paragraph>
                </div>

                <div style={{ padding: '0 32px 32px' }}>
                    <Tabs
                        activeKey={currentTab}
                        items={[
                            {
                                key: 'login',
                                label: <span style={{ fontSize: '16px', fontWeight: 500 }}>Login</span>,
                                disabled: isLoggedIn,
                                children: (
                                    <Form form={form} onFinish={handleLogin} layout="vertical" style={{ marginTop: '24px' }}>
                                        <Form.Item
                                            name="email"
                                            label={<span style={{ fontSize: '14px', fontWeight: 500, color: '#4a5568' }}>Email Address</span>}
                                            rules={[{ required: true, message: 'Please input your email!' }]}
                                        >
                                            <Input
                                                prefix={<UserOutlined style={{ color: '#a0aec0' }} />}
                                                placeholder="Enter your email"
                                                disabled={loading}
                                                style={{
                                                    borderRadius: '12px',
                                                    padding: '12px 16px',
                                                    fontSize: '16px',
                                                    border: '2px solid #e8e8e8',
                                                    background: 'rgba(255,255,255,0.8)'
                                                }}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name="password"
                                            label={<span style={{ fontSize: '14px', fontWeight: 500, color: '#4a5568' }}>Master Password</span>}
                                            rules={[{ required: true, message: 'Please input your password!' }]}
                                        >
                                            <Input.Password
                                                placeholder="Enter your master password"
                                                disabled={loading}
                                                style={{
                                                    borderRadius: '12px',
                                                    padding: '12px 16px',
                                                    fontSize: '16px',
                                                    border: '2px solid #e8e8e8',
                                                    background: 'rgba(255,255,255,0.8)'
                                                }}
                                                iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                                            />
                                        </Form.Item>

                                        {/* <Form.Item
                                            name="code"
                                            label={<span style={{ fontSize: '14px', fontWeight: 500, color: '#4a5568' }}>Two-Factor Code (if enabled)</span>}
                                        >
                                            <Input
                                                placeholder="Enter your 2FA code"
                                                disabled={loading}
                                                style={{
                                                    borderRadius: '12px',
                                                    padding: '12px 16px',
                                                    fontSize: '16px',
                                                    border: '2px solid #e8e8e8',
                                                    background: 'rgba(255,255,255,0.8)'
                                                }}
                                            />
                                        </Form.Item> */}

                                        <Form.Item style={{ marginTop: '32px' }}>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                loading={loading}
                                                icon={<UnlockOutlined />}
                                                style={{
                                                    width: '100%',
                                                    borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    height: '50px',
                                                    fontSize: '16px',
                                                    fontWeight: 600,
                                                    border: 'none',
                                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                                                }}
                                            >
                                                {loading ? 'Logging in...' : 'Login to Vault'}
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                )
                            },
                            {
                                key: 'unlock',
                                label: <span style={{ fontSize: '16px', fontWeight: 500 }}>Unlock Vault</span>,
                                disabled: !isLoggedIn || vaultStatus === 'unlocked',
                                children: (
                                    <Form form={unlockForm} onFinish={handleUnlock} layout="vertical" style={{ marginTop: '24px' }}>
                                        <Form.Item
                                            name="unlockPassword"
                                            label={<span style={{ fontSize: '14px', fontWeight: 500, color: '#4a5568' }}>Master Password</span>}
                                            rules={[{ required: true, message: 'Please input your password!' }]}
                                        >
                                            <Input.Password
                                                placeholder="Enter your master password"
                                                disabled={loading}
                                                style={{
                                                    borderRadius: '12px',
                                                    padding: '12px 16px',
                                                    fontSize: '16px',
                                                    border: '2px solid #e8e8e8',
                                                    background: 'rgba(255,255,255,0.8)'
                                                }}
                                                iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                                            />
                                        </Form.Item>

                                        <Form.Item style={{ marginTop: '32px' }}>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                loading={loading}
                                                icon={<UnlockOutlined />}
                                                style={{
                                                    width: '100%',
                                                    borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    height: '50px',
                                                    fontSize: '16px',
                                                    fontWeight: 600,
                                                    border: 'none',
                                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                                                }}
                                            >
                                                {loading ? 'Unlocking...' : 'Unlock Vault'}
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                )
                            }
                        ]}
                        style={{ marginBottom: '24px' }}
                        tabBarStyle={{
                            borderBottom: '2px solid #e8e8e8',
                            marginBottom: '0'
                        }}
                    />

                    {error && (
                        <Card style={{
                            marginTop: '20px',
                            // background: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <ExclamationCircleOutlined style={{ fontSize: '20px', color: '#fff' }} />
                                <span style={{ fontWeight: 500, color: '#fff', fontSize: '14px' }}>{error}</span>
                            </div>
                        </Card>
                    )}
                </div>

                <div style={{
                    padding: '20px 32px',
                    background: 'rgba(247, 250, 252, 0.8)',
                    borderTop: '1px solid rgba(232, 232, 232, 0.5)',
                    textAlign: 'center',
                    borderBottomLeftRadius: '24px',
                    borderBottomRightRadius: '24px'
                }}>
                    <Paragraph style={{ fontSize: '12px', color: '#718096', margin: 0 }}>
                        Need help? <a href="https://support.bitwarden.com" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', fontWeight: 500 }}>Contact Support</a>
                    </Paragraph>
                </div>
            </Card>
        </div>
    );
};

// Get Started Component
interface GetStartedProps {
    onStart: () => void;
}

const GetStarted: React.FC<GetStartedProps> = ({ onStart }) => {
    const features = [
        {
            title: 'Secure Password Storage',
            description: 'Store all your passwords in an encrypted vault with military-grade security protocols.',
            icon: <Lock style={{ fontSize: '32px', color: '#667eea' }} />
        },
        {
            title: 'Cross-Platform Sync',
            description: 'Access your passwords seamlessly across all your devices with real-time synchronization.',
            icon: <RefreshCw style={{ fontSize: '32px', color: '#11998e' }} />
        },
        {
            title: 'Password Health Monitoring',
            description: 'Monitor password strength and get alerts for weak or compromised credentials.',
            icon: <Shield style={{ fontSize: '32px', color: '#fc466b' }} />
        },
        {
            title: 'Two-Factor Authentication',
            description: 'Add an extra layer of security with built-in 2FA support for your accounts.',
            icon: <Smartphone style={{ fontSize: '32px', color: '#f093fb' }} />
        }
    ];

    const steps = [
        'Connect your Bitwarden account with secure authentication',
        'Import and organize your existing passwords automatically',
        'Monitor password health and security across all accounts',
        'Access your vault securely from any device, anywhere'
    ];

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '40px 20px',
            minHeight: '100vh',
            background: '#f7fafc',
            position: 'relative'
        }}>
            {/* Hero Section with Left Image, Right Text */}
            <Row gutter={[48, 48]} align="middle" style={{ marginBottom: '80px' }}>
                <Col xs={24} lg={10}>
                    <div style={{ textAlign: 'center' }}>
                        <img
                            src="/manager/vaulthub.webp"
                            alt="Vault Hub"
                            style={{
                                width: '280px',
                                height: '180px',
                                objectFit: 'cover',
                                borderRadius: '2px',
                                marginLeft: '30px',
                                marginTop: '60px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                            }}
                        />
                    </div>
                </Col>

                <Col xs={24} lg={14}>
                    <div style={{ color: '#1a202c' }}>
                        <Title level={1} style={{
                            fontSize: '48px',
                            fontWeight: 700,
                            color: '#1a202c',
                            marginBottom: '16px',
                            lineHeight: '1.2'
                        }}>
                            Welcome to Your Bitwarden Vault Hub
                        </Title>
                        <Paragraph style={{
                            fontSize: '20px',
                            color: '#718096',
                            marginBottom: '32px',
                            lineHeight: '1.6'
                        }}>
                            Your central dashboard for managing Bitwarden Vault and securing your digital life with enterprise-grade password management.
                        </Paragraph>
                        <Button
                            type="primary"
                            size="large"
                            onClick={onStart}
                            style={{
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                height: '56px',
                                fontSize: '18px',
                                fontWeight: 600,
                                border: 'none',
                                color: '#fff',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                            }}
                        >
                            Get Started Now
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Features Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))',
                gap: '32px',
                marginBottom: '80px'
            }}>
                {features.map((feature, index) => (
                    <Card key={index} style={{
                        borderRadius: '20px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                        background: 'rgba(255,255,255,0.95)',
                        border: 'none',
                        backdropFilter: 'blur(20px)',
                        padding: '24px',
                        textAlign: 'center',
                        transition: 'transform 0.3s ease'
                    }}>
                        <div style={{ marginBottom: '20px' }}>
                            {feature.icon}
                        </div>
                        <Title level={3} style={{
                            fontSize: '20px',
                            fontWeight: 600,
                            color: '#1a202c',
                            marginBottom: '12px'
                        }}>
                            {feature.title}
                        </Title>
                        <Paragraph style={{
                            fontSize: '15px',
                            color: '#718096',
                            lineHeight: '1.6'
                        }}>
                            {feature.description}
                        </Paragraph>
                    </Card>
                ))}
            </div>

            {/* How it Works Section - Reverted to Original */}
            <Card style={{
                borderRadius: '24px',
                background: 'rgba(255,255,255,0.95)',
                border: 'none',
                backdropFilter: 'blur(20px)',
                padding: '48px',
                marginBottom: '60px'
            }}>
                <div style={{ marginBottom: '48px' }}>
                    <Title level={2} style={{
                        fontSize: '36px',
                        fontWeight: 700,
                        color: '#040810ff',
                        marginBottom: '16px'
                    }}>
                        How does it work?
                    </Title>
                    <Paragraph style={{
                        fontSize: '18px',
                        color: '#718096',
                    }}>
                        To set up your Vault Hub, we'll help you connect your existing password managers to Dockly. This allows you to:
                    </Paragraph>
                </div>

                <List
                    dataSource={steps}
                    renderItem={(item, index) => (
                        <List.Item style={{
                            border: 'none',
                            padding: '16px 0',
                            borderBottom: index < steps.length - 1 ? '1px solid #e8e8e8' : 'none'
                        }}>
                            <List.Item.Meta
                                avatar={
                                    <div style={{
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #020305ff 0%, #131214ff 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        fontSize: '16px',
                                        fontWeight: 600
                                    }}>
                                        { }
                                    </div>
                                }
                                description={
                                    <Text style={{
                                        fontSize: '16px',
                                        color: '#4a5568',
                                        lineHeight: '1.6'
                                    }}>
                                        {item}
                                    </Text>
                                }
                            />
                        </List.Item>
                    )}
                    style={{ marginBottom: '32px' }}
                />

                <div style={{
                    textAlign: 'center',
                    padding: '24px',
                    borderRadius: '16px',
                    color: '#fff'
                }}>
                    <Paragraph style={{
                        fontSize: '14px',
                        color: 'rgba(14, 13, 13, 0.9)',
                    }}>
                        🔒 Dockly never stores your actual passwords - it provides a secure interface to your trusted password managers.
                    </Paragraph>
                </div>
            </Card>
        </div>
    );
};

// Main App Component
function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [vaultStatus, setVaultStatus] = useState<'locked' | 'unlocked' | 'unknown'>('unknown');
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [showGetStarted, setShowGetStarted] = useState(true);

    useEffect(() => {
        socketManager.connect();

        socketManager.on('connected', (data: any) => {
            setIsConnected(true);
            showMessage(data.message, 'success');
        });

        socketManager.on('login_success', (data: any) => {
            showMessage(data.message, 'success');
            setIsLoggedIn(true);
            setShowGetStarted(false);
        });

        socketManager.on('vault_unlocked', (data: any) => {
            showMessage(data.message, 'success');
            setVaultStatus('unlocked');
        });

        socketManager.on('sync_complete', (data: any) => {
            showMessage(data.message, 'success');
        });

        socketManager.on('sync_error', (data: any) => {
            showMessage(data.message, 'error');
        });

        checkStatus();

        return () => {
            socketManager.disconnect();
        };
    }, []);

    const showMessage = (text: string, type: 'success' | 'error') => {
        setMessage({ text, type });
    };

    const hideMessage = () => {
        setMessage(null);
    };

    const checkStatus = async () => {
        try {
            const status = await apiClient.getStatus();
            if (status.payload.status.status === 'authenticated') {
                setIsLoggedIn(true);
                setVaultStatus('unlocked');
                setShowGetStarted(false);
            } else if (status.payload.status.status === 'locked') {
                setIsLoggedIn(true);
                setVaultStatus('locked');
                setShowGetStarted(false);
            } else {
                setIsLoggedIn(false);
                setVaultStatus('unknown');
            }
        } catch (error) {
            console.error('Failed to check status:', error);
        }
    };

    const handleLogin = async (email: string, password: string, code: string) => {
        try {
            const result = await apiClient.login(email, password);
            if (result.status === 1) {
                setIsLoggedIn(true);
                setVaultStatus('unlocked');
                setShowGetStarted(false);
                return { success: true, status: 1 };
            } else {
                return {
                    success: false,
                    status: 0,
                    message: result.message
                };
            }
        } catch (error) {
            return { success: false, status: 0, message: 'Failed to connect to server' };
        }
    };

    const handleUnlock = async (password: string) => {
        try {
            const result = await apiClient.unlock(password);
            if (result.status === 1) {
                setVaultStatus('unlocked');
                return { success: true, status: 1 };
            } else {
                return { success: false, status: 0, message: result.message };
            }
        } catch (error) {
            return { success: false, status: 0, message: 'Failed to unlock vault' };
        }
    };

    const handleLogout = async () => {
        try {
            const result = await apiClient.logout();
            if (result.status === 1) {
                setIsLoggedIn(false);
                setVaultStatus('unknown');
                setIsConnected(false);
                setShowGetStarted(true);
                socketManager.disconnect();
                showMessage('Successfully logged out', 'success');
            } else {
                showMessage(result.message || 'Failed to logout', 'error');
            }
        } catch (error) {
            showMessage('Failed to connect to server', 'error');
        }
    };

    const handleStart = () => {
        setShowGetStarted(false);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
            {message && (
                <Message
                    message={message.text}
                    type={message.type}
                    onClose={hideMessage}
                />
            )}

            <StatusBar
                isConnected={isConnected}
                isLoggedIn={isLoggedIn}
                vaultStatus={vaultStatus}
                onLogout={handleLogout}
            />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
                {showGetStarted ? (
                    <GetStarted onStart={handleStart} />
                ) : !isLoggedIn || vaultStatus === 'locked' ? (
                    <LoginForm
                        onLogin={handleLogin}
                        onUnlock={handleUnlock}
                        isLoggedIn={isLoggedIn}
                        vaultStatus={vaultStatus}
                        onMessage={showMessage}
                    />
                ) : (
                    <PasswordDashboard onMessage={showMessage} />
                )}
            </div>
        </div>
    );
}

export default App;
