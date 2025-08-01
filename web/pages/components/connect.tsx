import React, { useEffect, useState } from 'react';
import { Modal, Button, Card, Avatar, Typography, Space } from 'antd';
import { Apple, Mail, Chrome, Check, UserPlus, User } from 'lucide-react';
import { CatppuccinFolderConnection } from './icons';
import { ACTIVE_BG_COLOR } from '../../app/comman';
import { API_URL } from '../../services/apiConfig';
import { useCurrentUser } from '../../app/userContext';
import { getUserConnectedAccounts } from '../../services/dashboard';
import { trimGooglePhotoUrl } from './header';
import { useGlobalLoading } from '../../app/loadingContext';

const { Title, Text } = Typography;

interface FolderConnectionModalProps {
    isModalVisible: boolean;
    setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

type ConnectedAccount = {
    provider: string;
    email?: string;
    user_object?: string;
    [key: string]: any;
};

const FolderConnectionModal: React.FC<FolderConnectionModalProps> = ({ isModalVisible, setIsModalVisible }) => {
    const [connections, setConnections] = useState({ apple: false, outlook: false, google: false });
    const { loading, setLoading } = useGlobalLoading();
    const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
    const currentUser = useCurrentUser();

    useEffect(() => {
        getConnectedAccounts();
    }, []);

    const getConnectedAccounts = async () => {
        setLoading(true);
        const response = await getUserConnectedAccounts({});
        const { status, payload } = response.data;

        if (status) {
            const connected = { apple: false, outlook: false, google: false };
            payload.connectedAccounts.forEach((acc: ConnectedAccount) => {
                if (acc.provider in connected) {
                    connected[acc.provider as keyof typeof connected] = true;
                }
            });
            setConnectedAccounts(payload.connectedAccounts);
            setConnections(connected);
        }

        setLoading(false);
    };

    const handleConnect = (service: string) => {
        if (service === 'google') {
            window.location.href = `${API_URL}/add-googleCalendar?username=${currentUser?.user_name}&userId=${currentUser?.uid}`;
        }
        else if (service === "outlook") {
            window.location.href = `${API_URL}/add-microsoftAccount?username=${currentUser?.user_name}&userId=${currentUser?.uid}`;
        }
    };

    const renderGoogleAccounts = () => {
        const googleAccounts = connectedAccounts.filter(acc => acc.provider === 'google');
        if (!googleAccounts.length) return null;


        return (
            <div style={{ marginTop: 12, paddingLeft: 64 }}>
                {googleAccounts.map((acc, idx) => {
                    let userData = null;
                    try {
                        userData = acc.user_object ? JSON.parse(acc.user_object) : null;
                    } catch (_) { }
                    const trimmedUrl = trimGooglePhotoUrl(userData?.picture);

                    return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                            <Avatar
                                size={32}
                                src={trimmedUrl}
                                icon={!userData?.picture && <User size={16} />}
                                style={{ marginRight: 8 }}
                            />
                            <Text>{userData?.email || acc.email}</Text>
                        </div>
                    );
                })}
                <Button
                    type="dashed"
                    icon={<UserPlus size={16} />}
                    onClick={() => handleConnect('google')}
                    size="small"
                    style={{ marginTop: 8 }}
                >
                    Add another account
                </Button>
            </div>
        );
    };

