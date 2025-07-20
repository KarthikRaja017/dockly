
'use client';
import { useEffect, useState } from 'react';
import { Card, Avatar, Button, Tag, Space, Row, Col, Badge, message } from 'antd';
import { TeamOutlined, PlusOutlined } from '@ant-design/icons';
import { Heart } from 'lucide-react';
import { useCurrentUser } from '../../../app/userContext';
import { getPets, getUsersFamilyMembers } from '../../../services/family';
import FamilyInviteForm from '../FamilyInviteForm';
import { capitalizeEachWord, PRIMARY_COLOR } from '../../../app/comman';
import PetInviteForm from '../PetsInviteForm';
import { useGlobalLoading } from '../../../app/loadingContext';

interface FamilyMembersProps {
    profileVisible: boolean;
    setProfileVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setFamilyMembers: React.Dispatch<React.SetStateAction<any[]>>;
    familyMembers?: any[];
}

const FamilyMembers: React.FC<FamilyMembersProps> = ({ profileVisible, setProfileVisible, setFamilyMembers, familyMembers }) => {
    const [activeFilter, setActiveFilter] = useState<'all' | 'family' | 'pets'>('all');
    const [isFamilyModalVisible, setIsFamilyModalVisible] = useState(false);
    const [isPetModalVisible, setIsPetModalVisible] = useState(false)
    // const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const { loading, setLoading } = useGlobalLoading();

    const currentUser = useCurrentUser();
    const dUser = currentUser?.duser;

    const getRandomColor = () => {
        const colors = [
            '#FF6B6B', '#6BCB77', '#FFD93D', '#845EC2', '#FF9671',
            '#FFC75F', '#F9F871', '#D65DB1', '#FFB085', '#B0C926'
        ];
        const filteredColors = colors.filter(color => color.toLowerCase() !== PRIMARY_COLOR.toLowerCase());
        return filteredColors[Math.floor(Math.random() * filteredColors.length)];
    };

    const getPetsData = async () => {
        try {
            const response = await getPets();
            const { status, payload } = response.data;
            if (status === 1) {
                const formattedPets = payload.pets.map((pet: any, index: number) => ({
                    id: Math.max(...(familyMembers ?? []).map(m => m.id), 0) + index + 1,
                    name: pet.name,
                    role: `${pet.species} - ${pet.breed}`,
                    type: 'pets',
                    color: '#fbbf24',
                    initials: pet.species === 'Dog' ? '🐕' :
                        pet.species === 'Cat' ? '🐈' :
                            pet.species === 'Bird' ? '🐦' :
                                pet.species === 'Fish' ? '🐠' :
                                    pet.species === 'Rabbit' ? '🐇' : '🐾',
                }));
                return formattedPets;
            } else {
                message.error('Failed to fetch pets');
                return [];
            }
        } catch (error) {
            message.error('Failed to fetch pets');
            return [];
        }
    };

    const getMembers = async () => {
        if (dUser !== undefined) {
            const fuser = localStorage.getItem("fuser");
            const response = await getUsersFamilyMembers({ dUser, fuser });
            const { status, payload } = response;

            if (status) {
                const transformedMembers = payload.members.map((member: any) => {
                    const name = member.name || "Unnamed";
                    const id = member.id;
                    const initials = name
                        .split(" ")
                        .map((word: string) => word[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase();

                    const role = member.relationship?.replace(/[^a-zA-Z\s]/g, '') || "Unknown";
                    const color = role.toLowerCase() === 'me' ? PRIMARY_COLOR : getRandomColor();

                    return {
                        id,
                        name,
                        role,
                        type: 'family',
                        color,
                        initials,
                        status: member.status || 'accepted',
                    };
                });

                const pets = await getPetsData();

                const meMember = transformedMembers.find((m: any) => m.role.toLowerCase() === 'me');
                const otherMembers = transformedMembers.filter((m: any) => m.role.toLowerCase() !== 'me');
                const sortedMembers = meMember ? [meMember, ...otherMembers] : otherMembers;

                setFamilyMembers([...sortedMembers, ...pets]);

            }
        }
    };

    useEffect(() => {
        getMembers();
    }, []);

    const filteredMembers = (familyMembers ?? []).filter(member =>
        activeFilter === 'all' ? true : member.type === activeFilter
    );

    const handleAddMember = (type: string) => {
        type === 'family' ? setIsFamilyModalVisible(true) : setIsPetModalVisible(true);
    };

    const handleFamilyFormSubmit = async (formData: any) => {
        setLoading(true);
        const newId = Math.max(...(familyMembers ?? []).map(m => m.id), 0) + 1;
        const newColor = '#34d399';
        const initials = formData.name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

        setFamilyMembers(prev => [
            ...prev,
            {
                id: newId,
                name: formData.name,
                role: formData.relationship.replace(/[^a-zA-Z\s]/g, ''),
                type: 'family',
                color: newColor,
                initials,
                status: 'pending',
            },
        ]);

        setIsFamilyModalVisible(false);
        setLoading(false);
    };

    const handleFamilyCancel = () => setIsFamilyModalVisible(false);
    const handlePetCancel = () => setIsPetModalVisible(false);



    return (
        <Card style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                    <TeamOutlined />
                    Family Members & Pets
                    <Badge count={filteredMembers.length} style={{ backgroundColor: '#667eea', marginLeft: 8 }} />
                </h2>

                <Space size="small">
                    {(['all', 'family', 'pets'] as const).map((filter) => (
                        <Button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            style={{
                                backgroundColor: activeFilter === filter ? '#667eea' : 'white',
                                color: activeFilter === filter ? 'white' : '#374151',
                                border: activeFilter === filter ? 'none' : '1px solid #cbd5e0',
                                borderRadius: '8px',
                                fontWeight: 600,
                                textTransform: 'capitalize',
                                padding: '4px 16px'
                            }}
                        >
                            {filter}
                        </Button>
                    ))}
                </Space>
            </div>

            <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
                {filteredMembers.map((member) => (
                    <Col xs={12} sm={8} md={6} lg={4} key={member.id}>
                        <Card
                            size="small"
                            hoverable
                            onClick={() => setProfileVisible(true)}
                            style={{
                                textAlign: 'center',
                                height: '160px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                transition: 'all 0.3s ease',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                opacity: member.status === 'pending' ? 0.6 : 1,
                                position: 'relative',
                                marginBottom: '10px'
                            }}
                            styles={{ body: { padding: '20px 16px' } }}
                        >
                            {member.status === 'pending' && (
                                <span style={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    backgroundColor: '#f59e0b',
                                    color: 'white',
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    borderRadius: '12px',
                                    fontWeight: 500,
                                    textTransform: 'uppercase'
                                }}>
                                    Waiting
                                </span>
                            )}

                            <Avatar
                                size={56}
                                style={{
                                    background: `linear-gradient(135deg, ${member.color} 0%, ${member.color}dd 100%)`,
                                    border: '3px solid white',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                    fontSize: '20px',
                                    fontWeight: 600,
                                    marginBottom: 12
                                }}
                            >
                                {member.initials}
                            </Avatar>

                            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: 4, color: '#1e293b' }}>
                                {capitalizeEachWord(member.name)}
                            </div>
                            <Tag
                                color={member.type === 'family' ? 'blue' : 'orange'}
                                style={{
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    border: 'none'
                                }}
                            >
                                {member.role}
                            </Tag>
                        </Card>
                    </Col>
                ))}
            </Row>

            {dUser === 1 && (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddMember('family')}
                        style={{
                            backgroundColor: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            padding: '8px 20px',
                            height: '44px'
                        }}
                    >
                        Add Family Member
                    </Button>
                    <FamilyInviteForm
                        visible={isFamilyModalVisible}
                        onCancel={handleFamilyCancel}
                        isEditMode={false}
                        onSubmit={handleFamilyFormSubmit}
                    />


                    <button
                        onClick={() => handleAddMember('pets')}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#374151',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f4f8';
                            e.currentTarget.style.borderColor = '#3355ff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                        }}
                    >
                        <Heart style={{ fontSize: '16px', opacity: 0.7 }} />
                        Add Pet
                    </button>
                    <PetInviteForm
                        visible={isPetModalVisible}
                        onCancel={handlePetCancel}
                        onSubmit={async (formData) => {
                            // TODO: handle pet form submission
                            await getMembers();
                            setIsPetModalVisible(false);
                        }}
                    />
                </Space>
            )}
        </Card>
    );
};

export default FamilyMembers;
