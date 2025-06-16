'use client';
import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Typography, Table, message, Spin, Popconfirm } from 'antd';
import LeftSection from '../../../pages/family-hub/left-section';
import RightSection from '../../../pages/family-hub/right-section';
import FamilyInviteForm from '../../../pages/family-hub/FamilyInviteForm';
import { getUsersFamilyMembers } from '../../../services/family';
import { useRouter } from 'next/navigation';
import { FamilyMember as ImportedFamilyMember } from '../../../pages/family-hub/rightsection/sharedtasks';

interface FamilyMember extends ImportedFamilyMember {
  uid: string;
}

const { Title } = Typography;

interface CalendarEvent {
  date: string;
  event: string;
}

interface ActivityLog {
  time: string;
  activity: string;
  details: string;
}

const calendarEvents: CalendarEvent[] = [
  { date: '2025-06-05', event: 'Family Dinner' },
  { date: '2025-06-07', event: 'Movie Night' },
];

const activities: ActivityLog[] = [
  { time: '2025-06-05 18:00', activity: 'Meal', details: 'Dinner - Pizza Night' },
  { time: '2025-06-04 12:00', activity: 'Shared', details: 'Grocery List Updated' },
];

const TableContent = ({ familyMembers, onDelete }: any) => {
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Relationship',
      dataIndex: 'relationship',
      key: 'relationship',
      render: (text: string) => text.replace('❤️', '').replace('👶', '').replace('👴', ''),
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: FamilyMember) => (
        <Popconfirm title="Delete?" onConfirm={() => onDelete(record.uid)}>
          <Button type="link" danger>Delete</Button>
        </Popconfirm>
      ),
    },
  ];
  return <Table columns={columns} dataSource={familyMembers.map((m: any) => ({ ...m, key: m.uid }))} pagination={false} />;
};

const CalendarContent = () => (
  <ul>{calendarEvents.map((e, i) => (<li key={i}><strong>{e.date}</strong>: {e.event}</li>))}</ul>
);

const ActivityContent = () => (
  <ul>{activities.map((a, i) => (<li key={i}><strong>{a.time}</strong> - {a.activity}: {a.details}</li>))}</ul>
);

const BoardContent = ({ setIsModalVisible, setEditMember, familyMembers, onDelete }: any) => (
  <Row gutter={[16, 16]}>
    <Col xs={24} md={12}>
      <LeftSection
        setIsModalVisible={setIsModalVisible}
        setEditMember={setEditMember}
        familyMembers={familyMembers}
        onDelete={onDelete}
        userId={typeof window !== 'undefined' ? (localStorage.getItem('userId') || '') : ''}
      />
    </Col>
    <Col xs={24} md={12}>
      <RightSection familyMembers={familyMembers} />
    </Col>
  </Row>
);

const FamilySharing: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editMember, setEditMember] = useState<FamilyMember | null>(null);
  const [activeTab, setActiveTab] = useState('Board');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getFamilyMembers = async () => {
    try {
      const response = await getUsersFamilyMembers();
      const { status, payload } = response;
      if (status === 1) {
        setFamilyMembers(payload.members || []);
      } else {
        message.error('Failed to fetch family members');
      }
    } catch (error) {
      console.error('Error fetching family members:', error);
      message.error('Failed to fetch family members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFamilyMembers();
  }, []);

  useEffect(() => {
    const username = localStorage.getItem("username") || "";
    if (localStorage.getItem('family-hub') === null) {
      try {
        router.push(`/${username}/family-hub/setup`);
      } catch (error) {
        message.error('Navigation failed. Please try again.');
      }
    }
  }, [router]);

  const handleSubmit = (formData: any) => {
    if (!formData.name || !formData.relationship) {
      message.error('Name and relationship required.');
      return;
    }

    const newMember = {
      uid: editMember?.uid || `USER_${Date.now()}`,
      ...formData,
      sharedItems: formData.shared_items || {},
    };

    if (editMember) {
      setFamilyMembers(familyMembers.map((m) => (m.uid === editMember.uid ? newMember : m)));
      message.success('Family member updated.');
    } else {
      setFamilyMembers([...familyMembers, newMember]);
      message.success('Family member added.');
    }

    setIsModalVisible(false);
    setEditMember(null);
  };

  const handleDelete = (uid: string) => {
    setFamilyMembers(familyMembers.filter((m) => m.uid !== uid));
    message.success('Deleted successfully.');
  };

  const renderTabContent = () => {
    if (loading) return <Spin style={{ margin: '30px auto', display: 'block' }} />;
    switch (activeTab) {
      case 'Board':
        return (
          <BoardContent
            setIsModalVisible={setIsModalVisible}
            setEditMember={setEditMember}
            familyMembers={familyMembers}
            onDelete={handleDelete}
          />
        );
      case 'Table':
        return <TableContent familyMembers={familyMembers} onDelete={handleDelete} />;
      case 'Calendar':
        return <CalendarContent />;
      case 'Activity':
        return <ActivityContent />;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1440px', margin: '50px 45px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2>👨‍👩‍👧‍👦 Family Hub</h2>
          <Button type="primary" onClick={() => { setEditMember(null); setIsModalVisible(true); }}>
            Add Family Member
          </Button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['Board', 'Table', 'Calendar', 'Activity'].map((tab) => (
            <Button
              key={tab}
              type={activeTab === tab ? 'primary' : 'default'}
              onClick={() => setActiveTab(tab)}
              style={{ borderRadius: 20 }}
            >
              {tab}
            </Button>
          ))}
        </div>

        {renderTabContent()}
      </Card>

      <FamilyInviteForm
        visible={isModalVisible}
        onCancel={() => { setIsModalVisible(false); setEditMember(null); }}
        isEditMode={!!editMember}
        initialData={editMember ? {
          ...editMember,
          email: editMember.email || '',
          phone: editMember.phone || '',
          accessCode: editMember.accessCode || '',
          // Only allow valid method values
          method: (editMember.method === "Email" || editMember.method === "Mobile" || editMember.method === "Access Code")
            ? editMember.method
            : "Email",
          // Ensure permissions is of the correct type
          permissions: (typeof editMember.permissions === 'string')
            ? {} as any // Replace with a sensible default or conversion if possible
            : editMember.permissions,
        } : undefined}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default FamilySharing;