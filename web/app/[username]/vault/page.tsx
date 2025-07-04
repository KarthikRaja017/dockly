
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
import { Button, Input, Spin, Card, Statistic, Tabs, Form, message, Space, Badge } from 'antd';
import { PasswordItem as PasswordItemType, apiClient } from '../../../services/api';
import { socketManager } from '../../../services/socket';
import { AlertTriangle, Wifi, WifiOff, Shield, ShieldCheck, ShieldX, LogOut, Database, TrendingUp, Star, Globe, ExternalLink, User, Copy, EyeOff, Eye, RefreshCw, Plus, Search, Unlock } from 'lucide-react';
import DocklyLoader from '../../../utils/docklyLoader';

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
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: type === 'success' ? '#f0fff4' : '#fff1f0',
            color: type === 'success' ? '#2f855a' : '#c53030',
            border: `1px solid ${type === 'success' ? '#c6f6d5' : '#feb2b2'}`
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
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a202c' }}>
                        🔐 Dockly Bitwarden Vault
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
            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Statistic
                    title="Total Passwords"
                    value={stats.total}
                    suffix="items"
                    prefix={<Database style={{ color: '#3182ce' }} />}
                    valueStyle={{ color: '#1a202c', fontSize: '32px', fontWeight: 700 }}
                />
            </Card>

            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Statistic
                    title="Strong Passwords"
                    value={stats.strong}
                    suffix="secure"
                    prefix={<Shield style={{ color: '#48bb78' }} />}
                    valueStyle={{ color: '#48bb78', fontSize: '32px', fontWeight: 700 }}
                />
            </Card>

            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Statistic
                    title="Weak Passwords"
                    value={stats.weak}
                    suffix="need attention"
                    prefix={<AlertTriangle style={{ color: '#c53030' }} />}
                    valueStyle={{ color: '#c53030', fontSize: '32px', fontWeight: 700 }}
                />
            </Card>

            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Statistic
                    title="Security Score"
                    value={strengthPercentage}
                    suffix="% overall"
                    prefix={<TrendingUp style={{ color: '#3182ce' }} />}
                    valueStyle={{ color: '#3182ce', fontSize: '32px', fontWeight: 700 }}
                />
            </Card>
        </div>
    );
};

// Password Item Component
interface PasswordItemProps {
    password: PasswordItemType;
    onMessage: (message: string, type: 'success' | 'error') => void;
}

