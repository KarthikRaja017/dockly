'use client';
// import PetInviteForm from '../../../pages/family-hub/PetsInviteForm';
import { addContacts, getUsersFamilyMembers } from '../../../services/family';
import axios from 'axios';
import FamilyInviteForm from '../FamilyInviteForm';
import { Heart, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCurrentUser } from '../../../app/userContext';
interface FamilyMember {
    id: number;
    name: string;
    role: string;
    type: 'family' | 'pets';
    color: string;
    initials: string;
}

const FamilyMembers: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState<'all' | 'family' | 'pets'>('all');
    const [isFamilyModalVisible, setIsFamilyModalVisible] = useState(false);
    const [isPetModalVisible, setIsPetModalVisible] = useState(false);
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const currentUser = useCurrentUser();
    const dUser = currentUser?.duser

    const filteredMembers = familyMembers.filter(member => {
        if (activeFilter === 'all') return true;
        return member.type === activeFilter;
    });

    const handleAddMember = async (type: string) => {
        if (type === 'family') {
            setIsFamilyModalVisible(true);
        } else {
            setIsPetModalVisible(true);
        }
    };
    const [loading, setLoading] = useState<boolean>(false);


    const handleFamilyFormSubmit = async (formData: any) => {
        setLoading(true);
        const newId = Math.max(...familyMembers.map(m => m.id)) + 1;
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
            },
        ]);

        setIsFamilyModalVisible(false);
        setLoading(false);
    };

    const handlePetFormSubmit = async (formData: any) => {
        setLoading(true);
        const newId = Math.max(...familyMembers.map(m => m.id)) + 1;
        const newColor = '#fbbf24'; // Consistent color for pets
        const role = `${formData.petType === 'Other' ? formData.petBreed : formData.petType}`;

        setFamilyMembers(prev => [
            ...prev,
            {
                id: newId,
                name: formData.petName,
                role,
                type: 'pets',
                color: newColor,
                initials: formData.petType === 'Dog' ? '🐕' : formData.petType === 'Cat' ? '🐈' : formData.petType === 'Bird' ? '🐦' : formData.petType === 'Fish' ? '🐠' : formData.petType === 'Rabbit' ? '🐇' : '🐾',
            },
        ]);

        setIsPetModalVisible(false);
        setLoading(false);
    };

    const getMembers = async () => {
        if (dUser !== undefined) {
            const fuser = localStorage.getItem("fuser")
            const response = await getUsersFamilyMembers({ dUser: dUser, fuser: fuser });
            const { status, payload } = response;
            if (status) {
                const transformedMembers = payload.members.map((member: any, index: any) => {
                    const name = member.name || "Unnamed";
                    const id = member.id
                    const initials = name
                        .split(" ")
                        .map((word: any[]) => word[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase();

                    const role = member.relationship?.replace(/[^a-zA-Z\s]/g, '') || "Unknown";

                    return {
                        id, // or use member.id if available
                        name,
                        role,
                        type: 'family',
                        color: getRandomColor(), // define this function separately
                        initials
                    };
                });

                setFamilyMembers(transformedMembers);
            }
        }
    };

    const getRandomColor = () => {
        const colors = ['#FF6B6B', '#6BCB77', '#4D96FF', '#FFD93D', '#845EC2'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    useEffect(() => {
        getMembers();
    }, []);

    const handleFamilyCancel = () => {
        setIsFamilyModalVisible(false);
    };

    const handlePetCancel = () => {
        setIsPetModalVisible(false);
    };

    return (
        <div
            style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                padding: '24px',
                marginBottom: '24px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                }}
            >
                <h3
                    style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#111827',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        margin: 0,
                    }}
                >
                    <Users size={20} style={{ opacity: 0.8 }} />
                    Family Members & Pets
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['all', 'family', 'pets'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter as 'all' | 'family' | 'pets')}
                            style={{
                                padding: '6px 16px',
                                border: '1px solid #e5e7eb',
                                backgroundColor: activeFilter === filter ? '#3355ff' : 'white',
                                color: activeFilter === filter ? 'white' : '#374151',
                                borderColor: activeFilter === filter ? '#3355ff' : '#e5e7eb',
                                borderRadius: '6px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textTransform: 'capitalize',
                            }}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '20px',
                }}
            >

                {filteredMembers.map((member, idx) => (
                    <div
                        key={member.id ?? idx}
                        style={{
                            backgroundColor: '#f0f4f8',
                            borderRadius: '8px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: '1px solid #e5e7eb',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.1)';
                            e.currentTarget.style.borderColor = '#3355ff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                        }}
                    >
                        <div
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '32px',
                                backgroundColor: member.color,
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: member.type === 'pets' ? '24px' : '24px',
                                fontWeight: 600,
                                marginBottom: '12px',
                            }}
                        >
                            {member.initials}
                        </div>
                        <div
                            style={{
                                fontSize: '16px',
                                fontWeight: 500,
                                marginBottom: '4px',
                                textAlign: 'center',
                                color: '#374151',
                            }}
                        >
                            {member.name}
                        </div>
                        <div
                            style={{
                                fontSize: '13px',
                                color: '#6b7280',
                                textAlign: 'center',
                            }}
                        >
                            {member.role}
                        </div>
                    </div>
                ))}
            </div>

            {dUser === 1 && (<div style={{ display: 'flex', gap: '12px' }}>
                <button
                    onClick={() => handleAddMember('family')}
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
                    Add Family Member
                </button>
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
                    <Heart size={16} style={{ opacity: 0.7 }} />
                    Add Pet
                </button>
                {/* <PetInviteForm
                    visible={isPetModalVisible}
                    onCancel={handlePetCancel}
                    onSubmit={handlePetFormSubmit}
                /> */}
            </div>)}
        </div>
    );
};

export default FamilyMembers;

