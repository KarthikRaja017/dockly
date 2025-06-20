// 'use client';
// import React, { useEffect, useState } from 'react';
// import { Row, Col, Card, Button, Typography, Table, message, Spin, Popconfirm } from 'antd';
// import LeftSection from '../../../pages/family-hub/left-section';
// import RightSection from '../../../pages/family-hub/right-section';
// import FamilyInviteForm from '../../../pages/family-hub/FamilyInviteForm';
// import { getUsersFamilyMembers } from '../../../services/family';
// import { useRouter } from 'next/navigation';
// import { FamilyMember as ImportedFamilyMember } from '../../../pages/family-hub/rightsection/sharedtasks';

// interface FamilyMember extends ImportedFamilyMember {
//   uid: string;
// }

// const { Title } = Typography;

// interface CalendarEvent {
//   date: string;
//   event: string;
// }

// interface ActivityLog {
//   time: string;
//   activity: string;
//   details: string;
// }

// const calendarEvents: CalendarEvent[] = [
//   { date: '2025-06-05', event: 'Family Dinner' },
//   { date: '2025-06-07', event: 'Movie Night' },
// ];

// const activities: ActivityLog[] = [
//   { time: '2025-06-05 18:00', activity: 'Meal', details: 'Dinner - Pizza Night' },
//   { time: '2025-06-04 12:00', activity: 'Shared', details: 'Grocery List Updated' },
// ];

// const TableContent = ({ familyMembers, onDelete }: any) => {
//   const columns = [
//     { title: 'Name', dataIndex: 'name', key: 'name' },
//     {
//       title: 'Relationship',
//       dataIndex: 'relationship',
//       key: 'relationship',
//       render: (text: string) => text.replace('❤️', '').replace('👶', '').replace('👴', ''),
//     },
//     { title: 'Email', dataIndex: 'email', key: 'email' },
//     {
//       title: 'Actions',
//       key: 'actions',
//       render: (_: any, record: FamilyMember) => (
//         <Popconfirm title="Delete?" onConfirm={() => onDelete(record.uid)}>
//           <Button type="link" danger>Delete</Button>
//         </Popconfirm>
//       ),
//     },
//   ];
//   return <Table columns={columns} dataSource={familyMembers.map((m: any) => ({ ...m, key: m.uid }))} pagination={false} />;
// };

// const CalendarContent = () => (
//   <ul>{calendarEvents.map((e, i) => (<li key={i}><strong>{e.date}</strong>: {e.event}</li>))}</ul>
// );

// const ActivityContent = () => (
//   <ul>{activities.map((a, i) => (<li key={i}><strong>{a.time}</strong> - {a.activity}: {a.details}</li>))}</ul>
// );

// const BoardContent = ({ setIsModalVisible, setEditMember, familyMembers, onDelete }: any) => (
//   <Row gutter={[16, 16]}>
//     <Col xs={24} md={12}>
//       <LeftSection
//         setIsModalVisible={setIsModalVisible}
//         setEditMember={setEditMember}
//         familyMembers={familyMembers}
//         onDelete={onDelete}
//         userId={typeof window !== 'undefined' ? (localStorage.getItem('userId') || '') : ''}
//       />
//     </Col>
//     <Col xs={24} md={12}>
//       <RightSection familyMembers={familyMembers} />
//     </Col>
//   </Row>
// );

// const FamilySharing: React.FC = () => {
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [editMember, setEditMember] = useState<FamilyMember | null>(null);
//   const [activeTab, setActiveTab] = useState('Board');
//   const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   const getFamilyMembers = async () => {
//     try {
//       const response = await getUsersFamilyMembers();
//       const { status, payload } = response;
//       if (status === 1) {
//         setFamilyMembers(payload.members || []);
//       } else {
//         message.error('Failed to fetch family members');
//       }
//     } catch (error) {
//       console.error('Error fetching family members:', error);
//       message.error('Failed to fetch family members');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getFamilyMembers();
//   }, []);

//   useEffect(() => {
//     const username = localStorage.getItem("username") || "";
//     if (localStorage.getItem('family-hub') === null) {
//       try {
//         router.push(`/${username}/family-hub/setup`);
//       } catch (error) {
//         message.error('Navigation failed. Please try again.');
//       }
//     }
//   }, [router]);

