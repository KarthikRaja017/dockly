'use client'
import { ArrowLeft, ArrowRightCircle, BoxSelect, Heart, LayoutPanelLeft, Plus, Search, Share, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const FamilyHubPage: React.FC = () => {
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
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 30px',
        }}
      >
        <BoardTitle />
        <FamilyMembers />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '24px',
            marginBottom: '24px',
          }}
        >
          <CustomCalendar data={sampleCalendarData} />
          <UpcomingActivities />
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
    </div>
  );
};

export default FamilyHubPage;

import { Modal, Form, Input, Button, message, Select, Row, Col, Popconfirm, Space } from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  SafetyOutlined,
  PhoneOutlined,
  ExpandOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { addGuardians, getGuardians, getUserContacts, addContacts, addNote, getAllNotes } from '../../../services/family'; // Import addGuardians from family.ts



interface GuardianSection {
  title: string;
  type: 'guardian' | 'insurance' | 'medical' | 'documents' | 'other';
  items: GuardianItem[];
}
interface GuardianItem {
  relationship?: React.ReactNode;
  name: string;
  relation: string;  // Change from 'relationship' to 'relation'
  phone: string;
  details?: string;
}

// page.tsx (Update GuardiansEmergencyInfo)
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

  const guardianRelations = [
    'Grandmother', 'Grandfather', 'Uncle', 'Aunt', 'Family Friend',
    'Sibling', 'Cousin', 'Neighbor', 'Other Family Member', 'Policy Holder',
    'Family Doctor', 'Insurance Provider', 'Specialist',
  ];

  const getGuardian = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getGuardians({});
      const { status, payload } = response;
      if (status) {
        // Group by type for sections
        const groupedByType: Record<string, GuardianItem[]> = {};
        payload.emergencyInfo.forEach((info: GuardianItem) => {
          const relStr = String(info.relationship ?? '');
          const sectionKey = relStr.toLowerCase().includes('policy') ? 'insurance' :
            relStr.toLowerCase().includes('doctor') || relStr.toLowerCase().includes('pediatrician') ? 'medical' :
              'guardian';
          if (!groupedByType[sectionKey]) groupedByType[sectionKey] = [];
          groupedByType[sectionKey].push(info);
        });

        const formattedSections: GuardianSection[] = Object.keys(groupedByType).map(key => ({
          title: key === 'insurance' ? 'Life Insurance' :
            key === 'medical' ? 'Medical Information' :
              'Emergency Guardians',
          type: key as GuardianSection['type'],
          items: groupedByType[key]
        }));

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
          relationship: values.relation, // Use 'relationship' to match backend mapping
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
            relation: ''
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
    // Note: Backend deletion endpoint not provided; assuming local state update for now
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
              placeholder="Enter section name (e.g., 'Family Friends')"
              style={{ width: '100%' }}
            />
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
                  <Input placeholder="Enter full name" style={{ width: '100%' }} />
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
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[{ required: true, message: 'Please input the phone number!' }]}
            >
              <Input placeholder="Enter phone number (e.g., (555) 123-4567)" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="details" label="Additional Details">
              <Input.TextArea
                placeholder="Enter additional details (e.g., address, notes)"
                rows={3}
                style={{ width: '100%' }}
              />
            </Form.Item>
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
                    fontWeight: 600,
                    fontSize: '14px',
                    marginBottom: '4px',
                    paddingRight: '80px',
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    color: '#6b7280',
                    fontSize: '12px',
                    marginBottom: '4px',
                  }}
                >
                  {item.relationship} • {item.phone}
                </div>
                {item.details && (
                  <div style={{ color: '#9ca3af', fontSize: '11px' }}>{item.details}</div>
                )}
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
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        border: '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '2px solid #f3f4f6',
        }}
      >
        <h3
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: 0,
          }}
        >
          <SafetyOutlined style={{ color: '#3b82f6', fontSize: '24px' }} />
          Guardians & Emergency Info
        </h3>
        {/* <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal('new-section', null, null)}
          style={{ borderRadius: '8px' }}
        >
          Add Section
        </Button> */}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: '#dc2626' }}>{error}</div>
      ) : guardianInfo.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', padding: '20px 0' }}>
          No guardian info available. Click "Add Section" to get started.
        </div>
      ) : (
        guardianInfo.map((section, sectionIndex) => (
          <div key={sectionIndex} style={{ marginBottom: '28px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                padding: '8px 0',
              }}
            >
              <h4
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  margin: 0,
                }}
              >
                {section.title}
              </h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowRightCircle size={16} />}
                  onClick={() => showModal('section-edit', sectionIndex, null)}
                  style={{ color: '#3b82f6' }}
                />
                {/* <Button
                  type="dashed"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => showModal('guardian', sectionIndex, null)}
                  style={{ borderRadius: '6px' }}
                >
                  Add
                </Button> */}
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e2e8f0',
              }}
            >
              {section.items.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '14px',
                    padding: '20px 0',
                  }}
                >
                  No items added yet. Click "Add" to get started.
                </div>
              ) : (
                <>
                  {section.items.slice(0, 2).map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: '12px 0',
                        borderBottom:
                          itemIndex < Math.min(section.items.length, 2) - 1 ? '1px solid #e5e7eb' : 'none',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: '#111827',
                            fontSize: '14px',
                            marginBottom: '4px',
                          }}
                        >
                          {item.name}
                        </div>
                        <div
                          style={{
                            color: '#6b7280',
                            fontSize: '13px',
                            marginBottom: '2px',
                          }}
                        >
                          {item.relationship} • {item.phone}
                        </div>
                        {item.details && (
                          <div style={{ color: '#9ca3af', fontSize: '12px' }}>{item.details}</div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {/* <Button */}
                      </div>
                    </div>
                  ))}
                  {section.items.length > 2 && (
                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => showModal('section-edit', sectionIndex, null)}
                        style={{ color: '#6b7280' }}
                      >
                        View All ({section.items.length} items)
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))
      )}

      <Modal
        title={
          modalType === 'new-section'
            ? 'Add New Guardian Section'
            : modalType === 'guardian'
              ? currentItemIndex !== null
                ? 'Edit Guardian Info'
                : 'Add New Guardian'
              : 'Manage Guardian Section'
        }
        open={isModalOpen}
        onOk={modalType !== 'section-edit' ? handleOk : () => setIsModalOpen(false)}
        onCancel={handleCancel}
        okText={
          modalType === 'section-edit'
            ? 'Close'
            : currentItemIndex !== null
              ? 'Update'
              : modalType === 'new-section'
                ? 'Create Section'
                : 'Add'
        }
        cancelText={modalType === 'section-edit' ? null : 'Cancel'}
        width={modalType === 'section-edit' ? 700 : 700}
        style={{ top: 20 }}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
          {renderFormFields()}
        </Form>
      </Modal>
    </div>
  );
};


