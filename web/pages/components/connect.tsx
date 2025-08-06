import React, { useEffect, useState } from 'react';
import { Modal, Button, Card, Avatar, Typography, Space } from 'antd';
import { Apple, Mail, Chrome, Check, UserPlus, User } from 'lucide-react';
import { CatppuccinFolderConnection } from './icons';
import { ACTIVE_BG_COLOR, PRIMARY_COLOR } from '../../app/comman';
import { API_URL } from '../../services/apiConfig';
import { useCurrentUser } from '../../app/userContext';
import { getUserConnectedAccounts } from '../../services/dashboard';
// import { trimGooglePhotoUrl } from './CustomHeader';
import { useGlobalLoading } from '../../app/loadingContext';
import { trimGooglePhotoUrl } from './header';

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

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
            <div style={{
                marginTop: 16,
                paddingLeft: 64,
                background: `${PRIMARY_COLOR}05`,
                borderRadius: 8,
                padding: '12px 16px',
                border: `1px solid ${PRIMARY_COLOR}15`
            }}>
                {googleAccounts.map((acc, idx) => {
                    let userData = null;
                    try {
                        userData = acc.user_object ? JSON.parse(acc.user_object) : null;
                    } catch (_) { }
                    const trimmedUrl = trimGooglePhotoUrl(userData?.picture);

                    return (
                        <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: idx === googleAccounts.length - 1 ? 0 : 12,
                            padding: '8px',
                            borderRadius: 6,
                            background: 'white',
                            boxShadow: `0 2px 4px ${PRIMARY_COLOR}10`,
                            transition: 'all 0.3s ease'
                        }}>
                            <Avatar
                                size={32}
                                src={trimmedUrl}
                                icon={!userData?.picture && <User size={16} />}
                                style={{
                                    marginRight: 12,
                                    border: `2px solid ${PRIMARY_COLOR}20`
                                }}
                            />
                            <Text style={{ fontFamily: FONT_FAMILY, fontWeight: 500 }}>
                                {userData?.email || acc.email}
                            </Text>
                        </div>
                    );
                })}
                <Button
                    type="dashed"
                    icon={<UserPlus size={16} />}
                    onClick={() => handleConnect('google')}
                    size="small"
                    style={{
                        marginTop: 12,
                        fontFamily: FONT_FAMILY,
                        borderColor: PRIMARY_COLOR,
                        color: PRIMARY_COLOR,
                        transition: 'all 0.3s ease'
                    }}
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
            <div style={{
                marginTop: 16,
                paddingLeft: 64,
                background: `${PRIMARY_COLOR}05`,
                borderRadius: 8,
                padding: '12px 16px',
                border: `1px solid ${PRIMARY_COLOR}15`
            }}>
                {outlookAccounts.map((acc, idx) => {
                    let userData = null;
                    try {
                        userData = acc.user_object ? JSON.parse(acc.user_object) : null;
                    } catch (_) { }

                    const picture = userData?.picture || null;

                    return (
                        <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: idx === outlookAccounts.length - 1 ? 0 : 12,
                            padding: '8px',
                            borderRadius: 6,
                            background: 'white',
                            boxShadow: `0 2px 4px ${PRIMARY_COLOR}10`,
                            transition: 'all 0.3s ease'
                        }}>
                            <Avatar
                                size={32}
                                src={picture}
                                icon={!picture && <User size={16} />}
                                style={{
                                    marginRight: 12,
                                    border: `2px solid ${PRIMARY_COLOR}20`
                                }}
                            />
                            <Text style={{ fontFamily: FONT_FAMILY, fontWeight: 500 }}>
                                {userData?.email || acc.email}
                            </Text>
                        </div>
                    );
                })}
                <Button
                    type="dashed"
                    icon={<UserPlus size={16} />}
                    onClick={() => handleConnect('outlook')}
                    size="small"
                    style={{
                        marginTop: 12,
                        fontFamily: FONT_FAMILY,
                        borderColor: PRIMARY_COLOR,
                        color: PRIMARY_COLOR,
                        transition: 'all 0.3s ease'
                    }}
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
            bgColor: `${PRIMARY_COLOR}08`,
        },
        {
            key: 'outlook',
            name: 'Microsoft Outlook',
            icon: <Mail size={24} style={{ color: '#0078d4' }} />,
            color: '#0078d4',
            bgColor: `${PRIMARY_COLOR}08`,
        },
        {
            key: 'google',
            name: 'Google Drive',
            icon: <Chrome size={24} style={{ color: '#4285f4' }} />,
            color: '#4285f4',
            bgColor: `${PRIMARY_COLOR}08`,
        },
    ];

    return (
        <Modal
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            width={600}
            centered
            closeIcon={
                <div style={{
                    fontSize: '20px',
                    color: '#999',
                    transition: 'all 0.3s ease',
                    fontFamily: FONT_FAMILY
                }}>
                    ×
                </div>
            }
            styles={{
                body: {
                    padding: 0,
                    background: `linear-gradient(135deg, ${PRIMARY_COLOR}05 0%, ${PRIMARY_COLOR}02 100%)`,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    fontFamily: FONT_FAMILY
                }
            }}
        >
            {/* Enhanced Header */}
            <div
                style={{
                    padding: '8px 12px',
                    background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_COLOR}dd 100%)`,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    borderBottom: `1px solid ${PRIMARY_COLOR}20`,
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '20px',
                            background: 'white',
                            margin: '0 auto 10px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxShadow: `0 8px 24px ${PRIMARY_COLOR}30`,
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <CatppuccinFolderConnection />
                    </div>
                    <Title
                        level={3}
                        style={{
                            margin: 0,
                            color: 'white',
                            fontFamily: FONT_FAMILY,
                            fontWeight: 400,
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        Connect Your Accounts
                    </Title>
                    <Text style={{
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '15px',
                        fontFamily: FONT_FAMILY,
                        fontWeight: 200
                    }}>
                        Link your accounts to sync your <strong>Files, Calendar and Health</strong>
                    </Text>
                </div>
            </div>

            {/* Enhanced Scrollable Body */}
            <div
                style={{
                    padding: '18px 22px',
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
                                    borderRadius: '16px',
                                    boxShadow: `0 4px 16px ${PRIMARY_COLOR}15`,
                                    cursor: 'pointer',
                                    border: `1px solid ${PRIMARY_COLOR}10`,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    background: 'white',
                                    fontFamily: FONT_FAMILY
                                }}
                                bodyStyle={{ padding: '24px' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = `0 8px 24px ${PRIMARY_COLOR}25`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = `0 4px 16px ${PRIMARY_COLOR}15`;
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                        <Avatar
                                            size={46}
                                            style={{
                                                backgroundColor: service.bgColor,
                                                border: `2px solid ${PRIMARY_COLOR}20`,
                                                boxShadow: `0 4px 12px ${PRIMARY_COLOR}20`
                                            }}
                                        >
                                            {service.icon}
                                        </Avatar>
                                        <div>
                                            <Title
                                                level={5}
                                                style={{
                                                    margin: 0,
                                                    marginBottom: 2,
                                                    fontFamily: FONT_FAMILY,
                                                    fontWeight: 400,
                                                    color: '#2c3e50'
                                                }}
                                            >
                                                {service.name}
                                            </Title>
                                            <Text
                                                type={connections[key] ? 'success' : 'secondary'}
                                                style={{
                                                    fontFamily: FONT_FAMILY,
                                                    fontWeight: 200,
                                                    fontSize: '14px'
                                                }}
                                            >
                                                {connections[key] ? '✓ Connected' : 'Not Connected'}
                                            </Text>
                                        </div>
                                    </div>

                                    <Button
                                        type={connections[key] ? 'default' : 'primary'}
                                        onClick={() => handleConnect(service.key)}
                                        icon={connections[key] ? <Check size={16} style={{ color: '#52c41a' }} /> : null}
                                        loading={loading}
                                        style={{
                                            borderRadius: 10,
                                            height: 40,
                                            paddingLeft: 20,
                                            paddingRight: 20,
                                            fontFamily: FONT_FAMILY,
                                            fontWeight: 500,
                                            background: connections[key]
                                                ? 'white'
                                                : `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_COLOR}dd 100%)`,
                                            color: connections[key] ? '#333' : '#fff',
                                            border: connections[key] ? `1px solid ${PRIMARY_COLOR}30` : 'none',
                                            boxShadow: connections[key]
                                                ? `0 2px 8px ${PRIMARY_COLOR}15`
                                                : `0 4px 12px ${PRIMARY_COLOR}30`,
                                            transition: 'all 0.3s ease'
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

            {/* Enhanced Bottom Info */}
            <div
                style={{
                    padding: '20px 32px',
                    borderTop: `1px solid ${PRIMARY_COLOR}15`,
                    textAlign: 'center',
                    background: `${PRIMARY_COLOR}03`,
                }}
            >
                <Text style={{
                    fontSize: 13,
                    color: '#666',
                    fontFamily: FONT_FAMILY,
                    fontWeight: 400
                }}>
                    🔒 Your data is encrypted and secure. We never access your personal files.
                </Text>
            </div>
        </Modal>
    );
};

export default FolderConnectionModal;