//   const handleSubmit = (formData: any) => {
//     if (!formData.name || !formData.relationship) {
//       message.error('Name and relationship required.');
//       return;
//     }

//     const newMember = {
//       uid: editMember?.uid || `USER_${Date.now()}`,
//       ...formData,
//       sharedItems: formData.shared_items || {},
//     };

//     if (editMember) {
//       setFamilyMembers(familyMembers.map((m) => (m.uid === editMember.uid ? newMember : m)));
//       message.success('Family member updated.');
//     } else {
//       setFamilyMembers([...familyMembers, newMember]);
//       message.success('Family member added.');
//     }

//     setIsModalVisible(false);
//     setEditMember(null);
//   };

//   const handleDelete = (uid: string) => {
//     setFamilyMembers(familyMembers.filter((m) => m.uid !== uid));
//     message.success('Deleted successfully.');
//   };

//   const renderTabContent = () => {
//     if (loading) return <Spin style={{ margin: '30px auto', display: 'block' }} />;
//     switch (activeTab) {
//       case 'Board':
//         return (
//           <BoardContent
//             setIsModalVisible={setIsModalVisible}
//             setEditMember={setEditMember}
//             familyMembers={familyMembers}
//             onDelete={handleDelete}
//           />
//         );
//       case 'Table':
//         return <TableContent familyMembers={familyMembers} onDelete={handleDelete} />;
//       case 'Calendar':
//         return <CalendarContent />;
//       case 'Activity':
//         return <ActivityContent />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div style={{ padding: '20px', maxWidth: '1440px', margin: '50px 45px' }}>
//       <Card>
//         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
//           <h2>👨‍👩‍👧‍👦 Family Hub</h2>
//           <Button type="primary" onClick={() => { setEditMember(null); setIsModalVisible(true); }}>
//             Add Family Member
//           </Button>
//         </div>

//         <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
//           {['Board', 'Table', 'Calendar', 'Activity'].map((tab) => (
//             <Button
//               key={tab}
//               type={activeTab === tab ? 'primary' : 'default'}
//               onClick={() => setActiveTab(tab)}
//               style={{ borderRadius: 20 }}
//             >
//               {tab}
//             </Button>
//           ))}
//         </div>

//         {renderTabContent()}
//       </Card>

//       <FamilyInviteForm
//         visible={isModalVisible}
//         onCancel={() => { setIsModalVisible(false); setEditMember(null); }}
//         isEditMode={!!editMember}
//         initialData={editMember ? {
//           ...editMember,
//           email: editMember.email || '',
//           phone: editMember.phone || '',
//           accessCode: editMember.accessCode || '',
//           // Only allow valid method values
//           method: (editMember.method === "Email" || editMember.method === "Mobile" || editMember.method === "Access Code")
//             ? editMember.method
//             : "Email",
//           // Ensure permissions is of the correct type
//           permissions: (typeof editMember.permissions === 'string')
//             ? {} as any // Replace with a sensible default or conversion if possible
//             : editMember.permissions,
//         } : undefined}
//         onSubmit={handleSubmit}
//       />
//     </div>
//   );
// };

// export default FamilySharing;

'use client'

import { ArrowLeft, Heart, Plus, Search, Share, Users } from 'lucide-react';
import React, { useState } from 'react';

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
        marginLeft: 40
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 30px',
        }}
      >
        <FamilyHeader />
        <BoardTitle />

        {/* Family Members Section - Full Width */}
        <FamilyMembers />

        {/* Calendar and Activities Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '24px',
            marginBottom: '24px',
          }}
        >
          {/* <FamilyCalendar /> */}
          <CalendarWithMeals />
          <UpcomingActivities />
        </div>

        {/* Notes & Lists Section */}
        <FamilyNotes />

        {/* Tasks & Projects Section */}
        <FamilyTasks />

        {/* Bottom Section: Guardians & Contacts */}
        <GuardiansContacts />
      </div>
    </div>
  );
};

export default FamilyHubPage;

import { Shield, Phone, User, Stethoscope, Scale, DollarSign, Activity } from 'lucide-react';

