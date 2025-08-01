import React, { useState } from 'react';
import { Card, Avatar, Button, Space, Typography, Row, Col, Dropdown, Menu, Tag } from 'antd';
import { PlusOutlined, UserOutlined, CloseOutlined } from '@ant-design/icons';
import ProfilePage from '../../../app/[username]/family-hub/profile/[id]/page';

const { Text } = Typography;

interface FamilyMember {
    id: number;
    name: string;
    role: string;
    type: 'family' | 'pets';
    color: string;
    initials: string;
    status?: 'pending' | 'accepted';
    isPet?: boolean;
}

interface FamilyMembersCardProps {
    familyMembers: FamilyMember[];
    activeFilter: 'all' | 'family' | 'pets';
    setActiveFilter: (filter: 'all' | 'family' | 'pets') => void;
    dUser: any;
    handleAddMember: (type: string) => void;
    selectedMemberId: number | null;
    setSelectedMemberId: (id: number | null) => void;
}

const capitalizeEachWord = (str: string) => {
    return str.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.charAt(1).toLowerCase()
    );
};

const FamilyMembersCard: React.FC<FamilyMembersCardProps> = ({
    familyMembers,
    activeFilter,
    setActiveFilter,
    dUser,
    handleAddMember,
    selectedMemberId,
    setSelectedMemberId
}) => {
    const filteredMembers = familyMembers.filter(member => {
        if (activeFilter === 'all') return true;
        return member.type === activeFilter;
    });

    const handleMemberClick = (memberId: number) => {
        setSelectedMemberId(memberId);
    };

    const handleCloseProfile = () => {
        setSelectedMemberId(null);
    };

    const addMenu = (
        <Menu
            items={[
                {
                    key: 'family',
                    label: 'Add Family Member',
                    onClick: () => handleAddMember('family')
                },
                {
                    key: 'pet',
                    label: 'Add Pet',
                    onClick: () => handleAddMember('pets')
                }
            ]}
        />
    );

    return (
        <>
            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Family Members ({filteredMembers.length})</span>
                    </div>
                }
                extra={
                    <Dropdown overlay={addMenu} trigger={['click']}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="large"
                            style={{
                                borderRadius: "12px",
                                background: "#1890ff",
                                borderColor: "#1890ff",
                            }}
                        >

                        </Button>
                    </Dropdown>
                }
                style={{ marginBottom: '24px', borderRadius: '12px' }}
                bodyStyle={{ padding: '16px' }}
            >
                <Row gutter={[20, 20]} style={{ marginBottom: 0 }}>
                    {filteredMembers.map((member) => (
                        <Col
                            key={member.id}
                            style={{
                                minWidth: '120px',
                                maxWidth: '280px',
                                width: 'auto',
                                flex: '0 0 auto'
                            }}
                        >
                            <Card
                                size="small"
                                hoverable
                                onClick={() => handleMemberClick(member.id)}
                                style={{
                                    textAlign: 'left',
                                    height: '60px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    transition: 'all 0.3s ease',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    opacity: member.status === 'pending' ? 0.6 : 1,
                                    position: 'relative',
                                    marginBottom: '10px',
                                    cursor: 'pointer',
                                    borderColor: selectedMemberId === member.id ? member.color : '#e2e8f0'
                                }}
                                styles={{ body: { padding: '12px 16px', display: 'flex', alignItems: 'center' } }}
                            >
                                {member.status === 'pending' && (
                                    <span style={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 8,
                                        backgroundColor: '#f59e0b',
                                        color: 'white',
                                        fontSize: '9px',
                                        padding: '2px 6px',
                                        borderRadius: '12px',
                                        fontWeight: 500,
                                        textTransform: 'uppercase'
                                    }}>
                                        Waiting
                                    </span>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <Avatar
                                        size={36}
                                        style={{
                                            background: `linear-gradient(135deg, ${member.color} 0%, ${member.color}dd 100%)`,
                                            border: '2px solid white',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            marginRight: 12,
                                            flexShrink: 0
                                        }}
                                        icon={!member.isPet && !member.initials ? <UserOutlined /> : undefined}
                                    >
                                        {member.initials}
                                    </Avatar>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: '#1e293b',
                                            marginBottom: 2,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {member.name}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Card>

            {/* Profile Details Section */}
            {selectedMemberId && (
                <Card
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Profile Details</span>
                            <Button
                                type="text"
                                icon={<CloseOutlined />}
                                onClick={handleCloseProfile}
                                size="small"
                                style={{ color: '#666' }}
                            />
                        </div>
                    }
                    style={{ marginBottom: '24px', borderRadius: '12px' }}
                    bodyStyle={{ padding: 0, margin: 0 }}
                >
                    <ProfilePage
                        memberId={selectedMemberId.toString()}
                        onBack={handleCloseProfile}
                    />
                </Card>
            )}
        </>
    );
};

export default FamilyMembersCard;