'use client'
import { ArrowLeft, ArrowRightCircle, BoxSelect, Heart, LayoutPanelLeft, Plus, Search, Share, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import DocklyLoader from '../../utils/docklyLoader';

interface FamilyMember {
    id: number;
    name: string;
    role: string;
    type: 'family' | 'pets';
    color: string;
    initials: string;
    status?: 'pending' | 'accepted';
}

const FamilyHubPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [profileVisible, setProfileVisible] = useState(false);
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [view] = useState<"Day" | "Week" | "Month" | "Year">("Month");
    if (loading) {
        return <DocklyLoader />
    }
    return (
        <div
            style={{
                display: 'flex',
                height: '100vh',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                lineHeight: 1.5,
                color: '#374151',
                backgroundColor: '#f9fafb',
                marginLeft: 40,
                marginTop: 50
            }}
        >
            {profileVisible && (
                <FamilyHubMemberDetails />
            )}
            {!profileVisible && (
                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '20px 30px',
                    }}
                >
                    <BoardTitle />
                    <FamilyMembers profileVisible={profileVisible} setProfileVisible={setProfileVisible} setFamilyMembers={setFamilyMembers} familyMembers={familyMembers} />
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 400px',
                            gap: '24px',
                            marginBottom: '24px',
                        }}
                    >
                        {/* <CustomCalendar data={sampleCalendarData} source="familyhub" allowMentions={true} enabledHashmentions={true} familyMembers={(familyMembers ?? []).filter(m => m.type === 'family')} /> */}
                        {/* <UpcomingActivities /> */}
                        <CustomCalendar data={sampleCalendarData} source="familyhub" allowMentions={true} enabledHashmentions={true} familyMembers={(familyMembers ?? []).filter(m => m.type === 'family')} view={view} />
                    </div>

                    <FamilyNotes />

                    <FamilyTasks />

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '24px',
                            marginBottom: '24px',
                        }}
                    >
                        <GuardiansEmergencyInfo />
                        <ImportantContacts />
                    </div>
                </div>
            )}
        </div>
    );
};

export default FamilyHubPage;

import { DeleteOutlined, EditOutlined, ExportOutlined, EyeInvisibleOutlined, EyeOutlined, PhoneOutlined, PlusOutlined, SafetyOutlined } from '@ant-design/icons';
import { Input as AntInput, Avatar, Button, Col, Form, Input, message, Modal, Popconfirm, Row, Select, Space } from 'antd';

import { addContacts, addGuardians, addNote, addProject, addTask, getAllNotes, getGuardians, getPets, getProjects, getTasks, getUserContacts, updateNote, updateTask } from '../../services/family'; // Adjust import based on your setup

const { TextArea } = AntInput;

// Define GuardianItem and GuardianSection types for Guardians
interface GuardianItem {
    name: string;
    relationship: string;
    phone: string;
    details?: string;
}

interface GuardianSection {
    title: string;
    type: string;
    items: GuardianItem[];
}

// Define ContactItem and ContactSection types for Guardians
interface ContactItem {
    icon: string;
    name: string;
    role: string;
    phone: string;
    bgColor: string;
    textColor: string;
    details?: string;
}

interface ContactSection {
    title: string;
    type: string;
    items: ContactItem[];
}// page.tsx (Update GuardiansEmergencyInfo)