const GuardiansContacts: React.FC = () => {
  const guardianInfo = [
    {
      title: 'Emergency Guardians',
      items: [
        {
          label: 'Primary: Martha Smith',
          value: 'Grandmother • (555) 765-4321 • Lives 10 minutes away',
        },
        {
          label: 'Secondary: Robert & Linda Johnson',
          value: "Sarah's Parents • (555) 234-5678 • Lives in same city",
        },
      ],
    },
    {
      title: 'Life Insurance',
      items: [
        {
          label: 'John Smith - Term Life',
          value: 'Policy #: TL-789456 • $500,000 • Prudential',
        },
        {
          label: 'Sarah Smith - Term Life',
          value: 'Policy #: TL-789457 • $500,000 • Prudential',
        },
      ],
    },
    {
      title: 'Medical Information',
      items: [
        {
          label: 'Family Doctor',
          value: 'Dr. Robert Williams • Family Health Center • (555) 123-4567',
        },
        {
          label: 'Insurance',
          value: 'Blue Cross Blue Shield • Group #: 12345 • ID: JS789456',
        },
        {
          label: 'Allergies',
          value: 'Liam: Peanuts (severe), Dust mites • Emma: None known',
        },
      ],
    },
    {
      title: 'Important Documents',
      items: [
        {
          label: 'Will & Testament',
          value: 'Updated: Jan 2025 • Location: Safe deposit box',
        },
        {
          label: 'Power of Attorney',
          value: 'Martha Smith (Medical) • Robert Johnson (Financial)',
        },
      ],
    },
  ];

  const contacts = [
    {
      title: 'Emergency',
      items: [
        {
          icon: '🚨',
          name: 'Emergency Services',
          role: '911',
          bgColor: '#fee2e2',
          textColor: '#dc2626',
        },
        {
          icon: '🏥',
          name: 'Springfield General Hospital',
          role: '(555) 987-6543',
          bgColor: '#fee2e2',
          textColor: '#dc2626',
        },
      ],
    },
    {
      title: 'Schools',
      items: [
        {
          icon: '🏫',
          name: 'Springfield High School',
          role: 'Emma • (555) 234-5678',
          bgColor: '#dcfce7',
          textColor: '#16a34a',
        },
        {
          icon: '🏫',
          name: 'Cedar Elementary',
          role: 'Liam • (555) 345-6789',
          bgColor: '#dcfce7',
          textColor: '#16a34a',
        },
      ],
    },
    {
      title: 'Professional Services',
      items: [
        {
          icon: '👨‍⚕️',
          name: 'Dr. Emily Chen',
          role: 'Pediatrician • (555) 456-7890',
          bgColor: '#f0f4f8',
          textColor: '#374151',
        },
        {
          icon: '🦷',
          name: 'Dr. Michael Wilson',
          role: 'Family Dentist • (555) 567-8901',
          bgColor: '#f0f4f8',
          textColor: '#374151',
        },
        {
          icon: '👨‍⚖️',
          name: 'James Wilson, Esq.',
          role: 'Estate Attorney • (555) 678-9012',
          bgColor: '#f0f4f8',
          textColor: '#374151',
        },
        {
          icon: '💰',
          name: 'Maria Chen, CFP',
          role: 'Financial Advisor • (555) 789-0123',
          bgColor: '#f0f4f8',
          textColor: '#374151',
        },
      ],
    },
    {
      title: 'Activities & Sports',
      items: [
        {
          icon: '⚽',
          name: 'Coach Thompson',
          role: "Emma's Soccer • (555) 890-1234",
          bgColor: '#f0f4f8',
          textColor: '#374151',
        },
        {
          icon: '🎹',
          name: 'Mrs. Anderson',
          role: "Liam's Piano Teacher • (555) 901-2345",
          bgColor: '#f0f4f8',
          textColor: '#374151',
        },
      ],
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
      }}
    >
      {/* Guardians Section */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          padding: '24px',
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
            <Shield size={20} style={{ opacity: 0.8 }} />
            Guardians & Emergency Info
          </h3>
        </div>

        {guardianInfo.map((section, sectionIndex) => (
          <div key={sectionIndex} style={{ marginBottom: '20px' }}>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              {section.title}
            </h4>
            {section.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                style={{
                  padding: '8px 0',
                  borderBottom: itemIndex < section.items.length - 1 ? '1px solid #e5e7eb' : 'none',
                  fontSize: '13px',
                }}
              >
                <div
                  style={{
                    fontWeight: 500,
                    marginBottom: '2px',
                    color: '#374151',
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    color: '#6b7280',
                    fontSize: '12px',
                    lineHeight: 1.4,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Contacts Section */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          padding: '24px',
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
            <Phone size={20} style={{ opacity: 0.8 }} />
            Important Contacts
          </h3>
        </div>

        {contacts.map((section, sectionIndex) => (
          <div key={sectionIndex} style={{ marginBottom: '20px' }}>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              {section.title}
            </h4>
            {section.items.map((contact, contactIndex) => (
              <div
                key={contactIndex}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 0',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#3355ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#374151';
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: contact.bgColor,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    fontSize: '14px',
                    color: contact.textColor,
                  }}
                >
                  {contact.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 500,
                      color: '#374151',
                    }}
                  >
                    {contact.name}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#6b7280',
                    }}
                  >
                    {contact.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
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

const FamilyNotes: React.FC = () => {
  const categories = [
    {
      title: 'Important Notes',
      icon: '📝',
      count: 5,
      items: [
        "Emma's soccer coach contact: Coach Thompson (555) 890-1234",
        "Liam's allergy medication: Zyrtec - 1 tablet daily",
        "WiFi password: SmithFamily2025!",
        "Security alarm code: See password manager",
        { text: "🔗 Summer camp registration link", isLink: true },
      ],
    },
    {
      title: 'Emergency Contacts',
      icon: '🚨',
      count: 8,
      items: [
        "Emergency: 911",
        "Poison Control: 1-800-222-1222",
        "Grandma Martha: (555) 765-4321",
        "Uncle Robert: (555) 234-5678",
        "Dr. Williams (Family): (555) 123-4567",
        "Happy Paws Vet: (555) 987-6543",
        { text: "🔗 Hospital ER wait times", isLink: true },
        { text: "🔗 After-hours clinic info", isLink: true },
      ],
    },
    {
      title: 'House Rules & Routines',
      icon: '🏠',
      count: 7,
      items: [
        "Screen time: 2hrs weekdays, 3hrs weekends",
        "Bedtimes: Emma 10pm, Liam 9pm",
        "Chores before screen time/games",
        "No phones at dinner table",
        "Dog walking: Morning (John), Evening (Kids rotate)",
        "Cat litter: Emma (Mon/Thu), Liam (Tue/Fri)",
        "Sunday = Family day (no individual plans)",
      ],
    },
    {
      title: 'Shopping Lists',
      icon: '🛒',
      count: 10,
      items: [
        "🥛 Milk, eggs, bread",
        "🧻 Paper towels, toilet paper",
        "🧼 Laundry detergent",
        "🍎 Apples, bananas, berries",
        "🥩 Chicken breast, ground beef",
        "🐕 Dog food (Blue Buffalo)",
        "🐈 Cat litter, cat treats",
        "💊 Liam's allergy meds (refill)",
        { text: "🔗 Costco shopping list", isLink: true },
        { text: "🔗 Amazon Subscribe & Save", isLink: true },
      ],
    },
    {
      title: 'Birthday & Gift Ideas',
      icon: '🎁',
      count: 6,
      items: [
        "🎂 Grandma Martha (May 3) - Gardening supplies",
        "🎂 Emma (Aug 12) - New soccer cleats, art supplies",
        "🎂 Liam (Oct 5) - LEGO set, science kit",
        "🎂 Sarah (Dec 20) - Spa day, jewelry",
        { text: "🔗 Emma's Amazon wishlist", isLink: true },
        { text: "🔗 Liam's toy store wishlist", isLink: true },
      ],
    },
    {
      title: 'Meal Ideas & Recipes',
      icon: '🍽️',
      count: 8,
      items: [
        "Monday: Spaghetti Bolognese",
        "Tuesday: Taco Bar",
        "Wednesday: Grilled Chicken & Veggies",
        "Thursday: Slow Cooker Stew",
        "Friday: Pizza Night",
        { text: "🔗 30-minute family dinners", isLink: true },
        { text: "🔗 Kids' favorite recipes", isLink: true },
        { text: "🔗 Meal prep Sunday ideas", isLink: true },
      ],
    },
  ];

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
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
          }}
        >
          Family Notes & Lists
        </h2>
        <button
          style={{
            padding: '8px 16px',
            backgroundColor: '#eef1ff',
            color: '#3355ff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
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
          New Category
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        {categories.map((category, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              padding: '16px',
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
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: 0,
                }}
              >
                <span>{category.icon}</span>
                <span>{category.title}</span>
              </h3>
              <span
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  backgroundColor: '#e5e7eb',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                {category.count}
              </span>
            </div>

            <div
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {category.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  style={{
                    padding: '8px 0',
                    borderBottom: itemIndex < category.items.length - 1 ? '1px solid #e5e7eb' : 'none',
                    fontSize: '14px',
                    color: typeof item === 'object' && item.isLink ? '#2563eb' : '#374151',
                    lineHeight: 1.4,
                    cursor: typeof item === 'object' && item.isLink ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (typeof item === 'object' && item.isLink) {
                      e.currentTarget.style.textDecoration = 'underline';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (typeof item === 'object' && item.isLink) {
                      e.currentTarget.style.textDecoration = 'none';
                    }
                  }}
                >
                  {typeof item === 'string' ? item : item.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
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
import CalendarWithMeals from '../../../pages/components/customCalendar';

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


const FamilyHeader: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          color: '#374151',
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#3355ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#374151';
        }}
      >
        <ArrowLeft size={16} style={{ marginRight: '6px' }} />
        Back to Dashboard
      </div>

      <div
        style={{
          flex: 1,
          maxWidth: '500px',
          margin: '0 20px',
          position: 'relative',
        }}
      >
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6b7280',
          }}
        />
        <input
          type="text"
          placeholder="Search within this board..."
          style={{
            width: '100%',
            padding: '10px 16px 10px 40px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '14px',
            backgroundColor: 'white',
            outline: 'none',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3355ff';
            e.target.style.boxShadow = '0 0 0 3px rgba(51, 85, 255, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginRight: '16px' }}>
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
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          <Share size={16} style={{ opacity: 0.7 }} />
          Share
        </button>
        <button
          style={{
            padding: '8px 16px',
            backgroundColor: '#3355ff',
            color: 'white',
            border: '1px solid #3355ff',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2a46e0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3355ff';
          }}
        >
          <Plus size={16} style={{ opacity: 0.7 }} />
          Add
        </button>
      </div>

      <div
        style={{
          width: '36px',
          height: '36px',
          backgroundColor: '#3355ff',
          color: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        JS
      </div>
    </div>
  );
};


const FamilyMembers: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const familyMembers = [
    { id: 1, name: 'John Smith', role: 'You', type: 'family', color: '#3355ff', initials: 'JS' },
    { id: 2, name: 'Sarah Smith', role: 'Spouse', type: 'family', color: '#6366f1', initials: 'S' },
    { id: 3, name: 'Emma Smith', role: 'Daughter (14)', type: 'family', color: '#8b5cf6', initials: 'E' },
    { id: 4, name: 'Liam Smith', role: 'Son (10)', type: 'family', color: '#ec4899', initials: 'L' },
    { id: 5, name: 'Max', role: 'Dog - Golden Retriever', type: 'pets', color: '#fbbf24', initials: '🐕' },
    { id: 6, name: 'Luna', role: 'Cat - Tabby', type: 'pets', color: '#fbbf24', initials: '🐈' },
  ];

  const filteredMembers = familyMembers.filter(member => {
    if (activeFilter === 'all') return true;
    return member.type === activeFilter;
  });

  const handleAddMember = (type: string) => {
    alert(`Adding new ${type === 'family' ? 'family member' : 'pet'}`);
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
              onClick={() => setActiveFilter(filter)}
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
        {filteredMembers.map((member) => (
          <div
            key={member.id}
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

      <div style={{ display: 'flex', gap: '12px' }}>
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
          <Plus size={16} style={{ opacity: 0.7 }} />
          Add Family Member
        </button>
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
