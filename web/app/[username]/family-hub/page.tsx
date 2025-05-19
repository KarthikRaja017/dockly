'use client'
import React, { useState } from "react";
import { Card, Row, Col, Button, Typography, List, Input, Select, DatePicker, Divider, Checkbox, Calendar, Badge, Modal, Avatar } from "antd";
import { PlusOutlined, EditOutlined, LeftOutlined, RightOutlined, UserOutlined, FileTextOutlined, ScheduleOutlined, CheckSquareOutlined, PhoneOutlined, FolderOutlined, BulbOutlined, FileAddOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface MainLayoutProps {
  children: React.ReactNode;
}

interface PermissionState {
  type: string;
  allowAdd: boolean;
  allowEdit: boolean;
  allowDelete: boolean;
  allowInvite: boolean;
  notify: boolean;
}

interface FormData {
  email: string;
  phone: string;
  accessCode: string;
  name: string;
}

interface FamilyMember {
  name: string;
  method: string;
  relationship: string;
  permissions: PermissionState;
  sharedItems: { [category: string]: string[] };
}

interface Event {
  title: string;
  color: string;
  date: Dayjs;
}

interface NewEvent {
  title: string;
  category: string;
  date: Dayjs | null;
  timeRange: Dayjs[];
  period: string;
}

interface Task {
  title: string;
  assignee: string;
  completed: boolean;
}

interface Contact {
  name: string;
  role: string;
  phone: string;
}

interface Document {
  title: string;
  category: string;
}

interface Section {
  title: string;
  content: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => (
  <div style={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}>{children}</div>
);

const FamilySharing: React.FC = () => {
  const [step, setStep] = useState<string>("intro");
  const [selectedMethod, setSelectedMethod] = useState<string>("Email");
  const [relationship, setRelationship] = useState<string>("Spouse/Partner");
  const [formData, setFormData] = useState<FormData>({ email: "", phone: "", accessCode: "", name: "" });
  const [permissions, setPermissions] = useState<PermissionState>({
    type: "Custom Access",
    allowAdd: false,
    allowEdit: true,
    allowDelete: false,
    allowInvite: false,
    notify: true,
  });
  const [sharedItems, setSharedItems] = useState<{ [category: string]: string[] }>({});
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [pendingMember, setPendingMember] = useState<FamilyMember | null>(null);
  const [familyGuidelines, setFamilyGuidelines] = useState<string[]>(["Homework First", "Chores Done", "Screen Time", "Bedtime Schedule"]);
  const [newGuideline, setNewGuideline] = useState<string>("");
  const [editGuidelineIndex, setEditGuidelineIndex] = useState<number | null>(null);
  const [familyNotes, setFamilyNotes] = useState<string[]>(["Grocery List", "Vacation Ideas"]);
  const [newNote, setNewNote] = useState<string>("");
  const [editNoteIndex, setEditNoteIndex] = useState<number | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([
    { title: "Sarah’s Birthday - Family - All day - REMEMBER to order cake!", color: "#ff6347", date: dayjs("2025-05-01") },
  ]);
  const [newEvent, setNewEvent] = useState<NewEvent>({ title: "", category: "School", date: null, timeRange: [], period: "AM" });
  const [tasks, setTasks] = useState<Task[]>([
    { title: "Take-out-trash", assignee: "JS", completed: true },
    { title: "Grocery-shopping", assignee: "S", completed: true },
    { title: "Clean-bathroom", assignee: "JS", completed: true },
    { title: "Mow-lawn", assignee: "L", completed: true },
    { title: "Vacuum living room", assignee: "E", completed: false },
    { title: "Clean kitchen", assignee: "S", completed: false }, // Fixed: Changed "false to false (boolean) and added closing quotation mark
    { title: "Do laundry", assignee: "JS", completed: false },
    { title: "Help with science project", assignee: "JS", completed: true },
    { title: "Sign permission slip", assignee: "S", completed: true },
    { title: "Pay school lunch fees", assignee: "S", completed: false },
    { title: "Check homework schedules", assignee: "JS", completed: false },
  ]);
  const [newTask, setNewTask] = useState<string>("");
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>("");
  const [editTaskIndex, setEditTaskIndex] = useState<number | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([
    { name: "Dr. Robert Williams", role: "Family Doctor", phone: "(555) 123-4567" },
    { name: "Dr. Wilson Pediatric Dentistry", role: "Dentist", phone: "(555) 987-6543" },
    { name: "Martha Smith", role: "John's Mother", phone: "(555) 789-1231" },
    { name: "Michael Johnson", role: "Family Friend", phone: "(555) 234-5678" },
    { name: "Springfield High School", role: "Emma's School", phone: "(555) 345-6789" },
    { name: "Cedar Elementary School", role: "Liam's School", phone: "(555) 456-7890" },
  ]);
  const [newContact, setNewContact] = useState<Contact>({ name: "", role: "", phone: "" });
  const [editContactIndex, setEditContactIndex] = useState<number | null>(null);
  const [documents, setDocuments] = useState<Document[]>([
    { title: "Passport - S", category: "Passports" },
    { title: "Passport - Sarah S", category: "Passports" },
    { title: "Passport - Emma S", category: "Passports" },
    { title: "Passport - Liam S", category: "Passports" },
    { title: "Home Insurance Policy", category: "Insurance" },
    { title: "Car Insurance Policy", category: "Insurance" },
  ]);
  const [newDocument, setNewDocument] = useState<Document>({ title: "", category: "" });
  const [editDocumentIndex, setEditDocumentIndex] = useState<number | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [newSection, setNewSection] = useState<Section>({ title: "", content: "" });
  const [editSectionIndex, setEditSectionIndex] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs("2025-05-01"));
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);

  const contentCategories = [
    { label: "Home Management", children: ["Property Information", "Mortgage & Loans", "Home Maintenance", "Utilities", "Insurance", "Important Documents"] },
    { label: "Financial Dashboard", children: [] },
    { label: "Family Hub", children: ["Family Calendar", "Shared Tasks", "Contact Information"] },
    { label: "Health Records", children: ["Insurance Information", "Medical Records", "Emergency Contacts"] },
    { label: "Travel Planning", children: [] },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePermissionChange = (field: keyof PermissionState) => {
    setPermissions(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleParent = (category: string, checked: boolean) => {
    const children = contentCategories.find(c => c.label === category)?.children || [];
    setSharedItems(prev => ({ ...prev, [category]: checked ? children : [] }));
  };

  const toggleChild = (category: string, item: string) => {
    setSharedItems(prev => {
      const current = prev[category] || [];
      const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
      return { ...prev, [category]: updated };
    });
  };

  const isParentChecked = (category: string) => {
    const children = contentCategories.find(c => c.label === category)?.children || [];
    const selected = sharedItems[category] || [];
    return children.length > 0 && children.every(c => selected.includes(c));
  };

  const handleAddMember = () => {
    const newMember: FamilyMember = {
      ...formData,
      method: selectedMethod,
      relationship,
      permissions,
      sharedItems,
    };
    setPendingMember(newMember);
    setStep("sent");
  };

  const handleDone = () => {
    if (pendingMember) {
      setFamilyMembers(prev => [...prev, pendingMember]);
      setPendingMember(null);
    }
    setFormData({ email: "", phone: "", accessCode: "", name: "" });
    setRelationship("Spouse/Partner");
    setPermissions({ type: "Custom Access", allowAdd: false, allowEdit: true, allowDelete: false, allowInvite: false, notify: true });
    setSharedItems({});
    setSelectedMethod("Email");
    setStep("intro");
  };

  const handleAddGuideline = () => {
    if (newGuideline.trim()) {
      setFamilyGuidelines(prev => [...prev, newGuideline.trim()]);
      setNewGuideline("");
      setStep("intro");
    } else {
      alert("Please enter a guideline.");
    }
  };

  const handleEditGuideline = () => {
    if (editGuidelineIndex !== null && newGuideline.trim()) {
      setFamilyGuidelines(prev => {
        const updated = [...prev];
        updated[editGuidelineIndex] = newGuideline.trim();
        return updated;
      });
      setNewGuideline("");
      setEditGuidelineIndex(null);
      setStep("intro");
    } else {
      alert("Please enter a guideline.");
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setFamilyNotes(prev => [...prev, newNote.trim()]);
      setNewNote("");
      setStep("intro");
    } else {
      alert("Please enter a note.");
    }
  };

  const handleEditNote = () => {
    if (editNoteIndex !== null && newNote.trim()) {
      setFamilyNotes(prev => {
        const updated = [...prev];
        updated[editNoteIndex] = newNote.trim();
        return updated;
      });
      setNewNote("");
      setEditNoteIndex(null);
      setStep("intro");
    } else {
      alert("Please enter a note.");
    }
  };

  const handleAddEvent = () => {
    const { title, category, date, timeRange, period } = newEvent;
    if (!title || !category || !date || timeRange.length !== 2) {
      alert("Please fill in all fields.");
      return;
    }

    const color = category === "Health" ? "#ffa500" : "#ff6347";
    const formattedTime = `${timeRange[0].format("h:mm")} ${period} - ${timeRange[1].format("h:mm")} ${period}`;
    const eventTitle = `${title} - ${category} - ${formattedTime}`;

    setUpcomingEvents(prev => [...prev, { title: eventTitle, color, date }]);
    setNewEvent({ title: "", category: "School", date: null, timeRange: [], period: "AM" });
    setStep("intro");
  };

  const handleAddTask = () => {
    if (newTask.trim() && newTaskAssignee.trim()) {
      setTasks(prev => [...prev, { title: newTask.trim(), assignee: newTaskAssignee.trim(), completed: false }]);
      setNewTask("");
      setNewTaskAssignee("");
      setStep("intro");
    } else {
      alert("Please enter a task and assignee.");
    }
  };

  const handleEditTask = () => {
    if (editTaskIndex !== null && newTask.trim() && newTaskAssignee.trim()) {
      setTasks(prev => {
        const updated = [...prev];
        updated[editTaskIndex] = { ...updated[editTaskIndex], title: newTask.trim(), assignee: newTaskAssignee.trim() };
        return updated;
      });
      setNewTask("");
      setNewTaskAssignee("");
      setEditTaskIndex(null);
      setStep("intro");
    } else {
      alert("Please enter a task and assignee.");
    }
  };

  const handleToggleTask = (index: number) => {
    setTasks(prev => {
      const updated = [...prev];
      updated[index].completed = !updated[index].completed;
      return updated;
    });
  };

  const handleAddContact = () => {
    const { name, role, phone } = newContact;
    if (name.trim() && role.trim() && phone.trim()) {
      setContacts(prev => [...prev, { name: name.trim(), role: role.trim(), phone: phone.trim() }]);
      setNewContact({ name: "", role: "", phone: "" });
      setStep("intro");
    } else {
      alert("Please fill in all contact details.");
    }
  };

  const handleEditContact = () => {
    if (editContactIndex !== null && newContact.name.trim() && newContact.role.trim() && newContact.phone.trim()) {
      setContacts(prev => {
        const updated = [...prev];
        if (editContactIndex !== null) {
          updated[editContactIndex] = { ...updated[editContactIndex], ...newContact };
        }
        return updated;
      });
      setNewContact({ name: "", role: "", phone: "" });
      setEditContactIndex(null);
      setStep("intro");
    } else {
      alert("Please fill in all contact details.");
    }
  };

  const handleAddDocument = () => {
    const { title, category } = newDocument;
    if (title.trim() && category.trim()) {
      setDocuments(prev => [...prev, { title: title.trim(), category: category.trim() }]);
      setNewDocument({ title: "", category: "" });
      setStep("intro");
    } else {
      alert("Please fill in all document details.");
    }
  };

  const handleEditDocument = () => {
    if (editDocumentIndex !== null && newDocument.title.trim() && newDocument.category.trim()) {
      setDocuments(prev => {
        const updated = [...prev];
        updated[editDocumentIndex] = { ...updated[editDocumentIndex], ...newDocument };
        return updated;
      });
      setNewDocument({ title: "", category: "" });
      setEditDocumentIndex(null);
      setStep("intro");
    } else {
      alert("Please fill in all document details.");
    }
  };

  const handleAddSection = () => {
    const { title, content } = newSection;
    if (title.trim() && content.trim()) {
      setSections(prev => [...prev, { title: title.trim(), content: content.trim() }]);
      setNewSection({ title: "", content: "" });
      setStep("intro");
    } else {
      alert("Please fill in all section details.");
    }
  };

  const handleEditSection = () => {
    if (editSectionIndex !== null && newSection.title.trim() && newSection.content.trim()) {
      setSections(prev => {
        const updated = [...prev];
        updated[editSectionIndex] = { ...updated[editSectionIndex], ...newSection };
        return updated;
      });
      setNewSection({ title: "", content: "" });
      setEditSectionIndex(null);
      setStep("intro");
    } else {
      alert("Please fill in all section details.");
    }
  };

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf("day");
  };

  const dateCellRender = (value: Dayjs) => {
    const events = upcomingEvents.filter(event => event.date.isSame(value, 'day'));
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {events.map((event, index) => (
          <li key={index}>
            <Badge color={event.color} text={
              <span style={{ fontSize: "10px", color: event.color, cursor: "pointer" }}>
                {event.title.split(" - ")[0].length > 10 ? `${event.title.split(" - ")[0].substring(0, 10)}...` : event.title.split(" - ")[0]}
              </span>
            } />
          </li>
        ))}
      </ul>
    );
  };

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, "month"));
  };

  const handleDateSelect = (value: Dayjs) => {
    const events = upcomingEvents.filter(event => event.date.isSame(value, 'day'));
    setSelectedDateEvents(events);
    setIsModalVisible(true);
  };

  const renderIntro = () => {
    const currentDateTime = "01:43 PM IST on Saturday, May 17, 2025"; // Updated to match the new date and time

    const renderDefaultRightSections = () => (
      <>
        <Card style={{ borderRadius: "10px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
            <FolderOutlined style={{ fontSize: "20px", color: "#722ed1", marginRight: "10px" }} />
            <Title level={4} style={{ color: "#722ed1", margin: 0 }}>Important Documents</Title>
          </div>
          <List
            dataSource={documents}
            renderItem={(doc, index) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setNewDocument(doc);
                      setEditDocumentIndex(index);
                      setStep("editDocument");
                    }}
                    style={{ padding: "0", color: "#1890ff" }}
                  >
                    Edit
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={<Text style={{ fontSize: "14px" }}>{doc.title}</Text>}
                  description={<Text style={{ fontSize: "12px", color: "#666" }}>{doc.category}</Text>}
                />
              </List.Item>
            )}
          />
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={() => setStep("addDocument")}
            style={{ marginTop: "10px", padding: "0", color: "#1890ff" }}
          >
            Add Document
          </Button>
        </Card>

        <Card style={{ borderRadius: "10px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
            <FileTextOutlined style={{ fontSize: "20px", color: "#1890ff", marginRight: "10px" }} />
            <Title level={4} style={{ color: "#1890ff", margin: 0 }}>Family Guidelines</Title>
          </div>
          <List
            dataSource={familyGuidelines}
            renderItem={(item, index) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setNewGuideline(item);
                      setEditGuidelineIndex(index);
                      setStep("editGuideline");
                    }}
                    style={{ padding: "0", color: "#1890ff" }}
                  >
                    Edit
                  </Button>,
                ]}
              >
                <Text style={{ fontSize: "14px" }}>{item}</Text>
              </List.Item>
            )}
          />
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={() => setStep("addGuideline")}
            style={{ marginTop: "10px", padding: "0", color: "#1890ff" }}
          >
            Add Guideline
          </Button>
        </Card>

        <Card style={{ borderRadius: "10px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
            <BulbOutlined style={{ fontSize: "20px", color: "#fadb14", marginRight: "10px" }} />
            <Title level={4} style={{ color: "#fadb14", margin: 0 }}>Family Notes</Title>
          </div>
          <List
            dataSource={familyNotes}
            renderItem={(item, index) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setNewNote(item);
                      setEditNoteIndex(index);
                      setStep("editNote");
                    }}
                    style={{ padding: "0", color: "#1890ff" }}
                  >
                    Edit
                  </Button>,
                ]}
              >
                <Text style={{ fontSize: "14px" }}>{item}</Text>
              </List.Item>
            )}
          />
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={() => setStep("addNote")}
            style={{ marginTop: "10px", padding: "0", color: "#1890ff" }}
          >
            Add Note
          </Button>
        </Card>

        <Card style={{ borderRadius: "10px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
            <FileAddOutlined style={{ fontSize: "20px", color: "#13c2c2", marginRight: "10px" }} />
            <Title level={4} style={{ color: "#13c2c2", margin: 0 }}>Add Section</Title>
          </div>
          {sections.length === 0 ? (
            <Text style={{ fontSize: "14px", color: "#666" }}>No sections added yet.</Text>
          ) : (
            <List
              dataSource={sections}
              renderItem={(section, index) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setNewSection(section);
                        setEditSectionIndex(index);
                        setStep("editSection");
                      }}
                      style={{ padding: "0", color: "#1890ff" }}
                    >
                      Edit
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={<Text style={{ fontSize: "14px" }}>{section.title}</Text>}
                    description={<Text style={{ fontSize: "12px", color: "#666" }}>{section.content}</Text>}
                  />
                </List.Item>
              )}
            />
          )}
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={() => setStep("addSection")}
            style={{ marginTop: "10px", padding: "0", color: "#1890ff" }}
          >
            Add Section
          </Button>
        </Card>
      </>
    );

    const renderAddMemberSteps = () => {
      if (step === "add") return renderAddForm();
      if (step === "permissions") return renderPermissions();
      if (step === "share") return renderSharingOptions();
      if (step === "review") return renderReview();
      if (step === "sent") return renderSent();
      return null;
    };

    return (
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <Title level={3} style={{ margin: 0, color: "#000" }}>Family Hub</Title>
          <Button type="primary" onClick={() => setStep("add")} style={{ borderRadius: "20px", padding: "5px 15px" }}>
            Add Family Member
          </Button>
        </div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <Button type="primary" style={{ borderRadius: "20px", padding: "5px 15px" }}>Table</Button>
          <Button style={{ borderRadius: "20px", padding: "5px 15px" }}>Calendar</Button>
          <Button style={{ borderRadius: "20px", padding: "5px 15px" }}>Activity</Button>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Card style={{ borderRadius: "10px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                <UserOutlined style={{ fontSize: "20px", color: "#ff6347", marginRight: "10px" }} />
                <Title level={4} style={{ color: "#ff6347", margin: 0 }}>Family Members</Title>
              </div>
              {familyMembers.length === 0 ? (
                <Text style={{ fontSize: "14px", color: "#666" }}>No family members added yet.</Text>
              ) : (
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                  {familyMembers.map((member, index) => (
                    <div key={index} style={{ textAlign: "center", width: "100px" }}>
                      <Avatar
                        size={64}
                        style={{
                          backgroundColor: index % 2 === 0 ? "#1890ff" : "#ff4d4f",
                          marginBottom: "10px",
                        }}
                        icon={<UserOutlined />}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Text style={{ fontWeight: "normal", fontSize: "14px" }}>{member.name}</Text>
                      <br />
                      <Text style={{ fontSize: "12px", color: "#666" }}>
                        {member.relationship.replace("❤️", "").replace("👶", "").replace("👴", "")}
                      </Text>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card style={{ borderRadius: "10px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                <ScheduleOutlined style={{ fontSize: "20px", color: "#ffa500", marginRight: "10px" }} />
                <Title level={4} style={{ color: "#ffa500", margin: 0 }}>Family Calendar</Title>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <Button icon={<LeftOutlined />} onClick={handlePrevMonth} style={{ border: "none" }} />
                <Text strong>{currentMonth.format("MMMM YYYY")}</Text>
                <Button icon={<RightOutlined />} onClick={handleNextMonth} style={{ border: "none" }} />
              </div>
              <Text style={{ display: "block", marginBottom: "10px", color: "#666" }}>
                Current Date & Time: {currentDateTime}
              </Text>
              <Calendar
                fullscreen={false}
                value={currentMonth}
                dateCellRender={dateCellRender}
                onSelect={handleDateSelect}
                style={{ padding: "10px" }}
              />
              <Text strong style={{ display: "block", margin: "10px 0", color: "#ffa500" }}>Upcoming Events</Text>
              <List
                itemLayout="horizontal"
                dataSource={upcomingEvents.filter(event => event.date.isSame(currentMonth, 'month'))}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<div style={{ width: "8px", height: "8px", backgroundColor: item.color, borderRadius: "50%" }} />}
                      title={<Text style={{ fontSize: "14px", color: item.color }}>
                        {item.date.format("D")} {item.title}
                      </Text>}
                    />
                  </List.Item>
                )}
              />
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => setStep("addEvent")}
                style={{ marginTop: "10px", padding: "0", color: "#1890ff" }}
              >
                Add Event
              </Button>
            </Card>

            <Card style={{ borderRadius: "10px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                <CheckSquareOutlined style={{ fontSize: "20px", color: "#52c41a", marginRight: "10px" }} />
                <Title level={4} style={{ color: "#52c41a", margin: 0 }}>Shared Tasks</Title>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Text strong style={{ color: "#52c41a" }}>Weekly Chores</Text>
                {tasks.slice(0, 7).map((task, index) => (
                  <div
                    key={index}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Checkbox
                        checked={task.completed}
                        onChange={() => handleToggleTask(index)}
                        style={{ marginRight: "10px" }}
                      />
                      <Text style={{ fontWeight: "normal", fontSize: "14px" }}>{task.title}</Text>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Text style={{ marginRight: "10px", fontSize: "14px" }}>{task.assignee}</Text>
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setNewTask(task.title);
                          setNewTaskAssignee(task.assignee);
                          setEditTaskIndex(index);
                          setStep("editTask");
                        }}
                        style={{ padding: "0", color: "#1890ff" }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
                <Text strong style={{ marginTop: "10px", color: "#52c41a" }}>School Responsibilities</Text>
                {tasks.slice(7).map((task, index) => (
                  <div
                    key={index + 7}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Checkbox
                        checked={task.completed}
                        onChange={() => handleToggleTask(index + 7)}
                        style={{ marginRight: "10px" }}
                      />
                      <Text style={{ fontWeight: "normal", fontSize: "14px" }}>{task.title}</Text>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Text style={{ marginRight: "10px", fontSize: "14px" }}>{task.assignee}</Text>
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setNewTask(task.title);
                          setNewTaskAssignee(task.assignee);
                          setEditTaskIndex(index + 7);
                          setStep("editTask");
                        }}
                        style={{ padding: "0", color: "#1890ff" }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => setStep("addTask")}
                style={{ marginTop: "10px", padding: "0", color: "#1890ff" }}
              >
                Add Task
              </Button>
            </Card>

            <Card style={{ borderRadius: "10px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                <PhoneOutlined style={{ fontSize: "20px", color: "#ff4d4f", marginRight: "10px" }} />
                <Title level={4} style={{ color: "#ff4d4f", margin: "0" }}>Emergency Contacts</Title>
              </div>
              <List
                dataSource={contacts}
                renderItem={(contact, index) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setNewContact(contact);
                          setEditContactIndex(index);
                          setStep("editContact");
                        }}
                        style={{ padding: "0", color: "#1890ff" }}
                      >
                        Edit
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={<Text style={{ fontSize: "14px" }}>{contact.name}</Text>}
                      description={<Text style={{ fontSize: "12px", color: "#666" }}>{contact.role} - {contact.phone}</Text>}
                    />
                  </List.Item>
                )}
              />
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => setStep("addContact")}
                style={{ marginTop: "10px", padding: "0", color: "#1890ff" }}
              >
                Add Contact
              </Button>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            {["add", "permissions", "share", "review", "sent"].includes(step) ? (
              <Card style={{ borderRadius: "10px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
                {renderAddMemberSteps()}
              </Card>
            ) : (
              renderDefaultRightSections()
            )}
          </Col>
        </Row>

        <Modal
          title="Events"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsModalVisible(false)}>
              Close
            </Button>,
          ]}
        >
          {selectedDateEvents.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={selectedDateEvents}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<div style={{ width: "8px", height: "8px", backgroundColor: item.color, borderRadius: "50%" }} />}
                    title={<Text style={{ fontSize: "14px", color: item.color }}>{item.title}</Text>}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Text>No events on this date.</Text>
          )}
        </Modal>
      </div>
    );
  };

  const renderAddForm = () => {
    const handleContinue = () => {
      const { email, phone, accessCode, name } = formData;
      if (!relationship) return alert("Please select a relationship.");
      if (selectedMethod === "Email" && (!email || !name)) return alert("Please enter a valid email and name.");
      if (selectedMethod === "Mobile" && (!phone || !name)) return alert("Please enter a valid phone number and name.");
      if (selectedMethod === "Access Code" && (!accessCode || !name)) return alert("Please enter a valid access code and name.");
      setStep("permissions");
    };

    const isFormValid = () => {
      const { email, phone, accessCode, name } = formData;
      if (!name || !relationship) return false;
      if (selectedMethod === "Email" && !email) return false;
      if (selectedMethod === "Mobile" && !phone) return false;
      if (selectedMethod === "Access Code" && !accessCode) return false;
      return true;
    };

    return (
      <div style={{ padding: "20px" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{
            width: "60px",
            height: "60px",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            borderRadius: "50%",
            margin: "0 auto 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ fontSize: "30px" }}>👨‍👩‍👧</span>
          </div>
          <h2 style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>Add a Family Member</h2>
          <p style={{ color: "#666", fontSize: "14px", margin: "10px 0" }}>
            Safely share important information with your family members while maintaining privacy for your sensitive data.
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
          {["Email", "Mobile", "Access Code"].map(method => (
            <Button
              key={method}
              type={selectedMethod === method ? "primary" : "default"}
              onClick={() => setSelectedMethod(method)}
              style={{
                borderRadius: "20px",
                padding: "5px 15px",
                fontSize: "14px",
                height: "auto",
                backgroundColor: selectedMethod === method ? "#1890ff" : "#fff",
                color: selectedMethod === method ? "#fff" : "#000",
                border: selectedMethod === method ? "none" : "1px solid #d9d9d9",
              }}
            >
              {method}
            </Button>
          ))}
        </div>
        {selectedMethod === "Email" && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ margin: "0 0 5px", fontSize: "12px", color: "#666" }}>Frame 682816</p>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address"
              style={{
                borderRadius: "5px",
                padding: "10px",
                fontSize: "14px",
                border: "1px solid #d9d9d9",
              }}
            />
          </div>
        )}
        {selectedMethod === "Mobile" && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ margin: "0 0 5px", fontSize: "12px", color: "#666" }}>Frame 682816</p>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone Number"
              style={{
                borderRadius: "5px",
                padding: "10px",
                fontSize: "14px",
                border: "1px solid #d9d9d9",
              }}
            />
          </div>
        )}
        {selectedMethod === "Access Code" && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ margin: "0 0 5px", fontSize: "12px", color: "#666" }}>Frame 682816</p>
            <Input
              type="text"
              name="accessCode"
              value={formData.accessCode}
              onChange={handleInputChange}
              placeholder="Access Code"
              style={{
                borderRadius: "5px",
                padding: "10px",
                fontSize: "14px",
                border: "1px solid #d9d9d9",
              }}
            />
          </div>
        )}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ margin: "0 0 5px", fontSize: "12px", color: "rgb(102, 102, 102)" }}>Frame 682817</p>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Display Name"
            style={{
              borderRadius: "5px",
              padding: "10px",
              fontSize: "14px",
              border: "1px solid #d9d9d9",
            }}
          />
        </div>
        <p style={{ margin: "0 0 10px", fontSize: "14px", color: "#666" }}>Relationship</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "30px" }}>
          {["❤️Spouse/Partner", "👶Child", "👴Parent", "Other"].map(rel => (
            <Button
              key={rel}
              type={relationship === rel ? "primary" : "default"}
              onClick={() => setRelationship(rel)}
              style={{
                borderRadius: "20px",
                padding: "5px 15px",
                fontSize: "14px",
                height: "auto",
                backgroundColor: relationship === rel ? "#1890ff" : "#fff",
                color: relationship === rel ? "#fff" : "#000",
                border: relationship === rel ? "none" : "1px solid #d9d9d9",
              }}
            >
              {rel}
            </Button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            onClick={() => setStep("intro")}
            style={{
              borderRadius: "20px",
              padding: "5px 20px",
              fontSize: "14px",
              height: "auto",
              border: "1px solid #d9d9d9",
              backgroundColor: "#fff",
              color: "#000",
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            disabled={!isFormValid()}
            onClick={handleContinue}
            style={{
              borderRadius: "20px",
              padding: "5px 20px",
              fontSize: "14px",
              height: "auto",
              backgroundColor: isFormValid() ? "#1890ff" : "#d9d9d9",
              border: "none",
            }}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  };

  const renderAddGuidelineForm = () => (
    <div style={{ padding: "20px" }}>
      <h2>Add a Family Guideline</h2>
      <Input
        type="text"
        value={newGuideline}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGuideline(e.target.value)}
        placeholder="Enter a guideline"
        style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
        <Button onClick={() => setStep("intro")} style={{ borderRadius: "20px", padding: "5px 20px" }}>Cancel</Button>
        <Button type="primary" disabled={!newGuideline.trim()} onClick={handleAddGuideline} style={{ borderRadius: "20px", padding: "5px 20px" }}>
          Add Guideline
        </Button>
      </div>
    </div>
  );

  const renderEditGuidelineForm = () => (
    <div style={{ padding: "20px" }}>
      <h2>Edit Family Guideline</h2>
      <Input
        type="text"
        value={newGuideline}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGuideline(e.target.value)}
        placeholder="Enter a guideline"
        style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
        <Button onClick={() => setStep("intro")} style={{ borderRadius: "20px", padding: "5px 20px" }}>Cancel</Button>
        <Button type="primary" disabled={!newGuideline.trim()} onClick={handleEditGuideline} style={{ borderRadius: "20px", padding: "5px 20px" }}>
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderAddNoteForm = () => (
    <div style={{ padding: "20px" }}>
      <h2>Add a Family Note</h2>
      <Input
        type="text"
        value={newNote}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewNote(e.target.value)}
        placeholder="Enter your note"
        style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
        <Button onClick={() => setStep("intro")} style={{ borderRadius: "20px", padding: "5px 20px" }}>Cancel</Button>
        <Button type="primary" disabled={!newNote.trim()} onClick={handleAddNote} style={{ borderRadius: "20px", padding: "5px 20px" }}>
          Add Note
        </Button>
      </div>
    </div>
  );

  const renderEditNoteForm = () => (
    <div style={{ padding: "20px" }}>
      <h2>Edit Family Note</h2>
      <Input
        type="text"
        value={newNote}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewNote(e.target.value)}
        placeholder="Enter your note"
        style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
        <Button onClick={() => setStep("intro")} style={{ borderRadius: "20px", padding: "5px 20px" }}>Cancel</Button>
        <Button type="primary" disabled={!newNote.trim()} onClick={handleEditNote} style={{ borderRadius: "20px", padding: "5px 20px" }}>
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderAddEventForm = () => {
    const isEventFormValid = () => {
      const { title, category, date, timeRange, period } = newEvent;
      return title && category && date && timeRange.length === 2 && period;
    };

    return (
      <div style={{ padding: "20px" }}>
        <h2>Add an Event</h2>
        <Input
          type="text"
          value={newEvent.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, title: e.target.value })}
          placeholder="Enter event title"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <Select
          value={newEvent.category}
          onChange={(value: string) => setNewEvent({ ...newEvent, category: value })}
          style={{ margin: "10px 0", width: "100%", borderRadius: "5px" }}
        >
          <Option value="School">School</Option>
          <Option value="Health">Health</Option>
          <Option value="Family">Family</Option>
        </Select>
        <DatePicker
          value={newEvent.date}
          onChange={(date: Dayjs | null) => setNewEvent({ ...newEvent, date })}
          style={{ margin: "10px 0", width: "100%", borderRadius: "5px" }}
          disabledDate={disabledDate}
        />
        <RangePicker
          value={newEvent.timeRange as any}
          onChange={(dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => {
            setNewEvent({ ...newEvent, timeRange: dates ? (dates as Dayjs[]) : [] });
          }}
          format="h:mm A"
          use12Hours
          style={{ margin: "10px 0", width: "100%", borderRadius: "5px" }}
        />
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          {["AM", "PM"].map(period => (
            <Button
              key={period}
              type={newEvent.period === period ? "primary" : "default"}
              onClick={() => setNewEvent({ ...newEvent, period })}
              style={{ borderRadius: "20px", padding: "5px 15px" }}
            >
              {period}
            </Button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
          <Button onClick={() => setStep("intro")} style={{ borderRadius: "20px", padding: "5px 20px" }}>Cancel</Button>
          <Button type="primary" disabled={!isEventFormValid()} onClick={handleAddEvent} style={{ borderRadius: "20px", padding: "5px 20px" }}>
            Add Event
          </Button>
        </div>
    </div>
    );
  };

  const renderAddTaskForm = () => {
    const isTaskFormValid = () => newTask.trim() && newTaskAssignee.trim();

    return (
      <div style={{ padding: "20px" }}>
        <h2>Add a Task</h2>
        <Input
          type="text"
          value={newTask}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value)}
          placeholder="Enter task title"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <Input
          type="text"
          value={newTaskAssignee}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTaskAssignee(e.target.value)}
          placeholder="Enter assignee (e.g., JS)"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
          <Button onClick={() => setStep("intro")} style={{ borderRadius: "20px", padding: "5px 20px" }}>Cancel</Button>
          <Button type="primary" disabled={!isTaskFormValid()} onClick={handleAddTask} style={{ borderRadius: "20px", padding: "5px 20px" }}>
            Add Task
          </Button>
        </div>
      </div>
    );
  };

  const renderEditTaskForm = () => {
    const isTaskFormValid = () => newTask.trim() && newTaskAssignee.trim();

    return (
      <div style={{ padding: "20px" }}>
        <h2>Edit Task</h2>
        <Input
          type="text"
          value={newTask}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value)}
          placeholder="Enter task title"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <Input
          type="text"
          value={newTaskAssignee}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTaskAssignee(e.target.value)}
          placeholder="Enter assignee (e.g., JS)"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
          <Button onClick={() => setStep("intro")} style={{ borderRadius: "20px", padding: "5px 20px" }}>Cancel</Button>
          <Button type="primary" disabled={!isTaskFormValid()} onClick={handleEditTask} style={{ borderRadius: "20px", padding: "5px 20px" }}>
            Save Changes
          </Button>
        </div>
      </div>
    );
  };

  const renderAddContactForm = () => {
    const isContactFormValid = () => newContact.name.trim() && newContact.role.trim() && newContact.phone.trim();

    return (
      <div style={{ padding: "20px" }}>
        <h2>Add an Emergency Contact</h2>
        <Input
          type="text"
          value={newContact.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact({ ...newContact, name: e.target.value })}
          placeholder="Enter name"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <Input
          type="text"
          value={newContact.role}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact({ ...newContact, role: e.target.value })}
          placeholder="Enter role"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <Input
          type="text"
          value={newContact.phone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact({ ...newContact, phone: e.target.value })}
          placeholder="Enter phone number"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
          <Button onClick={() => setStep("intro")} style={{ borderRadius: "20px", padding: "5px 20px" }}>Cancel</Button>
          <Button type="primary" disabled={!isContactFormValid()} onClick={handleAddContact} style={{ borderRadius: "20px", padding: "5px 20px" }}>
            Add Contact
          </Button>
        </div>
      </div>
    );
  };

  const renderEditContactForm = () => {
    const isContactFormValid = () => newContact.name.trim() && newContact.role.trim() && newContact.phone.trim();

    return (
      <div style={{ padding: "20px" }}>
        <h2>Edit Emergency Contact</h2>
        <Input
          type="text"
          value={newContact.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact({ ...newContact, name: e.target.value })}
          placeholder="Enter name"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <Input
          type="text"
          value={newContact.role}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact({ ...newContact, role: e.target.value })}
          placeholder="Enter role"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <Input
          type="text"
          value={newContact.phone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact({ ...newContact, phone: e.target.value })}
          placeholder="Enter phone number"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
          <Button onClick={() => setStep("intro")} style={{ borderRadius: "20px", padding: "5px 20px" }}>Cancel</Button>
          <Button type="primary" disabled={!isContactFormValid()} onClick={handleEditContact} style={{ borderRadius: "20px", padding: "5px 20px" }}>
            Save Changes
          </Button>
        </div>
      </div>
    );
  };

  const renderAddDocumentForm = () => {
    const isDocumentFormValid = () => newDocument.title.trim() && newDocument.category.trim();

    return (
      <div style={{ padding: "20px" }}>
        <h2>Add a Document</h2>
        <Input
          type="text"
          value={newDocument.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDocument({ ...newDocument, title: e.target.value })}
          placeholder="Enter document title"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <Input
          type="text"
          value={newDocument.category}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDocument({ ...newDocument, category: e.target.value })}
          placeholder="Enter category (e.g., Passports, Insurance)"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
          <Button onClick={() => setStep("intro")} style={{ borderRadius: "20px", padding: "5px 20px" }}>Cancel</Button>
          <Button type="primary" disabled={!isDocumentFormValid()} onClick={handleAddDocument} style={{ borderRadius: "20px", padding: "5px 20px" }}>
            Add Document
          </Button>
        </div>
      </div>
    );
  };

  const renderEditDocumentForm = () => {
    const isDocumentFormValid = () => newDocument.title.trim() && newDocument.category.trim();

    return (
      <div style={{ padding: "20px" }}>
        <h2>Edit Document</h2>
        <Input
          type="text"
          value={newDocument.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDocument({ ...newDocument, title: e.target.value })}
          placeholder="Enter document title"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <Input
          type="text"
          value={newDocument.category}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDocument({ ...newDocument, category: e.target.value })}
          placeholder="Enter category (e.g., Passports, Insurance)"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
          <Button onClick={() => setStep("intro")} style={{ borderRadius: "20px", padding: "5px 20px" }}>Cancel</Button>
          <Button type="primary" disabled={!isDocumentFormValid()} onClick={handleEditDocument} style={{ borderRadius: "20px", padding: "5px 20px" }}>
            Save Changes
          </Button>
        </div>
      </div>
    );
  };

  const renderAddSectionForm = () => {
    const isSectionFormValid = () => newSection.title.trim() && newSection.content.trim();

    return (
      <div style={{ padding: "20px" }}>
        <h2>Add a Section</h2>
        <Input
          type="text"
          value={newSection.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSection({ ...newSection, title: e.target.value })}
          placeholder="Enter section title"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <Input
          type="text"
          value={newSection.content}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSection({ ...newSection, content: e.target.value })}
          placeholder="Enter section content"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
          <Button onClick={() => setStep("intro")} style={{ borderRadius: "20px", padding: "5px 20px" }}>Cancel</Button>
          <Button type="primary" disabled={!isSectionFormValid()} onClick={handleAddSection} style={{ borderRadius: "20px", padding: "5px 20px" }}>
            Add Section
          </Button>
        </div>
      </div>
    );
  };

  const renderEditSectionForm = () => {
    const isSectionFormValid = () => newSection.title.trim() && newSection.content.trim();

    return (
      <div style={{ padding: "20px" }}>
        <h2>Edit Section</h2>
        <Input
          type="text"
          value={newSection.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSection({ ...newSection, title: e.target.value })}
          placeholder="Enter section title"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <Input
          type="text"
          value={newSection.content}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSection({ ...newSection, content: e.target.value })}
          placeholder="Enter section content"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
          <Button onClick={() => setStep("intro")} style={{ borderRadius: "20px", padding: "5px 20px" }}>Cancel</Button>
          <Button type="primary" disabled={!isSectionFormValid()} onClick={handleEditSection} style={{ borderRadius: "20px", padding: "5px 20px" }}>
            Save Changes
          </Button>
        </div>
      </div>
    );
  };

  const renderPermissions = () => (
    <div style={{ padding: "20px" }}>
      <h3>Set Permissions for: {formData.name}</h3>
      <div style={{ display: "flex", gap: "10px" }}>
        {["Full Access", "Custom Access"].map(type => (
          <Button
            key={type}
            type={permissions.type === type ? "primary" : "default"}
            onClick={() => setPermissions({ ...permissions, type })}
            style={{ borderRadius: "20px", padding: "5px 15px" }}
          >
            {type}
          </Button>
        ))}
      </div>
      {permissions.type === "Custom Access" && (
        <div style={{ marginTop: "20px" }}>
          {["allowAdd", "allowEdit", "allowDelete", "allowInvite", "notify"].map((key) => (
            <div key={key} style={{ marginBottom: "8px" }}>
              <Checkbox
                checked={Boolean(permissions[key as keyof PermissionState])}
                onChange={() => handlePermissionChange(key as keyof PermissionState)}
              >
                {key.replace("allow", "Allow ").replace(/([A-Z])/g, " $1")}
              </Checkbox>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
        <Button onClick={() => setStep("add")} style={{ borderRadius: "20px", padding: "5px 20px" }}>Back</Button>
        <Button type="primary" onClick={() => setStep("share")} style={{ borderRadius: "20px", padding: "5px 20px" }}>Continue</Button>
      </div>
    </div>
  );

  const renderSharingOptions = () => {
    const hasSelectedItems = Object.values(sharedItems).some(items => items.length > 0);
    return (
      <div style={{ padding: "20px" }}>
        <h3>Select What to Share</h3>
        {contentCategories.map(({ label, children }) => (
          <div key={label} style={{ marginBottom: "20px" }}>
            <Checkbox
              checked={isParentChecked(label)}
              onChange={(e) => toggleParent(label, e.target.checked)}
            >
              <strong>{label}</strong>
            </Checkbox>
            {children.length > 0 && (
              <div style={{ marginLeft: "20px" }}>
                {children.map(child => (
                  <div key={child}>
                    <Checkbox
                      checked={sharedItems[label]?.includes(child) || false}
                      onChange={() => toggleChild(label, child)}
                    >
                      {child}
                    </Checkbox>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {!hasSelectedItems && <p style={{ color: "red" }}>Please select at least one item to share before continuing.</p>}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
          <Button onClick={() => setStep("permissions")} style={{ borderRadius: "20px", padding: "5px 20px" }}>Back</Button>
          <Button type="primary" disabled={!hasSelectedItems} onClick={() => setStep("review")} style={{ borderRadius: "20px", padding: "5px 20px" }}>
            Continue
          </Button>
        </div>
    </div>
    );
  };

  const renderReview = () => (
    <div style={{ padding: "20px" }}>
      <h3>Review Invitation</h3>
      <p><strong>To:</strong> {selectedMethod === "Email" ? formData.email : formData.phone}</p>
      <p><strong>Name:</strong> {formData.name}</p>
      <p><strong>Relationship:</strong> {relationship}</p>
      <p><strong>Access:</strong> {permissions.type}</p>
      <ul>
        {Object.entries(sharedItems).flatMap(([category, items]) =>
          items.map(item => <li key={category + item}>{item}</li>)
        )}
      </ul>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
        <Button onClick={() => setStep("share")} style={{ borderRadius: "20px", padding: "5px 20px" }}>Back</Button>
        <Button type="primary" onClick={handleAddMember} style={{ borderRadius: "20px", padding: "5px 20px" }}>
          Send Invitation
        </Button>
      </div>
    </div>
  );

  const renderSent = () => (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h3>Invitation Sent!</h3>
      <p>An invitation has been sent to {pendingMember?.name || "the family member"}.</p>
      <Button type="primary" onClick={handleDone} style={{ marginTop: "20px", borderRadius: "20px", padding: "5px 20px" }}>
        Done
      </Button>
    </div>
  );

  const isFullPageStep = !["intro", "add", "permissions", "share", "review", "sent"].includes(step);

  return (
    <MainLayout>
      <div style={{ padding: "30px" }}>
        {isFullPageStep ? (
          <>
            {step === "addGuideline" && renderAddGuidelineForm()}
            {step === "editGuideline" && renderEditGuidelineForm()}
            {step === "addNote" && renderAddNoteForm()}
            {step === "editNote" && renderEditNoteForm()}
            {step === "addEvent" && renderAddEventForm()}
            {step === "addTask" && renderAddTaskForm()}
            {step === "editTask" && renderEditTaskForm()}
            {step === "addContact" && renderAddContactForm()}
            {step === "editContact" && renderEditContactForm()}
            {step === "addDocument" && renderAddDocumentForm()}
            {step === "editDocument" && renderEditDocumentForm()}
            {step === "addSection" && renderAddSectionForm()}
            {step === "editSection" && renderEditSectionForm()}
          </>
        ) : (
          renderIntro()
        )}
      </div>
    </MainLayout>
  );
};

export default FamilySharing;