    const renderOutlookAccounts = () => {
        const outlookAccounts = connectedAccounts.filter(acc => acc.provider === 'outlook');
        if (!outlookAccounts.length) return null;

        return (
            <div style={{ marginTop: 12, paddingLeft: 64 }}>
                {outlookAccounts.map((acc, idx) => {
                    let userData = null;
                    try {
                        userData = acc.user_object ? JSON.parse(acc.user_object) : null;
                    } catch (_) { }

                    const picture = userData?.picture || null;

                    return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                            <Avatar
                                size={32}
                                src={picture}
                                icon={!picture && <User size={16} />}
                                style={{ marginRight: 8 }}
                            />
                            <Text>{userData?.email || acc.email}</Text>
                        </div>
                    );
                })}
                <Button
                    type="dashed"
                    icon={<UserPlus size={16} />}
                    onClick={() => handleConnect('outlook')}
                    size="small"
                    style={{ marginTop: 8 }}
                >
                    Add another account
                </Button>
            </div>
        );
    };

    const connectionData = [
        {
            key: 'apple',
            name: 'Apple iCloud',
            icon: <Apple size={24} style={{ color: '#000' }} />,
            color: '#000',
            bgColor: '#f5f5f5',
        },
        {
            key: 'outlook',
            name: 'Microsoft Outlook',
            icon: <Mail size={24} style={{ color: '#0078d4' }} />,
            color: '#0078d4',
            bgColor: '#e3f2fd',
        },
        {
            key: 'google',
            name: 'Google Drive',
            icon: <Chrome size={24} style={{ color: '#4285f4' }} />,
            color: '#4285f4',
            bgColor: '#e8f0fe',
        },
    ];

    return (
        <Modal
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            width={580}
            centered
            closeIcon={<div style={{ fontSize: '18px', color: '#999' }}>×</div>}
            styles={{
                body: {
                    padding: 0,
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            {/* Sticky Header */}
            <div
                style={{
                    padding: '24px 32px',
                    background: ACTIVE_BG_COLOR,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    borderBottom: '1px solid #e0e0e0',
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '20px',
                            background: '#fff',
                            margin: '0 auto 16px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <CatppuccinFolderConnection />
                    </div>
                    <Title level={3} style={{ margin: 0, color: '#2c3e50' }}>
                        Connect Your Accounts
                    </Title>
                    <Text style={{ color: '#7f8c8d', fontSize: '14px' }}>
                        Link your accounts to sync your <strong>Files, Calendar and Health</strong>
                    </Text>
                </div>
            </div>

            {/* Scrollable Body */}
            <div
                style={{
                    padding: '24px 32px',
                    overflowY: 'auto',
                    flexGrow: 1,
                }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {connectionData.map((service) => {
                        const key = service.key as keyof typeof connections;
                        return (
                            <Card
                                key={service.key}
                                style={{
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    cursor: 'pointer',
                                }}
                            // bodyStyle={{ padding: '20px' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <Avatar size={48} style={{ backgroundColor: service.bgColor }}>
                                            {service.icon}
                                        </Avatar>
                                        <div>
                                            <Title level={5} style={{ margin: 0 }}>{service.name}</Title>
                                            <Text type={connections[key] ? 'success' : 'secondary'}>
                                                {connections[key] ? 'Connected' : 'Not Connected'}
                                            </Text>
                                        </div>
                                    </div>

                                    <Button
                                        type={connections[key] ? 'default' : 'primary'}
                                        onClick={() => handleConnect(service.key)}
                                        icon={connections[key] ? <Check size={16} style={{ color: '#52c41a' }} /> : null}
                                        loading={loading}
                                        style={{
                                            borderRadius: 8,
                                            background: connections[key]
                                                ? '#fff'
                                                : `linear-gradient(135deg, ${service.color} 0%, ${service.color}dd 100%)`,
                                            color: connections[key] ? '#333' : '#fff',
                                            border: connections[key] ? '1px solid #d9d9d9' : 'none'
                                        }}
                                    >
                                        {connections[key] ? 'Connected' : 'Connect'}
                                    </Button>
                                </div>
                                {service.key === 'outlook' && connections.outlook && renderOutlookAccounts()}
                                {service.key === 'google' && connections.google && renderGoogleAccounts()}
                            </Card>
                        );
                    })}
                </Space>
            </div>

            {/* Bottom Info */}
            <div
                style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #e0e0e0',
                    textAlign: 'center',
                    background: '#f9fafb',
                }}
            >
                <Text style={{ fontSize: 12, color: '#999' }}>
                    Your data is encrypted and secure. We never access your personal files.
                </Text>
            </div>
        </Modal>
    );
};

export default FolderConnectionModal;