'use client';
import React, { useState, useEffect } from 'react';
import {
    Layout,
    Button,
    Typography,
    Space,
    Row,
    Col,
    message
} from 'antd';
import {
    LeftOutlined,
    ShareAltOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import NotesLists from '../../pages/family-hub/components/familyNotesLists';
import GuardianSection from '../../pages/family-hub/components/guardians';

// Import backend services and contexts
import { useCurrentUser } from '../../app/userContext';
import { getPets, getUsersFamilyMembers } from '../../services/family';
import { useGlobalLoading } from '../../app/loadingContext';
import { capitalizeEachWord, PRIMARY_COLOR } from '../../app/comman';
import FamilyInviteForm from '../../pages/family-hub/FamilyInviteForm';
import PetInviteForm from '../../pages/family-hub/PetsInviteForm';
import FamilyMembersCard from './components/FamilyMembersCard';
import FamilyTasks from './components/FamilyTask';
import TodaysSchedule from './components/TodaysSchedule';
import WeekHighlights from './components/WeekHighlights';
import BookmarkHub from '../components/bookmarks';
const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface FamilyMember {
    id: number;
    name: string;
    role: string;
    type: 'family' | 'pets';
    color: string;
    initials: string;
    status?: 'pending' | 'accepted';
    isPet?: boolean;
    user_id?: string;
}

const FamilyHubPage: React.FC = () => {
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [activeFilter, setActiveFilter] = useState<'all' | 'family' | 'pets'>('all');
    const [isFamilyModalVisible, setIsFamilyModalVisible] = useState(false);
    const [isPetModalVisible, setIsPetModalVisible] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

    // Contexts for backend integration
    const currentUser = useCurrentUser();
    const dUser = currentUser?.duser;
    const { loading, setLoading } = useGlobalLoading();

    // Helper to get a random color for avatars
    const getRandomColor = () => {
        const colors = [
            '#FF6B6B', '#6BCB77', '#FFD93D', '#845EC2', '#FF9671',
            '#FFC75F', '#F9F871', '#D65DB1', '#FFB085', '#B0C926'
        ];
        const filteredColors = colors.filter(color => color.toLowerCase() !== PRIMARY_COLOR.toLowerCase());
        return filteredColors[Math.floor(Math.random() * filteredColors.length)];
    };

    // Function to fetch pet data
    const getPetsData = async () => {
        try {
            const response = await getPets();
            const { status, payload } = response.data;
            if (status === 1) {
                const formattedPets = payload.pets.map((pet: any, index: number) => ({
                    id: pet.id,
                    name: pet.name,
                    role: `${pet.species} - ${pet.breed}`,
                    type: 'pets',
                    color: '#fbbf24',
                    initials: pet.species === 'Dog' ? '🐕' :
                        pet.species === 'Cat' ? '🐈' :
                            pet.species === 'Bird' ? '🐦' :
                                pet.species === 'Fish' ? '🐠' :
                                    pet.species === 'Rabbit' ? '🐇' : '🐾',
                    isPet: true,
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

    // Function to fetch family members data
    const getMembers = async () => {
        setLoading(true);
        if (dUser !== undefined) {
            const fuser = localStorage.getItem("fuser");
            try {
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
                            user_id: member.user_id,
                            status: member.status || 'accepted',
                            sharedItems: member.sharedItems || {},
                            permissions: member.permissions || {},
                        };
                    });

                    const pets = await getPetsData();

                    const meMember = transformedMembers.find((m: any) => m.role.toLowerCase() === 'me');
                    const otherMembers = transformedMembers.filter((m: any) => m.role.toLowerCase() !== 'me');
                    const sortedMembers = meMember ? [meMember, ...otherMembers] : otherMembers;

                    setFamilyMembers([...sortedMembers, ...pets]);
                } else {
                    message.error('Failed to fetch family members');
                }
            } catch (error) {
                message.error('Failed to fetch family members');
            } finally {
                setLoading(false);
            }
        }
    };

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
                role: formData.relationship?.replace(/[^a-zA-Z\s]/g, '') || "Unknown",
                type: 'family',
                color: newColor,
                initials,
                status: 'pending',
            },
        ]);

        setIsFamilyModalVisible(false);
        setLoading(false);
        message.success('Family member added successfully!');
    };

    const handlePetFormSubmit = async (formData: any) => {
        setLoading(true);
        const newId = Math.max(...(familyMembers ?? []).map(m => m.id), 0) + 1;
        const newColor = '#fbbf24';
        const initials = formData.species === 'Dog' ? '🐕' :
            formData.species === 'Cat' ? '🐈' :
                formData.species === 'Bird' ? '🐦' :
                    formData.species === 'Fish' ? '🐠' :
                        formData.species === 'Rabbit' ? '🐇' : '🐾';

        setFamilyMembers(prev => [
            ...prev,
            {
                id: newId,
                name: formData.name,
                role: `${formData.species} - ${formData.breed}`,
                type: 'pets',
                color: newColor,
                initials,
                isPet: true,
            },
        ]);

        setIsPetModalVisible(false);
        setLoading(false);
        message.success('Pet added successfully!');
    };

    const handleFamilyCancel = () => setIsFamilyModalVisible(false);
    const handlePetCancel = () => setIsPetModalVisible(false);

    // Fetch data on component mount
    useEffect(() => {
        getMembers();
    }, [dUser]);

    const contentStyle: React.CSSProperties = {
        padding: '20px 30px',
        background: '#f9fafb',
        minHeight: '100vh'
    };

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e5e7eb',
        background: 'transparent',
        padding: 0
    };

    // Dynamic title and icon based on selected member
    const getPageTitle = () => {
        return selectedMemberId ? 'Profile Details' : 'Family Hub';
    };

    const getPageIcon = () => {
        return selectedMemberId ? '👤' : '👨‍👩‍👧‍👦';
    };

    return (
        <Layout style={{ minHeight: '100vh', marginTop: '62px', marginLeft: '40px' }}>
            <Layout>
                <Content style={contentStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: selectedMemberId ? '#f3f4f6' : '#eef1ff',
                            color: selectedMemberId ? '#6b7280' : '#3355ff',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            marginRight: '12px',
                            transition: 'all 0.3s ease'
                        }}>
                            {getPageIcon()}
                        </div>
                        <Title level={3} style={{ margin: 0, transition: 'all 0.3s ease' }}>
                            {getPageTitle()}
                        </Title>
                    </div>

                    <FamilyMembersCard
                        familyMembers={familyMembers}
                        activeFilter={activeFilter}
                        setActiveFilter={setActiveFilter}
                        dUser={dUser}
                        handleAddMember={handleAddMember}
                        selectedMemberId={selectedMemberId}
                        setSelectedMemberId={setSelectedMemberId}
                    />

                    {/* Only show other sections when no member is selected */}
                    {!selectedMemberId && (
                        <>
                            <Row gutter={12} style={{ marginBottom: '16px' }}>
                                <Col xs={24} lg={12}>
                                    <TodaysSchedule familyMembers={familyMembers} />
                                </Col>
                                <Col xs={24} lg={12}>
                                    <WeekHighlights familyMembers={familyMembers} />
                                </Col>
                            </Row>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1.2fr 1fr 1fr',
                                    gap: '8px',
                                    marginBottom: '8px',
                                }}
                            >
                                <FamilyTasks familyMembers={familyMembers.filter(m => m.type === 'family')} />
                                <BookmarkHub />
                                <NotesLists currentHub="family" />
                            </div>

                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    gap: '8px',
                                    marginBottom: '8px',
                                }}
                            >
                                <GuardianSection />
                            </div>
                        </>
                    )}

                    {/* Modals for adding members */}
                    <FamilyInviteForm
                        visible={isFamilyModalVisible}
                        onCancel={handleFamilyCancel}
                        isEditMode={false}
                        onSubmit={handleFamilyFormSubmit}
                    />
                    <PetInviteForm
                        visible={isPetModalVisible}
                        onCancel={handlePetCancel}
                        onSubmit={handlePetFormSubmit}
                    />
                </Content>
            </Layout>
        </Layout>
    );
};

export default FamilyHubPage;