const PasswordItem: React.FC<PasswordItemProps> = ({ password, onMessage }) => {
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
                onMessage('Failed to copy password', 'error');
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

    return (
        <Card style={{
            borderRadius: '12px',
            border: '1px solid #e8e8e8',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
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

                <Badge style={{ ...getStrengthColor(password.strength), padding: '4px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: 500 }}>
                    {getStrengthLabel(password.strength)}
                </Badge>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#718096' }}>Password Strength</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a202c' }}>{password.strength}%</span>
                </div>
                <div style={{ width: '100%', background: '#edf2f7', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                    <div style={{
                        height: '8px',
                        width: `${password.strength}%`,
                        background: getStrengthBarColor(password.strength),
                        borderRadius: '999px',
                        transition: 'width 0.3s'
                    }} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                    flex: 1,
                    fontFamily: 'monospace',
                    background: '#f7fafc',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e8e8e8',
                    fontSize: '14px',
                    color: '#4a5568'
                }}>
                    {showPassword && actualPassword ? actualPassword : '••••••••••••'}
                </div>
                <Button
                    onClick={handleShowPassword}
                    disabled={loading}
                    icon={loading ? <Spin size="small" /> : showPassword ? <EyeOff /> : <Eye />}
                    style={{ padding: '12px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e8e8e8' }}
                />
                <Button
                    onClick={handleCopyPassword}
                    disabled={loading}
                    icon={loading ? <Spin size="small" /> : <Copy />}
                    style={{ padding: '12px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e8e8e8' }}
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
                    <h2 style={{ fontSize: '30px', fontWeight: 700, color: '#1a202c', marginBottom: '8px' }}>
                        Password Vault
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
                        style={{ borderRadius: '8px', border: '1px solid #e8e8e8' }}
                    >
                        {syncing ? 'Syncing...' : 'Sync Vault'}
                    </Button>
                    <Button
                        type="primary"
                        icon={<Plus style={{ fontSize: '16px' }} />}
                        style={{ borderRadius: '8px', background: '#3182ce' }}
                    >
                        Add Password
                    </Button>
                </Space>
            </div>

            <PasswordStats stats={stats} />

            <Card style={{ borderRadius: '12px', marginBottom: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: '320px' }}>
                        <Input
                            prefix={<Search style={{ fontSize: '16px', color: '#a0aec0' }} />}
                            placeholder="Search passwords..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ borderRadius: '8px', padding: '12px' }}
                        />
                    </div>
                    <Space>
                        <Button
                            onClick={() => setSelectedFilter('all')}
                            type={selectedFilter === 'all' ? 'primary' : 'default'}
                            style={{
                                borderRadius: '8px',
                                background: selectedFilter === 'all' ? '#e6f3ff' : '#f7fafc',
                                color: selectedFilter === 'all' ? '#2b6cb0' : '#4a5568',
                                border: selectedFilter === 'all' ? '1px solid #bee3f8' : '1px solid #e8e8e8'
                            }}
                        >
                            All
                        </Button>
                        <Button
                            onClick={() => setSelectedFilter('weak')}
                            type={selectedFilter === 'weak' ? 'primary' : 'default'}
                            icon={<AlertTriangle style={{ fontSize: '16px' }} />}
                            style={{
                                borderRadius: '8px',
                                background: selectedFilter === 'weak' ? '#fff1f0' : '#f7fafc',
                                color: selectedFilter === 'weak' ? '#c53030' : '#4a5568',
                                border: selectedFilter === 'weak' ? '1px solid #feb2b2' : '1px solid #e8e8e8'
                            }}
                        >
                            Weak
                        </Button>
                        <Button
                            onClick={() => setSelectedFilter('favorites')}
                            type={selectedFilter === 'favorites' ? 'primary' : 'default'}
                            style={{
                                borderRadius: '8px',
                                background: selectedFilter === 'favorites' ? '#fefcbf' : '#f7fafc',
                                color: selectedFilter === 'favorites' ? '#b7791f' : '#4a5568',
                                border: selectedFilter === 'favorites' ? '1px solid #faf089' : '1px solid #e8e8e8'
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
                        borderRadius: '12px',
                        border: '1px solid #e8e8e8',
                        padding: '64px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <Database style={{ fontSize: '64px', color: '#e2e8f0', marginBottom: '24px' }} />
                        <p style={{ fontSize: '18px', color: '#718096' }}>
                            {searchTerm || selectedFilter !== 'all'
                                ? 'No passwords match your filters'
                                : 'No passwords found in your vault'
                            }
                        </p>
                    </Card>
                ) : (
                    filteredPasswords.map((password) => (
                        <PasswordItem key={password.id} password={password} onMessage={onMessage} />
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
    const [showPassword, setShowPassword] = useState(false);
    const [showUnlockPassword, setShowUnlockPassword] = useState(false);

    const handleLogin = async (values: { email: string; password: string; code: string }) => {
        setLoading(true);
        setError('');

        try {
            const result = await onLogin(values.email, values.password, values.code);
            if (result.status === 1) {
                onMessage('Successfully logged in to Bitwarden', 'success');
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '18px 16px' }}>
            <Card style={{ width: '100%', maxWidth: '700px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #e8e8e8' }}>
                <div style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(45deg, #3182ce, #805ad5)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}>
                        <Shield style={{ fontSize: '32px', color: '#fff' }} />
                    </div>
                    <h2 style={{ fontSize: '30px', fontWeight: 700, color: '#1a202c', marginBottom: '8px' }}>
                        Bitwarden Access
                    </h2>
                    <p style={{ fontSize: '18px', color: '#718096' }}>
                        Secure access to your password vault
                    </p>
                </div>

                <div style={{ padding: '0 32px' }}>
                    <Tabs
                        activeKey={currentTab}
                        items={[
                            {
                                key: 'login',
                                label: 'Login',
                                disabled: isLoggedIn,
                                children: (
                                    <Form form={form} onFinish={handleLogin} layout="vertical" style={{ marginTop: '24px' }}>
                                        <Form.Item
                                            name="email"
                                            label="Email Address"
                                            rules={[{ required: true, message: 'Please input your email!' }]}
                                        >
                                            <Input
                                                prefix={<User style={{ color: '#a0aec0' }} />}
                                                placeholder="Enter your Bitwarden email"
                                                disabled={loading}
                                                style={{ borderRadius: '8px', padding: '12px' }}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name="password"
                                            label="Master Password"
                                            rules={[{ required: true, message: 'Please input your password!' }]}
                                        >
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter your master password"
                                                disabled={loading}
                                                style={{ borderRadius: '8px', padding: '12px' }}
                                                suffix={
                                                    <Button
                                                        type="text"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        icon={showPassword ? <EyeOff /> : <Eye />}
                                                        style={{ color: '#a0aec0' }}
                                                    />
                                                }
                                            />
                                        </Form.Item>
                                        {/*                     
                    <Form.Item
                      name="code"
                      label="Code"
                      rules={[{ required: true, message: 'Please input your code!' }]}
                    >
                      <Input
                        type={showPassword ? 'text' : 'text'}
                        placeholder="Enter your verification code"
                        disabled={loading}
                        style={{ borderRadius: '8px', padding: '12px' }}
                        suffix={
                          <Button
                            type="text"
                            onClick={() => setShowPassword(!showPassword)}
                            icon={showPassword ? <EyeOff /> : <Eye />}
                            style={{ color: '#a0aec0' }}
                          />
                        }
                      />
                    </Form.Item> */}

                                        <Form.Item>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                loading={loading}
                                                icon={<Shield />}
                                                style={{ width: '100%', borderRadius: '8px', background: 'linear-gradient(90deg, #3182ce, #805ad5)', height: '40px' }}
                                            >
                                                {loading ? 'Logging in...' : 'Login to Bitwarden'}
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                )
                            },
                            {
                                key: 'unlock',
                                label: 'Unlock Vault',
                                disabled: !isLoggedIn || vaultStatus === 'unlocked',
                                children: (
                                    <Form form={unlockForm} onFinish={handleUnlock} layout="vertical" style={{ marginTop: '24px' }}>
                                        <Form.Item
                                            name="unlockPassword"
                                            label="Master Password"
                                            rules={[{ required: true, message: 'Please input your password!' }]}
                                        >
                                            <Input
                                                type={showUnlockPassword ? 'text' : 'password'}
                                                placeholder="Enter your master password to unlock"
                                                disabled={loading}
                                                style={{ borderRadius: '8px', padding: '12px' }}
                                                suffix={
                                                    <Button
                                                        type="text"
                                                        onClick={() => setShowUnlockPassword(!showUnlockPassword)}
                                                        icon={showUnlockPassword ? <EyeOff /> : <Eye />}
                                                        style={{ color: '#a0aec0' }}
                                                    />
                                                }
                                            />
                                        </Form.Item>

                                        <Form.Item>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                loading={loading}
                                                icon={<Unlock />}
                                                style={{ width: '100%', borderRadius: '8px', background: 'linear-gradient(90deg, #3182ce, #805ad5)', height: '40px' }}
                                            >
                                                {loading ? 'Unlocking...' : 'Unlock Vault'}
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                )
                            }
                        ]}
                        style={{ marginBottom: '24px' }}
                        tabBarStyle={{ borderBottom: '2px solid #e8e8e8' }}
                    />

                    {error && (
                        <Card style={{
                            marginTop: '16px',
                            background: '#fff1f0',
                            border: '1px solid #feb2b2',
                            borderRadius: '8px',
                            padding: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle style={{ fontSize: '20px', color: '#c53030' }} />
                                <span style={{ fontWeight: 500, color: '#c53030' }}>{error}</span>
                            </div>
                        </Card>
                    )}
                </div>

                <div style={{ padding: '24px', background: '#f7fafc', borderTop: '1px solid #e8e8e8' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <Shield style={{ fontSize: '20px', color: '#3182ce', marginTop: '2px' }} />
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: 500, color: '#1a202c' }}>Secure Access</p>
                            <p style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
                                Use your Bitwarden email, master password, and code for secure access to your vault.
                            </p>
                        </div>
                    </div>
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

    useEffect(() => {
        socketManager.connect();

        socketManager.on('connected', (data: any) => {
            setIsConnected(true);
            showMessage(data.message, 'success');
        });

        socketManager.on('login_success', (data: any) => {
            showMessage(data.message, 'success');
            setIsLoggedIn(true);
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
            } else if (status.payload.status.status === 'locked') {
                setIsLoggedIn(true);
                setVaultStatus('locked');
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
                socketManager.disconnect();
                showMessage('Successfully logged out', 'success');
            } else {
                showMessage(result.message || 'Failed to logout', 'error');
            }
        } catch (error) {
            showMessage('Failed to connect to server', 'error');
        }
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
                {!isLoggedIn || vaultStatus === 'locked' ? (
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