const GuardiansEmergencyInfo: React.FC = () => {
    const [guardianInfo, setGuardianInfo] = useState<GuardianSection[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'guardian' | 'section-edit' | 'new-section'>('guardian');
    const [currentSectionIndex, setCurrentSectionIndex] = useState<number | null>(null);
    const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
    const [form] = Form.useForm();
    const [sectionItems, setSectionItems] = useState<GuardianItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedSections, setExpandedSections] = useState<{ [key: number]: boolean }>({});

    const guardianRelations = [
        'Grandmother', 'Grandfather', 'Uncle', 'Aunt', 'Family Friend',
        'Sibling', 'Cousin', 'Neighbor', 'Other Family Member', 'Policy ',
        'Family Doctor', 'Insurance ', 'Specialist', 'health', 'provider',
    ];

    const getGuardian = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getGuardians({});
            const { status, payload } = response;
            if (status) {
                const groupedByType: Record<string, GuardianItem[]> = {
                    guardian: [],
                    insurance: [],
                    medical: [],
                };

                payload.emergencyInfo.forEach((info: GuardianItem) => {
                    const relLower = info.relationship.toLowerCase();
                    if (relLower.includes('policy') || relLower.includes('insurance') || relLower.includes('provider')) {
                        groupedByType['insurance'].push(info);
                    } else if (relLower.includes('doctor') || relLower.includes('health') || relLower.includes('pediatrician') || relLower.includes('specialist')) {
                        groupedByType['medical'].push(info);
                    } else {
                        groupedByType['guardian'].push(info);
                    }
                });

                const formattedSections: GuardianSection[] = [
                    { title: 'Emergency Guardians', type: 'guardian', items: groupedByType['guardian'] },
                    { title: 'Life Insurance', type: 'insurance', items: groupedByType['insurance'] },
                    { title: 'Medical Information', type: 'medical', items: groupedByType['medical'] },
                ];

                setGuardianInfo(formattedSections);
            } else {
                setError('Failed to fetch guardian info');
                message.error('Failed to fetch guardian info');
            }
        } catch (err) {
            setError('Error fetching guardian info');
            message.error('Error fetching guardian info');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getGuardian();
    }, []);

    const showModal = (
        type: 'guardian' | 'section-edit' | 'new-section',
        sectionIndex: number | null = null,
        itemIndex: number | null = null
    ) => {
        setModalType(type);
        setCurrentSectionIndex(sectionIndex);
        setCurrentItemIndex(itemIndex);

        if (type === 'section-edit' && sectionIndex !== null) {
            setSectionItems(guardianInfo[sectionIndex].items);
        } else if (type === 'guardian' && sectionIndex !== null && itemIndex !== null) {
            form.setFieldsValue(guardianInfo[sectionIndex].items[itemIndex]);
        } else {
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        try {
            await form.validateFields();
            const values = form.getFieldsValue();

            if (modalType === 'new-section') {
                const newSection: GuardianSection = {
                    title: values.sectionName,
                    type: 'other',
                    items: [],
                };
                setGuardianInfo([...guardianInfo, newSection]);
                message.success('New section created!');
                setIsModalOpen(false);
                form.resetFields();
            } else if (modalType === 'guardian' && currentSectionIndex !== null) {
                setLoading(true);
                const payload = {
                    name: values.name,
                    relationship: values.relation,
                    phone: values.phone,
                    details: values.details || '',
                    addedBy: localStorage.getItem('userId') || 'current_user',
                };

                const response = await addGuardians(payload);
                if (response.status) {
                    const updatedGuardianInfo = [...guardianInfo];
                    const newItem: GuardianItem = {
                        name: values.name,
                        relationship: values.relation,
                        phone: values.phone,
                        details: values.details,
                    };

                    if (currentItemIndex !== null) {
                        updatedGuardianInfo[currentSectionIndex].items[currentItemIndex] = newItem;
                        message.success('Guardian info updated!');
                    } else {
                        updatedGuardianInfo[currentSectionIndex].items.push(newItem);
                        message.success('Guardian info added!');
                    }

                    setGuardianInfo(updatedGuardianInfo);
                    setIsModalOpen(false);
                    form.resetFields();
                } else {
                    message.error('Failed to save guardian info');
                }
            }
        } catch (error) {
            console.error('Error in handleOk:', error);
            message.error('Failed to save guardian info. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleItemDelete = async (sectionIndex: number, itemIndex: number) => {
        const updatedGuardianInfo = [...guardianInfo];
        updatedGuardianInfo[sectionIndex].items.splice(itemIndex, 1);
        setGuardianInfo(updatedGuardianInfo);
        setSectionItems(updatedGuardianInfo[sectionIndex].items);
        message.success('Item deleted successfully!');
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const toggleSectionExpand = (index: number) => {
        setExpandedSections((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const renderFormFields = () => {
        switch (modalType) {
            case 'new-section':
                return (
                    <Form.Item
                        name="sectionName"
                        label="Section Name"
                        rules={[{ required: true, message: 'Please enter section name!' }]}
                    >
                        <Input placeholder="Enter section name (e.g., 'Family Friends')" style={{ width: '100%' }} />
                    </Form.Item>
                );

            case 'guardian':
                return (
                    <>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="name"
                                    label="Full Name"
                                    rules={[{ required: true, message: 'Please input the name!' }]}
                                >
                                    <Input placeholder="Enter full name" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="relation"
                                    label="Relationship/Role"
                                    rules={[{ required: true, message: 'Please select or input the relationship!' }]}
                                >
                                    <Select
                                        placeholder="Select or type relationship"
                                        showSearch
                                        allowClear
                                        options={guardianRelations.map((rel) => ({ label: rel, value: rel }))}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item
                            name="phone"
                            label="Phone Number"
                            rules={[{ required: true, message: 'Please input the phone number!' }]}
                        >
                            <Input placeholder="Enter phone number" />
                        </Form.Item>
                        <Form.Item name="details" label="Additional Details">
                            <Input.TextArea placeholder="Enter additional details" rows={3} />
                        </Form.Item>
                    </>
                );

            case 'section-edit':
                return (
                    <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '16px' }}>
                        {sectionItems.map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    marginBottom: '16px',
                                    padding: '16px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    position: 'relative',
                                }}
                            >
                                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setTimeout(() => {
                                                showModal('guardian', currentSectionIndex, index);
                                            }, 100);
                                        }}
                                        style={{ color: '#3b82f6' }}
                                    />
                                    <Popconfirm
                                        title="Are you sure to delete this item?"
                                        onConfirm={() => handleItemDelete(currentSectionIndex!, index)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button type="text" size="small" icon={<DeleteOutlined />} style={{ color: '#dc2626' }} />
                                    </Popconfirm>
                                </div>
                                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', paddingRight: '80px' }}>
                                    {item.name}
                                </div>
                                <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>
                                    {item.relationship} • {item.phone}
                                </div>
                                {item.details && <div style={{ color: '#9ca3af', fontSize: '11px' }}>{item.details}</div>}
                            </div>
                        ))}
                        <Button
                            type="dashed"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => showModal('guardian', currentSectionIndex, null)}
                            style={{ width: '100%', marginTop: '16px', borderRadius: '6px' }}
                        >
                            Add
                        </Button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Card className="modern-card fade-in" style={{ height: '100%', padding: '24px' }}>
            <div className="modern-card-header">
                <h2 className="modern-card-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <SafetyOutlined style={{ color: '#dc2626' }} />
                    Guardians & Emergency Info
                </h2>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div style={{ color: '#dc2626' }}>{error}</div>
            ) : guardianInfo.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', padding: '20px 0' }}>
                    No guardian info available.
                </div>
            ) : (
                guardianInfo.map((section, sectionIndex) => {
                    const isExpanded = expandedSections[sectionIndex];
                    const itemsToShow = isExpanded ? section.items : section.items.slice(0, 2);
                    const bgColor =
                        section.type === 'guardian' ? '#fef2f2' : section.type === 'insurance' ? '#eff6ff' : '#fefce8';
                    const borderColor =
                        section.type === 'guardian' ? '#fecaca' : section.type === 'insurance' ? '#bfdbfe' : '#fde68a';
                    const headerColor =
                        section.type === 'guardian' ? '#dc2626' : section.type === 'insurance' ? '#2563eb' : '#ca8a04';

                    return (
                        <div key={sectionIndex} style={{ marginBottom: 32 }}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 16,
                                    padding: '12px 16px',
                                    background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor} 100%)`,
                                    borderRadius: '8px',
                                    border: `1px solid ${borderColor}`,
                                }}
                            >
                                <h4
                                    style={{
                                        margin: 0,
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        color: headerColor,
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    {section.title}
                                </h4>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<Plus size={16} />}
                                    onClick={() => showModal('section-edit', sectionIndex, null)}
                                    style={{ color: headerColor }}
                                />
                            </div>

                            <List
                                size="small"
                                dataSource={itemsToShow}
                                renderItem={(item) => (
                                    <List.Item
                                        style={{
                                            padding: '12px 16px',
                                            background: 'white',
                                            borderRadius: '8px',
                                            marginBottom: '8px',
                                            border: '1px solid #f1f5f9',
                                        }}
                                        actions={[
                                            <Button
                                                type="text"
                                                icon={<PhoneOutlined />}
                                                size="small"
                                                style={{ color: '#10b981', borderRadius: '6px' }}
                                            />,
                                        ]}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    style={{
                                                        background:
                                                            section.type === 'insurance'
                                                                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                                                                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {item.name?.charAt(0) || 'G'}
                                                </Avatar>
                                            }
                                            title={
                                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                                    {item.name}
                                                </span>
                                            }
                                            description={
                                                <div style={{ fontSize: '12px' }}>
                                                    <div style={{ color: '#64748b', fontWeight: 500 }}>
                                                        {item.relationship} • {item.phone}
                                                    </div>
                                                    {item.details && (
                                                        <div style={{ color: '#94a3b8', marginTop: 2 }}>{item.details}</div>
                                                    )}
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                            {section.items.length > 2 && (
                                <div style={{ textAlign: 'center', marginTop: '4px' }}>
                                    <Button
                                        type="link"
                                        size="small"
                                        icon={isExpanded ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                        onClick={() => toggleSectionExpand(sectionIndex)}
                                        style={{ color: headerColor, fontWeight: 500 }}
                                    >
                                        {isExpanded ? 'Show Less' : `View All (${section.items.length})`}
                                    </Button>
                                </div>
                            )}
                        </div>
                    );
                })
            )}

            <Modal
                open={isModalOpen}
                onOk={modalType !== 'section-edit' ? handleOk : () => setIsModalOpen(false)}
                onCancel={handleCancel}
                footer={null}
                width={700}
                closable={false}
                style={{ borderRadius: 12, overflow: 'hidden', top: 20 }}
                confirmLoading={loading}
            >
                {/* Modal Header */}
                <div
                    style={{
                        background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                        padding: '18px 24px',
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: 600,
                    }}
                >
                    {modalType === 'new-section'
                        ? 'Add New Guardian Section'
                        : modalType === 'guardian'
                            ? currentItemIndex !== null
                                ? 'Edit Guardian Info'
                                : 'Add New Guardian'
                            : 'Manage Guardian Section'}
                </div>

                {/* Modal Body */}
                <div style={{ backgroundColor: '#fff', padding: '24px' }}>
                    <Form
                        form={form}
                        layout="vertical"
                        style={{
                            marginTop: '0px',
                            paddingBottom: modalType === 'section-edit' ? 0 : 24,
                        }}
                    >
                        {renderFormFields()}
                    </Form>

                    {/* Footer Buttons */}
                    {modalType !== 'section-edit' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                            <Button
                                onClick={handleCancel}
                                style={{ borderRadius: 8, padding: '6px 20px' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleOk}
                                loading={loading}
                                style={{
                                    borderRadius: 8,
                                    padding: '6px 20px',
                                    background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                                    border: 'none',
                                    fontWeight: 500,
                                }}
                            >
                                {currentItemIndex !== null
                                    ? 'Update'
                                    : modalType === 'new-section'
                                        ? 'Create Section'
                                        : 'Add'}
                            </Button>
                        </div>
                    )}

                    {modalType === 'section-edit' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                            <Button
                                type="primary"
                                onClick={() => setIsModalOpen(false)}
                                style={{
                                    borderRadius: 8,
                                    padding: '6px 20px',
                                    background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                                    border: 'none',
                                    fontWeight: 500,
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>

        </Card>
    );
};





// page.tsx (Update ImportantContacts)
// Define ContactItem and ContactSection types
interface ContactItem {
    icon: string;
    name: string;
    role: string;
    phone: string;
    bgColor: string;
    textColor: string;
}

interface ContactSection {
    title: string;
    type: string;
    items: ContactItem[];
}

const ImportantContacts: React.FC = () => {
    const [contacts, setContacts] = useState<ContactSection[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'contact' | 'section-edit' | 'new-section'>('contact');
    const [currentSectionIndex, setCurrentSectionIndex] = useState<number | null>(null);
    const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
    const [form] = Form.useForm();
    const [sectionItems, setSectionItems] = useState<ContactItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const contactRoles: { [key: string]: string[] } = {
        important: ['Emergency Response', 'Hospital', 'Fire Department', 'Police', 'Emergency Care'],
        school: ['Elementary School', 'Middle School', 'High School', 'Principal', 'Teacher'],
        professional: ['Doctor', 'Dentist', 'Lawyer', 'Financial Advisor', 'Therapist', 'Pediatrician'],
        activity: ['Coach', 'Instructor', 'Tutor', 'Activity Leader'],
        other: ['Custom Role'],
    };
    const [showAllSections, setShowAllSections] = useState<{ [key: number]: boolean }>({});
    const getContacts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getUserContacts({});
            const { status, payload } = response;
            if (status) {
                const groupedByType: Record<string, ContactItem[]> = {
                    important: [], // Important Contacts
                    school: [],
                    professional: [],
                    other: [],
                };

                payload.contacts.forEach((section: any) => {
                    section.items.forEach((item: any) => {
                        const roleLower = item.role.toLowerCase();
                        if (contactRoles.important.some(r => roleLower.includes(r.toLowerCase()))) {
                            groupedByType['important'].push({
                                icon: '🚨',
                                name: item.name,
                                role: item.role,
                                phone: item.phone,
                                bgColor: '#fee2e2',
                                textColor: '#dc2626',
                            });
                        } else if (contactRoles.school.some(r => roleLower.includes(r.toLowerCase()))) {
                            groupedByType['school'].push({
                                icon: '🏫',
                                name: item.name,
                                role: item.role,
                                phone: item.phone,
                                bgColor: '#dcfce7',
                                textColor: '#16a34a',
                            });
                        } else if (contactRoles.professional.some(r => roleLower.includes(r.toLowerCase()))) {
                            groupedByType['professional'].push({
                                icon: '👨‍⚕',
                                name: item.name,
                                role: item.role,
                                phone: item.phone,
                                bgColor: '#f0f4f8',
                                textColor: '#374151',
                            });
                        } else {
                            groupedByType['other'].push({
                                icon: '👤',
                                name: item.name,
                                role: item.role,
                                phone: item.phone,
                                bgColor: '#f0f4f8',
                                textColor: '#374151',
                            });
                        }
                    });
                });

                // Define all sections with potential empty arrays
                const formattedSections: ContactSection[] = [
                    { title: 'Important Contacts', type: 'important', items: groupedByType['important'] },
                    { title: 'Schools', type: 'school', items: groupedByType['school'] },
                    { title: 'Professional Services', type: 'professional', items: groupedByType['professional'] },
                    { title: 'Other Contacts', type: 'other', items: groupedByType['other'] },
                ];

                setContacts(formattedSections);
            } else {
                setError('Failed to fetch contacts');
                message.error('Failed to fetch contacts');
            }
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
            setError('Error fetching contacts');
            message.error('Error fetching contacts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getContacts();
    }, []);

    const showModal = (
        type: 'contact' | 'section-edit' | 'new-section',
        sectionIndex: number | null = null,
        itemIndex: number | null = null
    ) => {
        setModalType(type);
        setCurrentSectionIndex(sectionIndex);
        setCurrentItemIndex(itemIndex);

        if (type === 'section-edit' && sectionIndex !== null) {
            setSectionItems(contacts[sectionIndex].items);
        } else if (type === 'contact' && sectionIndex !== null && itemIndex !== null) {
            form.setFieldsValue(contacts[sectionIndex].items[itemIndex]);
        } else {
            form.resetFields();
            if (type === 'contact') {
                form.setFieldsValue({
                    bgColor: '#f0f4f8',
                    textColor: '#374151',
                    icon: '👤',
                });
            }
        }
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        try {
            await form.validateFields();
            const formValues = form.getFieldsValue();

            if (modalType === 'contact' && currentSectionIndex !== null) {
                setLoading(true);
                const addedBy = localStorage.getItem('userId') || 'current_user';
                const payload = {
                    contacts: {
                        name: formValues.name,
                        role: formValues.role,
                        phone: formValues.phone,
                        addedBy,
                    },
                };

                const response = await addContacts(payload);
                if (response.status) {
                    const updatedContacts = [...contacts];
                    const newContact: ContactItem = {
                        icon: formValues.icon,
                        name: formValues.name,
                        role: formValues.role,
                        phone: formValues.phone,
                        bgColor: formValues.bgColor,
                        textColor: formValues.textColor,
                    };

                    if (currentItemIndex !== null) {
                        updatedContacts[currentSectionIndex].items[currentItemIndex] = newContact;
                    } else {
                        updatedContacts[currentSectionIndex].items.push(newContact);
                    }

                    setContacts(updatedContacts);
                    message.success('Contact added successfully!');
                    setIsModalOpen(false);
                    form.resetFields();
                } else {
                    message.error('Failed to save contact');
                }
            } else if (modalType === 'new-section') {
                const newSection: ContactSection = {
                    title: formValues.sectionName,
                    type: 'other',
                    items: [],
                };
                setContacts([...contacts, newSection]);
                message.success('Section created successfully!');
                setIsModalOpen(false);
                form.resetFields();
            }
        } catch (error) {
            console.error('Error in handleOk:', error);
            message.error('Failed to save contact. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleItemDelete = async (sectionIndex: number, itemIndex: number) => {
        const updatedContacts = [...contacts];
        updatedContacts[sectionIndex].items.splice(itemIndex, 1);
        setContacts(updatedContacts);
        setSectionItems(updatedContacts[sectionIndex].items);
        message.success('Item deleted successfully!');
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const renderFormFields = () => {
        switch (modalType) {
            case 'new-section':
                return (
                    <Form.Item
                        name="sectionName"
                        label="Section Name"
                        rules={[{ required: true, message: 'Please enter section name!' }]}
                    >
                        <Input
                            placeholder="Enter section name (e.g., 'Tutors')"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                );

            case 'contact':
                const currentSection = contacts[currentSectionIndex || 0];
                const availableRoles = contactRoles[currentSection?.type] || contactRoles.other;

                return (
                    <>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="icon"
                                    label="Icon"
                                    rules={[{ required: true, message: 'Please input an icon!' }]}
                                >
                                    <Input placeholder="Enter emoji (e.g., 🚨)" style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={16}>
                                <Form.Item
                                    name="name"
                                    label="Name/Organization"
                                    rules={[{ required: true, message: 'Please input the name!' }]}
                                >
                                    <Input placeholder="Enter name or organization" style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="role"
                                    label="Role/Position"
                                    rules={[{ required: true, message: 'Please input the role!' }]}
                                >
                                    <Select
                                        placeholder="Select or type role"
                                        showSearch
                                        allowClear
                                        options={availableRoles.map((role: any) => ({ label: role, value: role }))}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="phone"
                                    label="Phone Number"
                                    rules={[{ required: true, message: 'Please input the phone number!' }]}
                                >
                                    <Input placeholder="Enter phone number" style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </>
                );

            case 'section-edit':
                return (
                    <div
                        style={{
                            maxHeight: '500px',
                            overflowY: 'auto',
                            padding: '16px',
                        }}
                    >
                        {sectionItems.map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    marginBottom: '16px',
                                    padding: '16px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    position: 'relative',
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        display: 'flex',
                                        gap: '8px',
                                    }}
                                >
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setTimeout(() => {
                                                showModal('contact', currentSectionIndex, index);
                                            }, 100);
                                        }}
                                        style={{ color: '#3b82f6' }}
                                    />
                                    <Popconfirm
                                        title="Are you sure to delete this contact?"
                                        onConfirm={() => handleItemDelete(currentSectionIndex!, index)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            style={{ color: '#dc2626' }}
                                        />
                                    </Popconfirm>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        paddingRight: '80px',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            backgroundColor: item.bgColor,
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: item.textColor,
                                            fontSize: '16px',
                                        }}
                                    >
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.name}</div>
                                        <div style={{ color: '#6b7280', fontSize: '12px' }}>
                                            {item.role} • {item.phone}
                                        </div>
                                    </div>
                                </div>


                            </div>
                        ))}
                        <Button
                            type="dashed"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => showModal('contact', currentSectionIndex, null)}
                            style={{ width: '100%', marginTop: '16px', borderRadius: '6px' }}
                        >
                            Add
                        </Button>

                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Card className="modern-card fade-in" style={{ height: '100%', padding: '24px' }}>
            <div className="modern-card-header">
                <h2
                    className="modern-card-title"
                    style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '20px', fontWeight: 700, color: '#111827' }}
                >
                    <PhoneOutlined style={{ color: '#10b981' }} />
                    Important Contacts
                </h2>
            </div>


            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div style={{ color: '#dc2626' }}>{error}</div>
            ) : contacts.length === 0 ? (
                <div
                    style={{
                        textAlign: 'center',
                        color: '#9ca3af',
                        fontSize: '14px',
                        padding: '20px 0',
                    }}
                >
                    No contacts available. Click 'Add' to get started.
                </div>
            ) : (
                contacts.map((section, sectionIndex) => {
                    type SectionType = 'important' | 'school' | 'professional' | 'other';
                    const categoryColors: Record<SectionType, { bg: string; border: string; text: string }> = {
                        important: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
                        school: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
                        professional: { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb' },
                        other: { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b' },
                    };
                    const colors = categoryColors[(section.type as SectionType)] || categoryColors.other;

                    return (
                        <div key={sectionIndex} style={{ marginBottom: '28px' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    background: colors.bg,
                                    borderRadius: '8px',
                                    border: `1px solid ${colors.border}`,
                                    marginBottom: '12px',
                                }}
                            >
                                <h4
                                    style={{
                                        margin: 0,
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        color: colors.text,
                                        letterSpacing: '0.5px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                    }}
                                >
                                    {section.items[0]?.icon || '👤'} {section.title.toUpperCase()}
                                </h4>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<Plus size={16} />}
                                    onClick={() => showModal('section-edit', sectionIndex, null)}
                                    style={{ color: colors.text }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {section.items.length === 0 ? (
                                    <div
                                        style={{
                                            textAlign: 'center',
                                            padding: '32px 0',
                                            color: '#9ca3af',
                                            fontSize: '14px',
                                        }}
                                    >
                                        <div>No data</div>
                                    </div>
                                ) : (
                                    (showAllSections[sectionIndex] ? section.items : section.items.slice(0, 2)).map(
                                        (contact, contactIndex) => (
                                            <div
                                                key={contactIndex}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    border: '1px solid #f3f4f6',
                                                    borderRadius: '12px',
                                                    padding: '12px 16px',
                                                    backgroundColor: '#fff',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        backgroundColor: contact.bgColor || '#e5e7eb',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: contact.textColor || '#1f2937',
                                                        fontWeight: 600,
                                                        fontSize: '16px',
                                                        marginRight: '16px',
                                                        textTransform: 'capitalize',
                                                    }}
                                                >
                                                    {contact.icon}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>
                                                        {contact.name}
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                                                        {contact.role} • {contact.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )
                                )}

                                {section.items.length > 2 && (
                                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={
                                                showAllSections[sectionIndex] ? <EyeInvisibleOutlined /> : <EyeOutlined />
                                            }
                                            onClick={() =>
                                                setShowAllSections((prev) => ({
                                                    ...prev,
                                                    [sectionIndex]: !prev[sectionIndex],
                                                }))
                                            }
                                            style={{ color: '#6b7280', fontWeight: 500 }}
                                        >
                                            {showAllSections[sectionIndex]
                                                ? 'Show Less'
                                                : `View All (${section.items.length})`}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
            <Modal
                open={isModalOpen}
                onOk={modalType !== 'section-edit' ? handleOk : () => setIsModalOpen(false)}
                onCancel={handleCancel}
                footer={null}
                width={700}
                closable={false}
                style={{ top: 20, borderRadius: 12, overflow: 'hidden' }}
                confirmLoading={loading}
            >
                {/* Gradient Header */}
                <div
                    style={{
                        background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                        padding: '18px 24px',
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: 600,
                    }}
                >
                    {modalType === 'new-section'
                        ? 'Add New Contact Section'
                        : modalType === 'contact'
                            ? currentItemIndex !== null
                                ? 'Edit Contact Info'
                                : 'Add New Contact'
                            : 'Manage Contact Section'}
                </div>

                {/* Form Content */}
                <div style={{ backgroundColor: '#fff', padding: '24px' }}>
                    <Form form={form} layout="vertical" style={{ marginTop: 0 }}>
                        {renderFormFields()}
                    </Form>

                    {/* Footer */}
                    {modalType !== 'section-edit' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, gap: 12 }}>
                            <Button onClick={handleCancel} style={{ borderRadius: 8, padding: '6px 20px' }}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleOk}
                                loading={loading}
                                style={{
                                    borderRadius: 8,
                                    padding: '6px 20px',
                                    background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                                    border: 'none',
                                    fontWeight: 500,
                                }}
                            >
                                {currentItemIndex !== null
                                    ? 'Update'
                                    : modalType === 'new-section'
                                        ? 'Create Section'
                                        : 'Add'}
                            </Button>
                        </div>
                    )}

                    {modalType === 'section-edit' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                            <Button
                                type="primary"
                                onClick={() => setIsModalOpen(false)}
                                style={{
                                    borderRadius: 8,
                                    padding: '6px 20px',
                                    background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                                    border: 'none',
                                    fontWeight: 500,
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>

        </Card>
    );


};




import dayjs from 'dayjs';

type Task = {
    id: number;
    title: string;
    assignee: string;
    type: string;
    completed: boolean;
    due: string;
    dueDate?: string;
};

type Project = {
    color?: string;
    project_id: string;
    title: string;
    description: string;
    due_date: string;
    progress: number;
    tasks: Task[];
};

const FamilyTasks: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const projRes = await getProjects({ source: 'familyhub' }); // ✅ pass source
            const rawProjects = projRes.data.payload.projects || [];

            const projectsWithTasks = await Promise.all(
                rawProjects.map(async (proj: any) => {
                    const taskRes = await getTasks({ project_id: proj.project_id });
                    const rawTasks = taskRes.data.payload.tasks || [];

                    const tasks = rawTasks.map((task: any, i: number) => ({
                        id: task.task_id || i + 1,
                        title: task.title,
                        assignee: task.assignee,
                        type: task.type,
                        completed: task.completed,
                        due: task.completed
                            ? 'Completed'
                            : `Due ${dayjs(task.due_date).format('MMM D')}`,
                        dueDate: task.due_date,
                    }));

                    return {
                        project_id: proj.project_id,
                        title: proj.title,
                        description: proj.description,
                        due_date: proj.due_date,
                        color: proj.color || '#667eea',
                        progress: tasks.length
                            ? Math.round(
                                (tasks.filter((t: Task) => t.completed).length / tasks.length) * 100
                            )
                            : 0,
                        tasks,
                    };
                })
            );

            setProjects(projectsWithTasks);
        } catch (err) {
            message.error('Failed to load family hub projects');
        }
    };

    const handleAddProject = async (project: {
        title: string;
        description: string;
        due_date: string;
    }) => {
        try {
            await addProject({
                ...project,
                source: 'familyhub',
            });
            message.success('Project added');
            fetchProjects();
        } catch {
            message.error('Failed to add project');
        }
    };

    const handleAddTask = async (projectId: string) => {
        try {
            await addTask({
                project_id: projectId,
                title: 'New Task',
                assignee: 'All',
                type: 'low',
                due_date: dayjs().format('YYYY-MM-DD'),
                completed: false,
            });
            fetchProjects();
        } catch {
            message.error('Failed to add task');
        }
    };

    const handleToggleTask = async (projectId: string, taskId: number) => {
        const project = projects.find((p) => p.project_id === projectId);
        const task = project?.tasks.find((t) => t.id === taskId);
        if (!task) return;

        try {
            await updateTask({ task_id: taskId, completed: !task.completed });
            fetchProjects();
        } catch {
            message.error('Failed to toggle task');
        }
    };

    const handleUpdateTask = async (task: Task) => {
        try {
            await updateTask({
                task_id: task.id,
                title: task.title,
                due_date: task.dueDate,
                assignee: task.assignee,
                type: task.type,
            });
            message.success('Task updated');
            fetchProjects();
        } catch {
            message.error('Failed to update task');
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <FamilyTasksComponent
                title="Family Projects & Tasks"
                projects={projects}
                onAddProject={handleAddProject}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onUpdateTask={handleUpdateTask}
            />
        </div>
    );
};

import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Card, List, Tag, Divider } from 'antd';
import { getUpcomingActivities } from '../../services/family';

interface Activity {
    id: string;
    title: string;
    date: string;
    time: string;
    user_id: string;
    name: string;
}

const UpcomingActivities: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>([]);

    const fetchActivities = async () => {
        try {
            const res = await getUpcomingActivities('');
            if (res.status === 1) {
                setActivities(res.payload.events);
            } else {
                message.error(res.message);
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to fetch upcoming activities.");
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const getBadgeStyle = (type: string) => {
        const baseStyle = {
            fontSize: '10px',
            padding: '2px 8px',
            borderRadius: '6px',
            fontWeight: 600,
            marginLeft: '8px',
            border: 'none',
        };

        const colors: Record<string, string> = {
            john: '#3355ff',
            sarah: '#6366f1',
            emma: '#ec4899',
            liam: '#f59e0b',
            family: '#10b981',
            pet: '#6b7280'
        };
        const getDynamicColor = (name: string) => {
            const palette = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#22d3ee', '#f43f5e'];
            let hash = 0;
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
            const index = Math.abs(hash % palette.length);
            return palette[index];
        };
        const backgroundColor = colors[type] || getDynamicColor(type);
        return { ...baseStyle, backgroundColor, color: 'white' };
    };

    return (
        <Card className="modern-card fade-in" style={{ padding: '24px', height: '100%' }}>
            <div className="modern-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="modern-card-title" style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalendarOutlined />
                    Upcoming Activities
                </h2>
                <Button
                    type="text"
                    icon={<PlusOutlined />}
                    style={{ borderRadius: '8px', width: '36px', height: '36px' }}
                />
            </div>

            <div style={{ height: 'calc(100% - 80px)', overflowY: 'auto', paddingRight: '4px' }}>
                <List
                    dataSource={activities}
                    renderItem={(activity, index) => {
                        const dateObj = dayjs(activity.date);
                        const day = dateObj.format('DD');
                        const month = dateObj.format('MMM');
                        return (
                            <List.Item
                                key={activity.id}
                                style={{
                                    padding: '16px 0',
                                    borderBottom: index === activities.length - 1 ? 'none' : '1px solid #f1f5f9',
                                    transition: 'all 0.3s ease'
                                }}
                                className="slide-up"
                            >
                                <div style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                <div style={{ fontWeight: 600, fontSize: '15px', color: '#1e293b', lineHeight: 1.4 }}>
                                                    {activity.title}
                                                </div>
                                                <Tag style={getBadgeStyle(activity.name.toLowerCase())}>{activity.name}</Tag>
                                            </div>

                                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <ClockCircleOutlined style={{ fontSize: '12px', color: '#94a3b8' }} />
                                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                                                        {activity.time}
                                                    </span>
                                                </div>
                                            </Space>
                                        </div>

                                        <div style={{ textAlign: 'right', marginLeft: 12 }}>
                                            <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>
                                                {day}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
                                                {month}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </List.Item>
                        );
                    }}
                />
            </div>

            <Divider style={{ margin: '20px 0' }} />
        </Card>
    );
};


// export default UpcomingActivities;

import { ChevronLeft, ChevronRight } from 'lucide-react';
import CalendarWithMeals, { sampleCalendarData } from '../../pages/components/customCalendar';
import CustomCalendar from '../../pages/components/customCalendar';
import FamilyMembers from '../../pages/family-hub/components/familyMember';
import FamilyHubMemberDetails from '../../pages/family-hub/components/profile';
import FamilyTasksComponent from '../components/familyTasksProjects';
import FamilyNotes from './components/familyNotesLists';
// import { PRIMARY_COLOR } from '../../comman';

const FamilyCalendar: React.FC = () => {
    const [activeView, setActiveView] = useState('week');

    const familyColors = {
        john: '#3355ff',
        sarah: '#6366f1',
        emma: '#8b5cf6',
        liam: '#ec4899',
        family: 'linear-gradient(135deg, #3355ff, #ec4899)',
    };

    const weekDays = [
        {
            name: 'SUN',
            date: '8',
            events: [
                { time: '10:00 AM', title: 'Family Brunch', type: 'family' },
                { time: '2:00 PM', title: 'Emma - Soccer Practice', type: 'emma' },
            ],
            meals: ['🍳 Pancakes & Eggs', '🍕 Pizza Night'],
        },
        {
            name: 'MON',
            date: '9',
            events: [
                { time: '9:00 AM', title: 'John - Team Meeting', type: 'john' },
                { time: '3:30 PM', title: 'Liam - Piano Lesson', type: 'liam' },
                { time: '7:00 PM', title: 'Sarah - Book Club', type: 'sarah' },
            ],
            meals: ['🍝 Spaghetti Bolognese'],
        },
        {
            name: 'TUE',
            date: '10',
            events: [
                { time: '2:00 PM', title: 'Liam - Dentist', type: 'liam' },
                { time: '4:00 PM', title: 'Emma - Math Tutoring', type: 'emma' },
            ],
            meals: ['🌮 Taco Tuesday'],
        },
        {
            name: 'WED',
            date: '11',
            events: [
                { time: '6:30 PM', title: 'Family Game Night', type: 'family' },
            ],
            meals: ['🍗 Grilled Chicken', '🥗 Caesar Salad'],
        },
        {
            name: 'THU',
            date: '12',
            events: [
                { time: '10:00 AM', title: 'Sarah - Doctor Appt', type: 'sarah' },
                { time: '7:00 PM', title: 'Emma - School Play', type: 'emma' },
            ],
            meals: ['🍲 Slow Cooker Stew'],
        },
        {
            name: 'FRI',
            date: '13',
            events: [
                { time: '2:00 PM', title: 'John - Presentation', type: 'john' },
                { time: '7:00 PM', title: 'Movie Night', type: 'family' },
            ],
            meals: ['🍕 Pizza Friday'],
        },
        {
            name: 'SAT',
            date: '14',
            events: [
                { time: '9:00 AM', title: 'Farmers Market', type: 'family' },
                { time: '11:00 AM', title: 'Liam - Soccer Game', type: 'liam' },
                { time: '6:00 PM', title: 'BBQ with Neighbors', type: 'family' },
            ],
            meals: ['🍔 BBQ Burgers'],
        },
    ];

    const getEventStyle = (type: string) => {
        const baseStyle = {
            padding: '6px 8px',
            marginBottom: '4px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            borderLeft: '3px solid',
        };

        switch (type) {
            case 'john':
                return { ...baseStyle, backgroundColor: 'rgba(51, 85, 255, 0.1)', borderLeftColor: familyColors.john, color: '#1e40af' };
            case 'sarah':
                return { ...baseStyle, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderLeftColor: familyColors.sarah, color: '#4338ca' };
            case 'emma':
                return { ...baseStyle, backgroundColor: 'rgba(139, 92, 246, 0.1)', borderLeftColor: familyColors.emma, color: '#6d28d9' };
            case 'liam':
                return { ...baseStyle, backgroundColor: 'rgba(236, 72, 153, 0.1)', borderLeftColor: familyColors.liam, color: '#be185d' };
            case 'family':
                return { ...baseStyle, background: 'linear-gradient(135deg, rgba(51, 85, 255, 0.1), rgba(236, 72, 153, 0.1))', borderLeftColor: familyColors.john, color: '#374151' };
            default:
                return baseStyle;
        }
    };

    const handleAddEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const input = e.currentTarget.value;
            if (input.trim()) {
                alert(`Event added: ${input}`);
                e.currentTarget.value = '';
            }
        }
    };

    return (
        <div
            style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                height: '700px',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div
                style={{
                    padding: '20px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>June 2025</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                        style={{
                            display: 'flex',
                            gap: '4px',
                            backgroundColor: '#f0f4f8',
                            padding: '4px',
                            borderRadius: '8px',
                        }}
                    >
                        {['Day', 'Week', 'Month', 'Year'].map((view) => (
                            <button
                                key={view}
                                onClick={() => setActiveView(view.toLowerCase())}
                                style={{
                                    padding: '6px 12px',
                                    border: 'none',
                                    background: activeView === view.toLowerCase() ? 'white' : 'none',
                                    cursor: 'pointer',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: activeView === view.toLowerCase() ? '#374151' : '#6b7280',
                                    transition: 'all 0.2s ease',
                                    boxShadow: activeView === view.toLowerCase() ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                }}
                            >
                                {view}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            style={{
                                width: '32px',
                                height: '32px',
                                border: '1px solid #e5e7eb',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f0f4f8';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                            }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            style={{
                                width: '32px',
                                height: '32px',
                                border: '1px solid #e5e7eb',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f0f4f8';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                            }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ padding: '0 20px' }}>
                <input
                    type="text"
                    placeholder="Add event: 'Soccer practice for Emma tomorrow at 4pm' or 'Family dinner on Sunday @6pm'"
                    onKeyPress={handleAddEvent}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: 'white',
                        marginBottom: '20px',
                        transition: 'border-color 0.2s ease',
                        outline: 'none',
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = '#3355ff';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                    }}
                />
            </div>

            <div
                style={{
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    overflow: 'hidden',
                }}
            >
                {weekDays.map((day, index) => (
                    <div
                        key={index}
                        style={{
                            borderRight: index < 6 ? '1px solid #e5e7eb' : 'none',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <div
                            style={{
                                padding: '12px 8px',
                                borderBottom: '1px solid #e5e7eb',
                                textAlign: 'center',
                                backgroundColor: '#f9fafb',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {day.name}
                            </div>
                            <div
                                style={{
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: '#374151',
                                    marginTop: '4px',
                                }}
                            >
                                {day.date}
                            </div>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
                                {day.events.map((event, eventIndex) => (
                                    <div
                                        key={eventIndex}
                                        style={getEventStyle(event.type)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateX(2px)';
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateX(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                marginBottom: '2px',
                                            }}
                                        >
                                            {event.time}
                                        </div>
                                        <div
                                            style={{
                                                fontWeight: 500,
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {event.title}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div
                                style={{
                                    backgroundColor: '#f0fdf4',
                                    borderTop: '1px solid #bbf7d0',
                                    padding: '8px',
                                    minHeight: '80px',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '10px',
                                        fontWeight: 600,
                                        color: '#047857',
                                        textTransform: 'uppercase',
                                        marginBottom: '4px',
                                    }}
                                >
                                    Meals
                                </div>
                                {day.meals.map((meal, mealIndex) => (
                                    <div
                                        key={mealIndex}
                                        style={{
                                            fontSize: '11px',
                                            color: '#065f46',
                                            cursor: 'pointer',
                                            marginBottom: '2px',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.textDecoration = 'underline';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.textDecoration = 'none';
                                        }}
                                    >
                                        {meal}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div
                style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '12px 20px',
                    backgroundColor: '#f0f4f8',
                    borderTop: '1px solid #e5e7eb',
                }}
            >
                {[
                    { name: 'John', color: familyColors.john },
                    { name: 'Sarah', color: familyColors.sarah },
                    { name: 'Emma', color: familyColors.emma },
                    { name: 'Liam', color: familyColors.liam },
                    { name: 'Family', color: familyColors.john },
                ].map((legend, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            color: '#6b7280',
                        }}
                    >
                        <div
                            style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '3px',
                                backgroundColor: legend.color,
                            }}
                        />
                        <span>{legend.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BoardTitle: React.FC = () => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px',
            }}
        >
            <div
                style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#eef1ff',
                    color: '#3355ff',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                }}
            >
                <Users size={24} />
            </div>
            <h1
                style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#111827',
                    margin: 0,
                }}
            >
                Family Hub
            </h1>
        </div>
    );
};