// import React, { useState } from 'react';
// import { Form, Input, Select, Button, Modal, Row, Col, message } from 'antd';
// import { PhoneOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
// import { ArrowRightCircle } from 'lucide-react';
// import { addContacts } from '../../../services/family'; // Import addContacts from family.ts

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
  type: 'emergency' | 'school' | 'professional' | 'activity' | 'other';
  items: ContactItem[];
}
// page.tsx (Update ImportantContacts)
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

  const contactRoles = {
    emergency: ['Emergency Response', 'Hospital', 'Fire Department', 'Police', 'Emergency Care'],
    school: ['Elementary School', 'Middle School', 'High School', 'Principal', 'Teacher'],
    professional: ['Doctor', 'Dentist', 'Lawyer', 'Financial Advisor', 'Therapist', 'Pediatrician'],
    activity: ['Coach', 'Instructor', 'Tutor', 'Activity Leader'],
    other: ['Custom Role'],
  };

  const getContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserContacts({});
      const { status, payload } = response;
      if (status) {
        // Ensure contacts are correctly formatted
        const formattedContacts: ContactSection[] = payload.contacts.map((section: any) => ({
          title: section.title,
          type: section.type,
          items: section.items.map((item: any) => ({
            icon: item.role.toLowerCase().includes('emergency') ? '🚨' :
              item.role.toLowerCase().includes('school') ? '🏫' :
                item.role.toLowerCase().includes('doctor') || item.role.toLowerCase().includes('dentist') ? '👨‍⚕' :
                  '👤',
            name: item.name,
            role: item.role,
            phone: item.phone,
            bgColor: item.role.toLowerCase().includes('emergency') ? '#fee2e2' :
              item.role.toLowerCase().includes('school') ? '#dcfce7' :
                '#f0f4f8',
            textColor: item.role.toLowerCase().includes('emergency') ? '#dc2626' :
              item.role.toLowerCase().includes('school') ? '#16a34a' :
                '#374151',
          })),
        }));
        setContacts(formattedContacts);
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
    // Note: Backend deletion endpoint not provided; assuming local state update for now
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
                    options={availableRoles.map((role) => ({ label: role, value: role }))}
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
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        border: '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '2px solid #f3f4f6',
        }}
      >
        <h3
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: 0,
          }}
        >
          <PhoneOutlined style={{ color: '#10b981', fontSize: '24px' }} />
          Important Contacts
        </h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal('new-section', null, null)}
          style={{ borderRadius: '8px' }}
        >
          Add Section
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: '#dc2626' }}>{error}</div>
      ) : contacts.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', padding: '20px 0' }}>
          No contacts available. Click "Add Section" to get started.
        </div>
      ) : (
        contacts.map((section, sectionIndex) => (
          <div key={sectionIndex} style={{ marginBottom: '28px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                padding: '8px 0',
              }}
            >
              <h4
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  margin: 0,
                }}
              >
                {section.title}
              </h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowRightCircle size={16} />}
                  onClick={() => showModal('section-edit', sectionIndex, null)}
                  style={{ color: '#3b82f6' }}
                />

              </div>
            </div>

            <div
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e2e8f0',
              }}
            >
              {section.items.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '14px',
                    padding: '20px 0',
                  }}
                >
                  No contacts added yet. Click "Add" to get started.
                </div>
              ) : (
                <>
                  {section.items.slice(0, 2).map((contact, contactIndex) => (
                    <div
                      key={contactIndex}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom:
                          contactIndex < Math.min(section.items.length, 2) - 1 ? '1px solid #e5e7eb' : 'none',
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: contact.bgColor,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '12px',
                          color: contact.textColor,
                          fontSize: '18px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      >
                        {contact.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: '#111827',
                            fontSize: '14px',
                            marginBottom: '2px',
                          }}
                        >
                          {contact.name}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '13px' }}>
                          {contact.role} • {contact.phone}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {/* <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => showModal('contact', sectionIndex, contactIndex)}
                          style={{ color: '#3b82f6' }}
                        />
                        <Popconfirm
                          title="Are you sure to delete this contact?"
                          onConfirm={() => handleItemDelete(sectionIndex, contactIndex)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            style={{ color: '#dc2626' }}
                          />
                        </Popconfirm> */}
                      </div>
                    </div>
                  ))}
                  {section.items.length > 2 && (
                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => showModal('section-edit', sectionIndex, null)}
                        style={{ color: '#6b7280' }}
                      >
                        View All ({section.items.length} items)
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))
      )}

      <Modal
        title={
          modalType === 'new-section'
            ? 'Add New Contact Section'
            : modalType === 'contact'
              ? currentItemIndex !== null
                ? 'Edit Contact Info'
                : 'Add New Contact'
              : 'Manage Contact Section'
        }
        open={isModalOpen}
        onOk={modalType !== 'section-edit' ? handleOk : () => setIsModalOpen(false)}
        onCancel={handleCancel}
        okText={
          modalType === 'section-edit'
            ? 'Close'
            : currentItemIndex !== null
              ? 'Update'
              : modalType === 'new-section'
                ? 'Create Section'
                : 'Add'
        }
        cancelText={modalType === 'section-edit' ? null : 'Cancel'}
        width={modalType === 'section-edit' ? 700 : 700}
        style={{ top: 20 }}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
          {renderFormFields()}
        </Form>
      </Modal>
    </div>
  );
};



