import React, { useState } from 'react';
import { Modal, Button, Card, Avatar, Typography, Space, message } from 'antd';
import { FolderOpen, Apple, Mail, Chrome, Check } from 'lucide-react';
import { CatppuccinFolderConnection } from './icons';
import { ACTIVE_BG_COLOR, PRIMARY_COLOR } from '../../app/comman';
import { API_URL } from '../../services/apiConfig';
import { useCurrentUser } from '../../app/userContext';

const { Title, Text } = Typography;

interface ConnectionStatus {
    apple: boolean;
    outlook: boolean;
    google: boolean;
}
interface FolderConnectionModalProps {
    setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    isModalVisible: boolean;
}

const FolderConnectionModal: React.FC<FolderConnectionModalProps> = ({ isModalVisible, setIsModalVisible }) => {
    const [connections, setConnections] = useState<ConnectionStatus>({
        apple: false,
        outlook: false,
        google: false,
    });
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const currentUser = useCurrentUser();

    const handleConnect = async (service: keyof ConnectionStatus) => {
        setLoading({ ...loading, [service]: true });

        if (service === 'google' && !connections.google) {
            window.location.href = `${API_URL}/add-googleCalendar?username=${currentUser?.user_name}&userId=${currentUser?.uid}`;
            return;
        }
        // Simulate API call
        // setTimeout(() => {
        //     setConnections({ ...connections, [service]: !connections[service] });
        //     setLoading({ ...loading, [service]: false });

        //     if (!connections[service]) {
        //         message.success(`Successfully connected to ${service.charAt(0).toUpperCase() + service.slice(1)}!`);
        //     } else {
        //         message.info(`Disconnected from ${service.charAt(0).toUpperCase() + service.slice(1)}`);
        //     }
        // }, 1500);
    };

    const connectionData = [
        {
            key: 'apple' as keyof ConnectionStatus,
            name: 'Apple iCloud',
            icon: <Apple size={24} style={{ color: '#000' }} />,
            color: '#000',
            bgColor: '#f5f5f5',
        },
        {
            key: 'outlook' as keyof ConnectionStatus,
            name: 'Microsoft Outlook',
            icon: <Mail size={24} style={{ color: '#0078d4' }} />,
            color: '#0078d4',
            bgColor: '#e3f2fd',
        },
        {
            key: 'google' as keyof ConnectionStatus,
            name: 'Google Drive',
            icon: <Chrome size={24} style={{ color: '#4285f4' }} />,
            color: '#4285f4',
            bgColor: '#e8f0fe',
        },
    ];

    return (
        <>
            <Modal
                title={null}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={480}
                centered
                style={{
                    borderRadius: '16px',
                }}
                styles={{
                    body: {
                        padding: '32px',
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        borderRadius: '16px'
                    }
                }}

                closeIcon={
                    <div
                        style={{
                            color: '#666',
                            fontSize: '18px',
                            transition: 'color 0.2s ease',
                        }}
                    >
                        ×
                    </div>
                }
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '64px',
                            height: '64px',
                            borderRadius: '20px',
                            // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            background: ACTIVE_BG_COLOR,
                            marginBottom: '16px',
                            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                        }}
                    >
                        {/* <FolderOpen size={32} style={{ color: '#ffffff' }} /> */}
                        <CatppuccinFolderConnection />
                    </div>
                    <Title level={3} style={{ margin: 0, color: '#2c3e50' }}>
                        Connect Your Accounts
                    </Title>
                    <Text style={{ color: '#7f8c8d', fontSize: '14px' }}>
                        Link your accounts to sync your <strong>
                            Files , Calendar and Health
                        </strong>
                    </Text>
                </div>

                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {connectionData.map((service) => (
                        <Card
                            key={service.key}
                            style={{
                                border: 'none',
                                borderRadius: '12px',
                                background: '#ffffff',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer',
                            }}
                            bodyStyle={{ padding: '20px' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <Avatar
                                        size={48}
                                        style={{
                                            backgroundColor: service.bgColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {service.icon}
                                    </Avatar>
                                    <div>
                                        <Title level={5} style={{ margin: 0, color: '#2c3e50' }}>
                                            {service.name}
                                        </Title>
                                        <Text style={{ color: '#7f8c8d', fontSize: '12px' }}>
                                            {connections[service.key] ? 'Connected' : 'Not connected'}
                                        </Text>
                                    </div>
                                </div>

                                <Button
                                    type={connections[service.key] ? 'default' : 'primary'}
                                    loading={loading[service.key]}
                                    onClick={() => handleConnect(service.key)}
                                    style={{
                                        borderRadius: '8px',
                                        height: '36px',
                                        minWidth: '100px',
                                        border: connections[service.key] ? '1px solid #d9d9d9' : 'none',
                                        background: connections[service.key]
                                            ? '#ffffff'
                                            : `linear-gradient(135deg, ${service.color} 0%, ${service.color}dd 100%)`,
                                        color: connections[service.key] ? '#666' : '#ffffff',
                                        fontWeight: '500',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    {connections[service.key] && (
                                        <Check size={16} style={{ color: '#52c41a' }} />
                                    )}
                                    {connections[service.key] ? 'Connected' : 'Connect'}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </Space>

                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '24px',
                        paddingTop: '24px',
                        borderTop: '1px solid #e8e8e8',
                    }}
                >
                    <Text style={{ color: '#999', fontSize: '12px' }}>
                        Your data is encrypted and secure. We never access your personal files.
                    </Text>
                </div>
            </Modal>
        </>
    );
};

export default FolderConnectionModal;