import { CheckSquare } from 'lucide-react';

const FamilyTasks: React.FC = () => {
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: 'Weekly Chores',
      meta: ['Recurring', 'Reset Sunday'],
      progress: 60,
      tasks: [
        { id: 1, title: 'Take out trash', assignee: 'JS', type: 'john', completed: true, due: 'Completed' },
        { id: 2, title: 'Grocery shopping', assignee: 'SS', type: 'sarah', completed: true, due: 'Completed' },
        { id: 3, title: 'Clean kitchen', assignee: 'SS', type: 'sarah', completed: false, due: 'Due today' },
        { id: 4, title: 'Vacuum living room', assignee: 'ES', type: 'emma', completed: false, due: 'Due today' },
        { id: 5, title: 'Water plants', assignee: 'LS', type: 'liam', completed: false, due: 'Due Sunday' },
      ],
    },
    {
      id: 2,
      title: 'School Activities',
      meta: ['June 2025'],
      progress: 40,
      tasks: [
        { id: 6, title: 'Science fair project materials', assignee: 'ES', type: 'emma', completed: true, due: 'Completed Jun 10' },
        { id: 7, title: 'Permission slip - field trip', assignee: 'LS', type: 'liam', completed: true, due: 'Completed Jun 12' },
        { id: 8, title: 'Science fair presentation', assignee: 'ES', type: 'emma', completed: false, due: 'Due Jun 23' },
        { id: 9, title: 'Book report - English', assignee: 'LS', type: 'liam', completed: false, due: 'Due Jul 1' },
      ],
    },
    {
      id: 3,
      title: 'Summer Vacation Planning',
      meta: ['Due Jul 15'],
      progress: 25,
      tasks: [
        { id: 10, title: 'Choose destination', assignee: 'All', type: 'all', completed: true, due: 'Completed - Beach Resort' },
        { id: 11, title: 'Set budget', assignee: 'JS', type: 'john', completed: true, due: 'Completed - $3,500' },
        { id: 12, title: 'Book flights', assignee: 'SS', type: 'sarah', completed: false, due: 'Due Jun 20' },
        { id: 13, title: 'Reserve hotel', assignee: 'JS', type: 'john', completed: false, due: 'Due Jun 25' },
        { id: 14, title: 'Plan activities', assignee: 'All', type: 'all', completed: false, due: 'Due Jul 1' },
      ],
    },
  ]);

  const getAssigneeStyle = (type: string) => {
    const baseStyle = {
      fontSize: '12px',
      padding: '2px 8px',
      borderRadius: '12px',
      fontWeight: 500,
    };

    switch (type) {
      case 'john':
        return { ...baseStyle, backgroundColor: 'rgba(51, 85, 255, 0.1)', color: '#3355ff' };
      case 'sarah':
        return { ...baseStyle, backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' };
      case 'emma':
        return { ...baseStyle, backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' };
      case 'liam':
        return { ...baseStyle, backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' };
      case 'all':
        return { ...baseStyle, backgroundColor: '#eef1ff', color: '#3355ff' };
      default:
        return baseStyle;
    }
  };

  const toggleTask = (projectId: number, taskId: number) => {
    setProjects(prevProjects =>
      prevProjects.map(project => {
        if (project.id === projectId) {
          const updatedTasks = project.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                completed: !task.completed,
                due: !task.completed ? 'Completed' : 'Due today'
              };
            }
            return task;
          });

          const completedCount = updatedTasks.filter(task => task.completed).length;
          const progress = Math.round((completedCount / updatedTasks.length) * 100);

          return {
            ...project,
            tasks: updatedTasks,
            progress
          };
        }
        return project;
      })
    );
  };

  const addTask = (projectId: number) => {
    const newTaskId = Math.max(...projects.flatMap(p => p.tasks.map(t => t.id))) + 1;
    setProjects(prevProjects =>
      prevProjects.map(project => {
        if (project.id === projectId) {
          const newTask = {
            id: newTaskId,
            title: 'New task',
            assignee: 'All',
            type: 'all',
            completed: false,
            due: 'Due today'
          };
          return {
            ...project,
            tasks: [...project.tasks, newTask]
          };
        }
        return project;
      })
    );
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
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 600,
            margin: 0,
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckSquare size={20} style={{ opacity: 0.8 }} />
          Family Tasks & Projects
        </h2>
        <button
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
          <Plus size={16} style={{ opacity: 0.7 }} />
          New Project
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {projects.map((project) => (
          <div
            key={project.id}
            style={{
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              padding: '16px',
              minHeight: '350px',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3355ff';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(51, 85, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px',
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '4px',
                    margin: 0,
                  }}
                >
                  {project.title}
                </h3>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  {project.meta.map((item, index) => (
                    <span key={index}>
                      {item}
                      {index < project.meta.length - 1 && ' • '}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: '6px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#10b981',
                    width: `${project.progress}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  fontWeight: 500,
                }}
              >
                {project.tasks.filter(task => task.completed).length}/{project.tasks.length} complete
              </span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              {project.tasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: '8px',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '6px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(project.id, task.id)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                      }}
                    />
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        flex: 1,
                        textDecoration: task.completed ? 'line-through' : 'none',
                        opacity: task.completed ? 0.6 : 1,
                        color: '#374151',
                      }}
                    >
                      {task.title}
                    </div>
                    <div style={getAssigneeStyle(task.type)}>
                      {task.assignee}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#6b7280',
                    }}
                  >
                    {task.due}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => addTask(project.id)}
              style={{
                width: '100%',
                padding: '8px',
                border: '2px dashed #e5e7eb',
                backgroundColor: 'transparent',
                borderRadius: '6px',
                color: '#6b7280',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3355ff';
                e.currentTarget.style.color = '#3355ff';
                e.currentTarget.style.backgroundColor = '#eff6ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              + Add task
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};


type Category = {
  title: string;
  icon: string;
  items: { title: string; description: string }[];
};

const defaultCategories: Category[] = [
  { title: 'Important Notes', icon: '📝', items: [] },
  { title: 'Emergency Contacts', icon: '🚨', items: [] },
  { title: 'House Rules & Routines', icon: '🏠', items: [] },
  { title: 'Shopping Lists', icon: '🛒', items: [] },
  { title: 'Birthday & Gift Ideas', icon: '🎁', items: [] },
  { title: 'Meal Ideas & Recipes', icon: '🍽', items: [] },
];

const categoryIdMap: { [key: string]: number } = {
  'Important Notes': 1,
  'Emergency Contacts': 2,
  'House Rules & Routines': 3,
  'Shopping Lists': 4,
  'Birthday & Gift Ideas': 5,
  'Meal Ideas & Recipes': 6,
};
const categoryIdMapReverse: { [key: number]: string } = Object.entries(categoryIdMap).reduce((acc, [title, id]) => {
  acc[id] = title;
  return acc;
}, {} as { [key: number]: string });

const FamilyNotes: React.FC = () => {
  const [categories, setCategories] = useState(defaultCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
  const [newNote, setNewNote] = useState({ title: '', description: '' });
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [newCategoryModal, setNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    getNotes();
  }, []);

  const getNotes = async () => {
    try {
      const response = await getAllNotes();
      const rawNotes = response.data.payload;

      // Group notes by valid category_id only
      // Define Note type if not already defined
      type Note = {
        title: string;
        description: string;
      };
      const grouped: Record<number, Note[]> = {};

      rawNotes.forEach((note: any) => {
        const catId = note.category_id;
        if (!catId || !categoryIdMapReverse[catId]) return; // Skip if not a valid category
        if (!grouped[catId]) grouped[catId] = [];
        grouped[catId].push({
          title: note.title,
          description: note.description,
        });
      });

      // Merge default categories with fetched notes
      const updatedCategories: Category[] = defaultCategories.map((cat) => {
        const catId = categoryIdMap[cat.title];
        return {
          ...cat,
          items: grouped[catId] || [], // fallback to empty list
        };
      });

      setCategories(updatedCategories);
    } catch (error) {
      console.error("Error fetching notes:", error);
      message.error("Failed to load notes");
    }
  };

  const openModal = (index: number) => {
    setActiveCategoryIndex(index);
    setEditingNoteIndex(null);
    setNewNote({ title: "", description: "" });
    setModalOpen(true);
  };

  const handleAddNote = async () => {
    if (!newNote.title.trim() || !newNote.description.trim() || activeCategoryIndex === null) {
      message.error("Please fill in all fields");
      return;
    }

    const categoryTitle = categories[activeCategoryIndex].title;
    const category_id = categoryIdMap[categoryTitle];
    if (!category_id) {
      message.error("Category ID not found");
      return;
    }

    try {
      const user_id = typeof window !== "undefined" ? localStorage.getItem("userId") || "" : "";
      const response = await addNote({
        title: newNote.title,
        description: newNote.description,
        category_id,
        user_id,
      });

      const data = response.data;
      if (data.status === 1) {
        await getNotes();
        setNewNote({ title: "", description: "" });
        setModalOpen(false);
        message.success("Note added successfully");
      } else {
        message.error(data.message || "Failed to add note");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      message.error("Something went wrong");
    }
  };



  const handleDeleteNote = (idx: number) => {
    const updated = [...categories];
    updated[activeCategoryIndex!].items.splice(idx, 1);
    setCategories(updated);
  };

  const handleEditNote = (note: any, idx: number) => {
    setEditingNoteIndex(idx);
    setNewNote({ ...note });
    setModalOpen(true);
  };

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (categories.some((c) => c.title === name)) {
      message.error('Category already exists');
      return;
    }
    setCategories([...categories, { title: name, icon: '📁', items: [] }]);
    setNewCategoryModal(false);
    setNewCategoryName('');
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Family Notes & Lists</h2>
        <button
          style={{
            padding: '8px 11px',
            backgroundColor: '#eef1ff',
            color: '#3355ff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3355ff';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#eef1ff';
            e.currentTarget.style.color = '#3355ff';
          }}
          onClick={() => setNewCategoryModal(true)}
        >
          <PlusOutlined /> New Category
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {categories.map((category, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <span>{category.icon}</span> {category.title}
              </h3>
              <Space>
                <span style={{ fontSize: '12px', background: '#e5e7eb', padding: '2px 8px', borderRadius: '12px' }}>
                  {category.items.length}
                </span>
                <ExportOutlined
                  style={{ cursor: 'pointer', fontSize: 16, color: '#555' }}
                  onClick={() => openModal(index)}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#3355ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
                />
                {/* <BoxSelect /> */}
              </Space>
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {category.items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#999', fontStyle: 'italic' }}>
                  No notes yet.
                </div>
              ) : (
                category.items.map((note: any, i: any) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 14,
                      padding: '6px 0',
                      borderBottom: i < category.items.length - 1 ? '1px solid #e5e7eb' : 'none',
                    }}
                  >
                    {note.title} - {note.description}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Notes Modal */}
      <Modal
        open={modalOpen}
        title={activeCategoryIndex !== null ? categories[activeCategoryIndex].title : ''}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        {activeCategoryIndex !== null &&
          (categories[activeCategoryIndex].items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#999', fontStyle: 'italic' }}>
              No notes yet. Click "Add Note" to get started.
            </div>
          ) : (
            categories[activeCategoryIndex].items.map((note: any, idx: any) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #eee',
                }}
              >
                <div>{note.title} - {note.description}</div>
                <Space>
                  <Button icon={<EditOutlined />} onClick={() => handleEditNote(note, idx)} size="small" />
                  <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteNote(idx)} size="small" />
                </Space>
              </div>
            ))
          ))}

        <Input
          placeholder="Note Title"
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          style={{ marginTop: 12 }}
        />
        <Input
          placeholder="Note Description"
          value={newNote.description}
          onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
          style={{ marginTop: 8, marginBottom: 12 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNote}>
          {editingNoteIndex !== null ? 'Update Note' : 'Add Note'}
        </Button>
      </Modal>

      {/* New Category Modal */}
      <Modal
        open={newCategoryModal}
        title="Add New Category"
        onCancel={() => setNewCategoryModal(false)}
        onOk={handleAddCategory}
        okText="Add"
      >
        <Input
          placeholder="Category Name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
      </Modal>
    </div>
  );
};

import { Calendar } from 'lucide-react';

const UpcomingActivities: React.FC = () => {
  const activities = [
    {
      day: '23',
      month: 'Jun',
      title: "Emma's Science Fair",
      details: '4:00 PM - 7:00 PM • Springfield High School',
      badge: { text: 'Emma', type: 'emma' },
    },
    {
      day: '25',
      month: 'Jun',
      title: "Liam's Dentist Appointment",
      details: '2:30 PM • Dr. Wilson Pediatric Dentistry',
      badge: { text: 'Liam', type: 'liam' },
    },
    {
      day: '27',
      month: 'Jun',
      title: 'Family Picnic',
      details: '11:00 AM • Riverside Park',
      badge: { text: 'Family', type: 'family' },
    },
    {
      day: '03',
      month: 'Jul',
      title: 'Anniversary Dinner',
      details: '7:00 PM • The Vineyard Restaurant',
      badges: [
        { text: 'John', type: 'john' },
        { text: 'Sarah', type: 'sarah' },
      ],
    },
    {
      day: '15',
      month: 'Jul',
      title: "Max's Vet Checkup",
      details: '10:00 AM • Happy Paws Veterinary',
      badge: { text: 'Pet', type: 'family' },
    },
  ];

  const getBadgeStyle = (type: string) => {
    const baseStyle = {
      fontSize: '12px',
      padding: '2px 8px',
      borderRadius: '12px',
      fontWeight: 500,
      marginLeft: '8px',
    };

    switch (type) {
      case 'john':
        return { ...baseStyle, backgroundColor: 'rgba(51, 85, 255, 0.1)', color: '#3355ff' };
      case 'sarah':
        return { ...baseStyle, backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' };
      case 'emma':
        return { ...baseStyle, backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' };
      case 'liam':
        return { ...baseStyle, backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' };
      case 'family':
        return { ...baseStyle, backgroundColor: '#eef1ff', color: '#3355ff' };
      default:
        return baseStyle;
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        padding: '20px',
        height: '700px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
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
          <Calendar size={20} style={{ opacity: 0.8 }} />
          Upcoming Activities
        </h3>
        <button
          style={{
            width: '28px',
            height: '28px',
            border: 'none',
            backgroundColor: '#eef1ff',
            color: '#3355ff',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3355ff';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#eef1ff';
            e.currentTarget.style.color = '#3355ff';
          }}
        >
          <Plus size={16} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activities.map((activity, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              padding: '12px 0',
              borderBottom: index < activities.length - 1 ? '1px solid #e5e7eb' : 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.marginLeft = '8px';
              e.currentTarget.style.marginRight = '-8px';
              e.currentTarget.style.borderRadius = '8px';
              e.currentTarget.style.paddingLeft = '12px';
              e.currentTarget.style.paddingRight = '12px';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.marginLeft = '0';
              e.currentTarget.style.marginRight = '0';
              e.currentTarget.style.borderRadius = '0';
              e.currentTarget.style.paddingLeft = '0';
              e.currentTarget.style.paddingRight = '0';
            }}
          >
            <div
              style={{
                width: '45px',
                textAlign: 'center',
                marginRight: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#374151',
                }}
              >
                {activity.day}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                }}
              >
                {activity.month}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '2px',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {activity.title}
                {activity.badge && (
                  <span style={getBadgeStyle(activity.badge.type)}>
                    {activity.badge.text}
                  </span>
                )}
                {activity.badges && activity.badges.map((badge, badgeIndex) => (
                  <span key={badgeIndex} style={getBadgeStyle(badge.type)}>
                    {badge.text}
                  </span>
                ))}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                }}
              >
                {activity.details}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import { ChevronLeft, ChevronRight } from 'lucide-react';
import CalendarWithMeals, { sampleCalendarData } from '../../../pages/components/customCalendar';
import CustomCalendar from '../../../pages/components/customCalendar';
import FamilyMembers from '../../../pages/family-hub/components/familyMember';

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
