
'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Avatar, Input, Checkbox, List, Modal, Upload, Select, Switch, Calendar, Typography, message } from 'antd';
import { UserOutlined, FolderOutlined, FileTextOutlined, BulbOutlined, FileAddOutlined, ScheduleOutlined, CheckSquareOutlined, PhoneOutlined, PlusOutlined, EditOutlined, LeftOutlined, RightOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface FamilyMember {
  name: string;
  relationship: string;
  email?: string;
  phone?: string;
  accessCode?: string;
  method: string;
  permissions: PermissionState;
  sharedItems: { [category: string]: string[] };
}

interface PermissionState {
  type: string;
  allowAdd: boolean;
  allowEdit: boolean;
  allowDelete: boolean;
  allowInvite: boolean;
  notify: boolean;
}

interface Document {
  id: string;
  title: string;
  category: string;
  file: UploadFile | null;
  fileUrl?: string;
  uploadedBy: string;
  uploadTime: Dayjs;
  addedBy: string;
  addedTime: Dayjs;
  editedBy?: string;
  editedTime?: Dayjs;
}

interface Guideline {
  text: string;
  addedBy: string;
  addedTime: Dayjs;
  editedBy?: string;
  editedTime?: Dayjs;
}

interface Note {
  text: string;
  addedBy: string;
  addedTime: Dayjs;
  editedBy?: string;
  editedTime?: Dayjs;
}

interface Section {
  title: string;
  content: string;
  addedBy: string;
  addedTime: Dayjs;
  editedBy?: string;
  editedTime?: Dayjs;
}

interface Event {
  date: Dayjs;
  title: string;
  color: string;
  addedBy: string;
  addedTime: Dayjs;
  editedBy?: string;
  editedTime?: Dayjs;
}

interface Task {
  title: string;
  assignee: string;
  completed: boolean;
  addedBy: string;
  addedTime: Dayjs;
  editedBy?: string;
  editedTime?: Dayjs;
}

interface Contact {
  name: string;
  role: string;
  phone: string;
  addedBy: string;
  addedTime: Dayjs;
  editedBy?: string;
  editedTime?: Dayjs;
}

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
    {children}
  </div>
);

const FamilySharing: React.FC = () => {
  const [step, setStep] = useState<string>("intro");
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { name: "Alice", relationship: "Spouse/Partner", method: "Email", email: "alice@example.com", permissions: { type: "Full Access", allowAdd: true, allowEdit: true, allowDelete: true, allowInvite: true, notify: true }, sharedItems: {} },
    { name: "Bob", relationship: "Child", method: "Email", email: "bob@example.com", permissions: { type: "Custom Access", allowAdd: false, allowEdit: true, allowDelete: false, allowInvite: false, notify: true }, sharedItems: {} },
  ]);
  const [pendingMember, setPendingMember] = useState<FamilyMember | null>(null);
  const [formData, setFormData] = useState<FamilyMember>({
    name: "",
    relationship: "Spouse/Partner",
    method: "Email",
    permissions: { type: "Custom Access", allowAdd: false, allowEdit: true, allowDelete: false, allowInvite: false, notify: true },
    sharedItems: {},
  });
  const [selectedMethod, setSelectedMethod] = useState<string>("Email");

  // State for selecting the current user from family members
  const [selectedUser, setSelectedUser] = useState<string>(familyMembers.length > 0 ? familyMembers[0].name : "");

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      title: "Family Insurance Policy",
      category: "Insurance",
      file: null,
      fileUrl: "https://example.com/family_insurance_policy.pdf",
      uploadedBy: familyMembers.length > 0 ? familyMembers[0].name : "Unknown",
      uploadTime: dayjs(),
      addedBy: familyMembers.length > 0 ? familyMembers[0].name : "Unknown",
      addedTime: dayjs(),
    },
  ]);
  const [newDocument, setNewDocument] = useState<Document>({
    id: "",
    title: "",
    category: "",
    file: null,
    uploadedBy: selectedUser,
    uploadTime: dayjs(),
    addedBy: selectedUser,
    addedTime: dayjs(),
  });
  const [editDocumentIndex, setEditDocumentIndex] = useState<number | null>(null);

  const [familyGuidelines, setFamilyGuidelines] = useState<Guideline[]>([
    { text: "No screen time after 9 PM", addedBy: familyMembers.length > 0 ? familyMembers[0].name : "Unknown", addedTime: dayjs() },
  ]);
  const [newGuideline, setNewGuideline] = useState<string>("");
  const [newGuidelineAddedBy, setNewGuidelineAddedBy] = useState<string>(selectedUser);
  const [editGuidelineIndex, setEditGuidelineIndex] = useState<number | null>(null);

  const [familyNotes, setFamilyNotes] = useState<Note[]>([
    { text: "Buy groceries on Saturday", addedBy: familyMembers.length > 0 ? familyMembers[0].name : "Unknown", addedTime: dayjs() },
  ]);
  const [newNote, setNewNote] = useState<string>("");
  const [newNoteAddedBy, setNewNoteAddedBy] = useState<string>(selectedUser);
  const [editNoteIndex, setEditNoteIndex] = useState<number | null>(null);

  const [sections, setSections] = useState<Section[]>([]);
  const [newSection, setNewSection] = useState<Section>({ title: "", content: "", addedBy: selectedUser, addedTime: dayjs() });
  const [editSectionIndex, setEditSectionIndex] = useState<number | null>(null);

  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([
    { date: dayjs("2025-05-25"), title: "Family Picnic", color: "#1890ff", addedBy: familyMembers.length > 0 ? familyMembers[0].name : "Unknown", addedTime: dayjs() },
    { date: dayjs("2025-05-30"), title: "Doctor Appointment", color: "#ff4d4f", addedBy: familyMembers.length > 0 ? familyMembers[0].name : "Unknown", addedTime: dayjs() },
  ]);
  const [newEvent, setNewEvent] = useState<Event>({ date: dayjs(), title: "", color: "#1890ff", addedBy: selectedUser, addedTime: dayjs() });
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);

  const [tasks, setTasks] = useState<Task[]>([
    { title: "Take out trash", assignee: "John", completed: false, addedBy: familyMembers.length > 0 ? familyMembers[0].name : "Unknown", addedTime: dayjs() },
    { title: "Clean kitchen", assignee: "Jane", completed: true, addedBy: familyMembers.length > 0 ? familyMembers[0].name : "Unknown", addedTime: dayjs() },
    { title: "Wash dishes", assignee: "John", completed: false, addedBy: familyMembers.length > 0 ? familyMembers[0].name : "Unknown", addedTime: dayjs() },
    { title: "Vacuum living room", assignee: "Jane", completed: false, addedBy: familyMembers.length > 0 ? familyMembers[0].name : "Unknown", addedTime: dayjs() },
    { title: "Do laundry", assignee: "John", completed: true, addedBy: familyMembers.length > 0 ? familyMembers[0].name : "Unknown", addedTime: dayjs() },
    { title: "Water plants", assignee: "Jane", completed: false, addedBy: familyMembers.length > 0 ? familyMembers[0].name : "Unknown", addedTime: dayjs() },
    { title: "Mow lawn", assignee: "John", completed: false, addedBy: familyMembers.length > 0 ? familyMembers[0].name : "Unknown", addedTime: dayjs() },
    { title: "Math homework", assignee: "Alice", completed: false, addedBy: familyMembers.length > 0 ? familyMembers[0].name : "Unknown", addedTime: dayjs() },
    { title: "Science project", assignee: "Bob", completed: true, addedBy: familyMembers.length > 0 ? familyMembers[0].name : "Unknown", addedTime: dayjs() },
  ]);
  const [newTask, setNewTask] = useState<string>("");
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>("");
  const [newTaskAddedBy, setNewTaskAddedBy] = useState<string>(selectedUser);
  const [editTaskIndex, setEditTaskIndex] = useState<number | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([
    { name: "Dr. Smith", role: "Family Doctor", phone: "123-456-7890", addedBy: familyMembers.length > 0 ? familyMembers[0].name : "Unknown", addedTime: dayjs() },
    { name: "Aunt Mary", role: "Emergency Contact", phone: "098-765-4321", addedBy: familyMembers.length > 0 ? familyMembers[0].name : "Unknown", addedTime: dayjs() },
  ]);
  const [newContact, setNewContact] = useState<Contact>({ name: "", role: "", phone: "", addedBy: selectedUser, addedTime: dayjs() });
  const [editContactIndex, setEditContactIndex] = useState<number | null>(null);

  const contentCategories = [
    { label: "Home Management", children: ["Property Information", "Mortgage & Loans", "Home Maintenance", "Utilities", "Insurance", "Important Documents",'others'] },
    { label: "Financial Dashboard", children: [] },
    // { label: "Family Hub", children: [ "Shared Tasks", "Contact Information"] },
    { label: "Health Records", children: ["Insurance Information", "Medical Records"] },
    { label: "Travel Planning", children: [] },
  ];

  // Update selectedUser when familyMembers change
  useEffect(() => {
    if (familyMembers.length > 0 && !familyMembers.some(member => member.name === selectedUser)) {
      setSelectedUser(familyMembers[0].name);
      setNewDocument(prev => ({ ...prev, uploadedBy: familyMembers[0].name, addedBy: familyMembers[0].name }));
      setNewSection(prev => ({ ...prev, addedBy: familyMembers[0].name }));
      setNewEvent(prev => ({ ...prev, addedBy: familyMembers[0].name }));
      setNewContact(prev => ({ ...prev, addedBy: familyMembers[0].name }));
      setNewTaskAddedBy(familyMembers[0].name);
      setNewGuidelineAddedBy(familyMembers[0].name);
      setNewNoteAddedBy(familyMembers[0].name);
    }
  }, [familyMembers]);

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('File must be smaller than 2MB!');
        return false;
      }
      setNewDocument({
        ...newDocument,
        file,
        fileUrl: URL.createObjectURL(file),
      });
      return false;
    },
    fileList: newDocument.file ? [newDocument.file] : [],
  };

  const handleAddDocument = () => {
    if (!newDocument.title || !newDocument.category || !newDocument.file || !selectedUser) {
      message.error("Please fill in all fields, upload a file, and select a family member.");
      return;
    }
    const newDoc = {
      ...newDocument,
      id: Date.now().toString(),
      uploadTime: dayjs(),
      addedBy: selectedUser,
      addedTime: dayjs(),
      uploadedBy: selectedUser,
    };
    setDocuments([...documents, newDoc]);
    setNewDocument({
      id: "",
      title: "",
      category: "",
      file: null,
      uploadedBy: selectedUser,
      uploadTime: dayjs(),
      addedBy: selectedUser,
      addedTime: dayjs(),
    });
    setStep("intro");
    message.success("Document added successfully!");
  };

  const handleEditDocument = () => {
    if (!newDocument.title || !newDocument.category || !selectedUser) {
      message.error("Please fill in all fields and select a family member.");
      return;
    }
    if (editDocumentIndex !== null) {
      const updatedDocuments = [...documents];
      updatedDocuments[editDocumentIndex] = {
        ...newDocument,
        uploadTime: dayjs(),
        editedBy: selectedUser,
        editedTime: dayjs(),
      };
      setDocuments(updatedDocuments);
      setNewDocument({
        id: "",
        title: "",
        category: "",
        file: null,
        uploadedBy: selectedUser,
        uploadTime: dayjs(),
        addedBy: selectedUser,
        addedTime: dayjs(),
      });
      setEditDocumentIndex(null);
      setStep("intro");
      message.success("Document updated successfully!");
    }
  };

  const handleAddGuideline = () => {
    if (!newGuideline.trim() || !newGuidelineAddedBy) return;
    setFamilyGuidelines([...familyGuidelines, {
      text: newGuideline,
      addedBy: newGuidelineAddedBy,
      addedTime: dayjs(),
    }]);
    setNewGuideline("");
    setStep("intro");
  };

  const handleEditGuideline = () => {
    if (!newGuideline.trim() || editGuidelineIndex === null || !newGuidelineAddedBy) return;
    const updatedGuidelines = [...familyGuidelines];
    updatedGuidelines[editGuidelineIndex] = {
      text: newGuideline,
      addedBy: familyGuidelines[editGuidelineIndex].addedBy,
      addedTime: familyGuidelines[editGuidelineIndex].addedTime,
      editedBy: newGuidelineAddedBy,
      editedTime: dayjs(),
    };
    setFamilyGuidelines(updatedGuidelines);
    setNewGuideline("");
    setEditGuidelineIndex(null);
    setStep("intro");
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !newNoteAddedBy) return;
    setFamilyNotes([...familyNotes, {
      text: newNote,
      addedBy: newNoteAddedBy,
      addedTime: dayjs(),
    }]);
    setNewNote("");
    setStep("intro");
  };

  const handleEditNote = () => {
    if (!newNote.trim() || editNoteIndex === null || !newNoteAddedBy) return;
    const updatedNotes = [...familyNotes];
    updatedNotes[editNoteIndex] = {
      text: newNote,
      addedBy: familyNotes[editNoteIndex].addedBy,
      addedTime: familyNotes[editNoteIndex].addedTime,
      editedBy: newNoteAddedBy,
      editedTime: dayjs(),
    };
    setFamilyNotes(updatedNotes);
    setNewNote("");
    setEditNoteIndex(null);
    setStep("intro");
  };

  const handleAddSection = () => {
    if (!newSection.title.trim() || !newSection.content.trim() || !selectedUser) return;
    setSections([...sections, {
      ...newSection,
      addedBy: selectedUser,
      addedTime: dayjs(),
    }]);
    setNewSection({ title: "", content: "", addedBy: selectedUser, addedTime: dayjs() });
    setStep("intro");
    message.success("Section added successfully!");
  };

  const handleEditSection = () => {
    if (!newSection.title.trim() || !newSection.content.trim() || editSectionIndex === null || !selectedUser) return;
    const updatedSections = [...sections];
    updatedSections[editSectionIndex] = {
      ...newSection,
      addedBy: sections[editSectionIndex].addedBy,
      addedTime: sections[editSectionIndex].addedTime,
      editedBy: selectedUser,
      editedTime: dayjs(),
    };
    setSections(updatedSections);
    setNewSection({ title: "", content: "", addedBy: selectedUser, addedTime: dayjs() });
    setEditSectionIndex(null);
    setStep("intro");
    message.success("Section updated successfully!");
  };

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };

  const handleDateSelect = (date: Dayjs) => {
    const eventsOnDate = upcomingEvents.filter(event => event.date.isSame(date, 'day'));
    setSelectedDateEvents(eventsOnDate);
    setIsModalVisible(true);
  };

  const dateCellRender = (value: Dayjs) => {
    const eventsOnDate = upcomingEvents.filter(event => event.date.isSame(value, 'day'));
    return (
      <div>
        {eventsOnDate.map((event, index) => (
          <div
            key={index}
            style={{
              width: "8px",
              height: "8px",
              backgroundColor: event.color,
              borderRadius: "50%",
              margin: "2px auto",
            }}
          />
        ))}
      </div>
    );
  };

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !selectedUser) return;
    setUpcomingEvents([...upcomingEvents, {
      ...newEvent,
      addedBy: selectedUser,
      addedTime: dayjs(),
    }]);
    setNewEvent({ date: dayjs(), title: "", color: "#1890ff", addedBy: selectedUser, addedTime: dayjs() });
    setStep("intro");
  };

  const handleToggleTask = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    updatedTasks[index].editedBy = selectedUser;
    updatedTasks[index].editedTime = dayjs();
    setTasks(updatedTasks);
  };

  const handleAddTask = () => {
    if (!newTask.trim() || !newTaskAssignee.trim() || !newTaskAddedBy) return;
    setTasks([...tasks, {
      title: newTask,
      assignee: newTaskAssignee,
      completed: false,
      addedBy: newTaskAddedBy,
      addedTime: dayjs(),
    }]);
    setNewTask("");
    setNewTaskAssignee("");
    setStep("intro");
  };

  const handleEditTask = () => {
    if (!newTask.trim() || !newTaskAssignee.trim() || editTaskIndex === null || !newTaskAddedBy) return;
    const updatedTasks = [...tasks];
    updatedTasks[editTaskIndex] = {
      title: newTask,
      assignee: newTaskAssignee,
      completed: tasks[editTaskIndex].completed,
      addedBy: tasks[editTaskIndex].addedBy,
      addedTime: tasks[editTaskIndex].addedTime,
      editedBy: newTaskAddedBy,
      editedTime: dayjs(),
    };
    setTasks(updatedTasks);
    setNewTask("");
    setNewTaskAssignee("");
    setEditTaskIndex(null);
    setStep("intro");
  };

  const handleAddContact = () => {
    if (!newContact.name.trim() || !newContact.role.trim() || !newContact.phone.trim() || !selectedUser) return;
    setContacts([...contacts, {
      ...newContact,
      addedBy: selectedUser,
      addedTime: dayjs(),
    }]);
    setNewContact({ name: "", role: "", phone: "", addedBy: selectedUser, addedTime: dayjs() });
    setStep("intro");
  };

  const handleEditContact = () => {
    if (!newContact.name.trim() || !newContact.role.trim() || !newContact.phone.trim() || editContactIndex === null || !selectedUser) return;
    const updatedContacts = [...contacts];
    updatedContacts[editContactIndex] = {
      ...newContact,
      addedBy: contacts[editContactIndex].addedBy,
      addedTime: contacts[editContactIndex].addedTime,
      editedBy: selectedUser,
      editedTime: dayjs(),
    };
    setContacts(updatedContacts);
    setNewContact({ name: "", role: "", phone: "", addedBy: selectedUser, addedTime: dayjs() });
    setEditContactIndex(null);
    setStep("intro");
  };

  const handleDone = () => {
    if (pendingMember) {
      setFamilyMembers([...familyMembers, pendingMember]);
      setPendingMember(null);
      setFormData({
        name: "",
        relationship: "Spouse/Partner",
        method: "Email",
        permissions: { type: "Custom Access", allowAdd: false, allowEdit: true, allowDelete: false, allowInvite: false, notify: true },
        sharedItems: {},
      });
      setSelectedMethod("Email");
      setStep("intro");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePermissionChange = (field: keyof PermissionState) => {
    setFormData(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [field]: !prev.permissions[field] },
    }));
  };

  const toggleParent = (category: string, checked: boolean) => {
    const children = contentCategories.find(c => c.label === category)?.children || [];
    setFormData(prev => ({
      ...prev,
      sharedItems: { 
        ...prev.sharedItems, 
        [category]: checked 
          ? (children.filter((c): c is string => typeof c === "string") as string[]) 
          : [] 
      },
    }));
  };

  const toggleChild = (category: string, item: string) => {
    setFormData(prev => {
      const current = prev.sharedItems[category] || [];
      const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
      return { ...prev, sharedItems: { ...prev.sharedItems, [category]: updated } };
    });
  };

  const isParentChecked = (category: string) => {
    const children = contentCategories.find(c => c.label === category)?.children || [];
    const selected = formData.sharedItems[category] || [];
    return children.length > 0 && children.every(c => selected.includes(c));
  };

  const renderIntro = () => {
    const currentDateTime = "06:47 PM IST on Thursday, May 22, 2025";

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
                  doc.fileUrl ? (
                    <Button
                      type="link"
                      onClick={() => window.open(doc.fileUrl, '_blank')}
                      style={{ padding: "0", color: "#1890ff" }}
                    >
                      View
                    </Button>
                  ) : (
                    <Text style={{ fontSize: "12px", color: "#666" }}>No file available</Text>
                  ),
                ]}
              >
                <List.Item.Meta
                  title={<Text style={{ fontSize: "14px" }}>{doc.title}</Text>}
                  description={
                    <div>
                      <Text style={{ fontSize: "12px", color: "#666" }}>{doc.category}</Text>
                      <br />
                      <Text style={{ fontSize: "12px", color: "#666" }}>
                        Uploaded by {doc.uploadedBy} on {doc.uploadTime.format("MMM D, YYYY h:mm A")}
                      </Text>
                      <br />
                      <Text style={{ fontSize: "12px", color: "#666" }}>
                        Added by {doc.addedBy} on {doc.addedTime.format("MMM D, YYYY h:mm A")}
                      </Text>
                      {doc.editedBy && doc.editedTime && (
                        <>
                          <br />
                          <Text style={{ fontSize: "12px", color: "#666" }}>
                            Edited by {doc.editedBy} on {doc.editedTime.format("MMM D, YYYY h:mm A")}
                          </Text>
                        </>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={() => {
              setNewDocument({
                id: "",
                title: "",
                category: "",
                file: null,
                uploadedBy: selectedUser,
                uploadTime: dayjs(),
                addedBy: selectedUser,
                addedTime: dayjs(),
              });
              setStep("addDocument");
            }}
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
                      setNewGuideline(item.text);
                      setNewGuidelineAddedBy(item.addedBy);
                      setEditGuidelineIndex(index);
                      setStep("editGuideline");
                    }}
                    style={{ padding: "0", color: "#1890ff" }}
                  >
                    Edit
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={<Text style={{ fontSize: "14px" }}>{item.text}</Text>}
                  description={
                    <div>
                      <Text style={{ fontSize: "12px", color: "#666" }}>
                        Added by {item.addedBy} on {item.addedTime.format("MMM D, YYYY h:mm A")}
                      </Text>
                      {item.editedBy && item.editedTime && (
                        <>
                          <br />
                          <Text style={{ fontSize: "12px", color: "#666" }}>
                            Edited by {item.editedBy} on {item.editedTime.format("MMM D, YYYY h:mm A")}
                          </Text>
                        </>
                      )}
                    </div>
                  }
                />
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
                      setNewNote(item.text);
                      setNewNoteAddedBy(item.addedBy);
                      setEditNoteIndex(index);
                      setStep("editNote");
                    }}
                    style={{ padding: "0", color: "#1890ff" }}
                  >
                    Edit
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={<Text style={{ fontSize: "14px" }}>{item.text}</Text>}
                  description={
                    <div>
                      <Text style={{ fontSize: "12px", color: "#666" }}>
                        Added by {item.addedBy} on {item.addedTime.format("MMM D, YYYY h:mm A")}
                      </Text>
                      {item.editedBy && item.editedTime && (
                        <>
                          <br />
                          <Text style={{ fontSize: "12px", color: "#666" }}>
                            Edited by {item.editedBy} on {item.editedTime.format("MMM D, YYYY h:mm A")}
                          </Text>
                        </>
                      )}
                    </div>
                  }
                />
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

        {sections.map((section, index) => (
          <Card key={index} style={{ borderRadius: "10px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
              <FileAddOutlined style={{ fontSize: "20px", color: "#13c2c2", marginRight: "10px" }} />
              <Title level={4} style={{ color: "#13c2c2", margin: 0 }}>{section.title}</Title>
            </div>
            <List
              dataSource={[section]}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setNewSection(item);
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
                    title={<Text style={{ fontSize: "14px" }}>{item.title}</Text>}
                    description={
                      <div>
                        <Text style={{ fontSize: "12px", color: "#666" }}>{item.content}</Text>
                        <br />
                        <Text style={{ fontSize: "12px", color: "#666" }}>
                          Added by {item.addedBy} on {item.addedTime.format("MMM D, YYYY h:mm A")}
                        </Text>
                        {item.editedBy && item.editedTime && (
                          <>
                            <br />
                            <Text style={{ fontSize: "12px", color: "#666" }}>
                              Edited by {item.editedBy} on {item.editedTime.format("MMM D, YYYY h:mm A")}
                            </Text>
                          </>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        ))}

        <Card style={{ borderRadius: "10px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", textAlign: "center", padding: "20px" }}>
          <Button
            type="default"
            icon={<PlusOutlined />}
            onClick={() => setStep("addSection")}
            style={{
              borderRadius: "5px",
              padding: "10px 20px",
              fontSize: "14px",
              border: "1px solid #d9d9d9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
            }}
          >
            Add a new section
          </Button>
          <Text style={{ display: "block", marginTop: "10px", fontSize: "12px", color: "#666" }}>
            Customize your board with additional sections
          </Text>
        </Card>
      </>
    );

    return (
      <div style={{ padding: "30px" }}>
        <Card style={{ maxWidth: "1440px", margin: "0 auto", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
          {familyMembers.length === 0 ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <a href="#" style={{ color: "#0044ff", textDecoration: "none", fontSize: "14px" }}>
                  ← Back to Dashboard
                </a>
                <h2 style={{ margin: 0, textAlign: "center", flex: 1 }}>Family Sharing</h2>
                <Button type="primary" onClick={() => setStep("add")} style={{ borderRadius: "20px", padding: "5px 15px" }}>
                  Add Family Member
                </Button>
              </div>
              <Card style={{ marginTop: "20px", textAlign: "center", borderRadius: "10px" }}>
                <h3>Your Family Members</h3>
                <div style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                  borderRadius: "50%",
                  margin: "20px auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span style={{ fontSize: "30px" }}>👨‍👩‍👧</span>
                </div>
                <p style={{ fontWeight: "bold" }}>No family members added yet</p>
                <p style={{ color: "#666", marginBottom: "20px" }}>
                  Add family members to securely share important information like emergency contacts, important documents, and more.
                </p>
              </Card>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <Title level={2} style={{ margin: 0, color: "#000" }}>Family Hub</Title>
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
                    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                      {familyMembers.map((member, index) => (
                        <div key={index} style={{ textAlign: "center", width: "120px" }}>
                          <div style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: index % 2 === 0 ? "#1890ff" : "#ff4d4f",
                            color: "white",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 10px",
                          }}>
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <Text style={{ fontWeight: "normal", fontSize: "14px" }}>{member.name}</Text>
                          <br />
                          <Text style={{ fontSize: "12px", color: "#666" }}>
                            {member.relationship.replace("❤️", "").replace("👶", "").replace("👴", "")}
                          </Text>
                        </div>
                      ))}
                    </div>
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
                            title={
                              <Text style={{ fontSize: "14px", color: item.color }}>
                                {item.date.format("D")} {item.title}
                              </Text>
                            }
                            description={
                              <div>
                                <Text style={{ fontSize: "12px", color: "#666" }}>
                                  Added by {item.addedBy} on {item.addedTime.format("MMM D, YYYY h:mm A")}
                                </Text>
                                {item.editedBy && item.editedTime && (
                                  <>
                                    <br />
                                    <Text style={{ fontSize: "12px", color: "#666" }}>
                                      Edited by {item.editedBy} on {item.editedTime.format("MMM D, YYYY h:mm A")}
                                    </Text>
                                  </>
                                )}
                              </div>
                            }
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
                          <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                            <Checkbox
                              checked={task.completed}
                              onChange={() => handleToggleTask(index)}
                              style={{ marginRight: "10px" }}
                            />
                            <div>
                              <Text style={{ fontWeight: "normal", fontSize: "14px" }}>{task.title}</Text>
                              <br />
                              <Text style={{ fontSize: "12px", color: "#666" }}>
                                Added by {task.addedBy} on {task.addedTime.format("MMM D, YYYY h:mm A")}
                              </Text>
                              {task.editedBy && task.editedTime && (
                                <>
                                  <br />
                                  <Text style={{ fontSize: "12px", color: "#666" }}>
                                    Edited by {task.editedBy} on {task.editedTime.format("MMM D, YYYY h:mm A")}
                                  </Text>
                                </>
                              )}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <Text style={{ marginRight: "10px", fontSize: "14px" }}>{task.assignee}</Text>
                            <Button
                              type="link"
                              icon={<EditOutlined />}
                              onClick={() => {
                                setNewTask(task.title);
                                setNewTaskAssignee(task.assignee);
                                setNewTaskAddedBy(task.addedBy);
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
                          <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                            <Checkbox
                              checked={task.completed}
                              onChange={() => handleToggleTask(index + 7)}
                              style={{ marginRight: "10px" }}
                            />
                            <div>
                              <Text style={{ fontWeight: "normal", fontSize: "14px" }}>{task.title}</Text>
                              <br />
                              <Text style={{ fontSize: "12px", color: "#666" }}>
                                Added by {task.addedBy} on {task.addedTime.format("MMM D, YYYY h:mm A")}
                              </Text>
                              {task.editedBy && task.editedTime && (
                                <>
                                  <br />
                                  <Text style={{ fontSize: "12px", color: "#666" }}>
                                    Edited by {task.editedBy} on {task.editedTime.format("MMM D, YYYY h:mm A")}
                                  </Text>
                                </>
                              )}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <Text style={{ marginRight: "10px", fontSize: "14px" }}>{task.assignee}</Text>
                            <Button
                              type="link"
                              icon={<EditOutlined />}
                              onClick={() => {
                                setNewTask(task.title);
                                setNewTaskAssignee(task.assignee);
                                setNewTaskAddedBy(task.addedBy);
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

                  <Card style={{ borderRadius: "10px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                      <PhoneOutlined style={{ fontSize: "20px", color: "#ff4d4f", marginRight: "10px" }} />
                      <Title level={4} style={{ color: "#ff4d4f", margin: 0 }}>Emergency Contacts</Title>
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
                            description={
                              <div>
                                <Text style={{ fontSize: "12px", color: "#666" }}>{contact.role} - {contact.phone}</Text>
                                <br />
                                <Text style={{ fontSize: "12px", color: "#666" }}>
                                  Added by {contact.addedBy} on {contact.addedTime.format("MMM D, YYYY h:mm A")}
                                </Text>
                                {contact.editedBy && contact.editedTime && (
                                  <>
                                    <br />
                                    <Text style={{ fontSize: "12px", color: "#666" }}>
                                      Edited by {contact.editedBy} on {contact.editedTime.format("MMM D, YYYY h:mm A")}
                                    </Text>
                                  </>
                                )}
                              </div>
                            }
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
                      {step === "add" && renderAddForm()}
                      {step === "permissions" && renderPermissions()}
                      {step === "share" && renderSharingOptions()}
                      {step === "review" && renderReview()}
                      {step === "sent" && renderSent()}
                    </Card>
                  ) : (
                    renderDefaultRightSections()
                  )}
                </Col>
              </Row>
            </>
          )}
        </Card>

        <Modal
          title="Events"
          open={isModalVisible}
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
                    description={
                      <div>
                        <Text style={{ fontSize: "12px", color: "#666" }}>
                          Added by {item.addedBy} on {item.addedTime.format("MMM D, YYYY h:mm A")}
                        </Text>
                        {item.editedBy && item.editedTime && (
                          <>
                            <br />
                            <Text style={{ fontSize: "12px", color: "#666" }}>
                              Edited by {item.editedBy} on {item.editedTime.format("MMM D, YYYY h:mm A")}
                            </Text>
                          </>
                        )}
                      </div>
                    }
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
    const isFormValid = () => {
      if (!formData.name || !formData.relationship) return false;
      if (selectedMethod === "Email" && !formData.email) return false;
      if (selectedMethod === "Mobile" && !formData.phone) return false;
      if (selectedMethod === "Access Code" && !formData.accessCode) return false;
      return true;
    };

    return (
      <div>
        <h2>Add a Family Member</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          {["Email", "Mobile", "Access Code"].map(method => (
            <Button
              key={method}
              type={selectedMethod === method ? "primary" : "default"}
              onClick={() => setSelectedMethod(method)}
              style={{ borderRadius: "20px", padding: "5px 15px" }}
            >
              {method}
            </Button>
          ))}
        </div>
        {selectedMethod === "Email" && (
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email Address"
            style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
          />
        )}
        {selectedMethod === "Mobile" && (
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Phone Number"
            style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
          />
        )}
        {selectedMethod === "Access Code" && (
          <Input
            type="text"
            name="accessCode"
            value={formData.accessCode}
            onChange={handleInputChange}
            placeholder="Access Code"
            style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
          />
        )}
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Display Name"
          style={{ margin: "10px 0", borderRadius: "5px", padding: "10px" }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {["❤️Spouse/Partner", "👶Child", "👴Parent", "Other"].map(rel => (
            <Button
              key={rel}
              type={formData.relationship === rel ? "primary" : "default"}
              onClick={() => setFormData({ ...formData, relationship: rel })}
              style={{ borderRadius: "20px", padding: "5px 15px" }}
            >
              {rel}
            </Button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
          <Button
            onClick={() => setStep("intro")}
            style={{ borderRadius: "20px", padding: "5px 15px" }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            disabled={!isFormValid()}
            onClick={() => setStep("permissions")}
            style={{ borderRadius: "20px", padding: "5px 15px" }}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  };

  const renderPermissions = () => (
    <div>
      <h3>Set Permissions for: {formData.name}</h3>
      <div style={{ display: "flex", gap: "10px" }}>
        {["Full Access", "Custom Access"].map(type => (
          <Button
            key={type}
            type={formData.permissions.type === type ? "primary" : "default"}
            onClick={() => setFormData({ ...formData, permissions: { ...formData.permissions, type } })}
            style={{ borderRadius: "20px", padding: "5px 15px" }}
          >
            {type}
          </Button>
        ))}
      </div>
      {formData.permissions.type === "Custom Access" && (
        <div style={{ marginTop: "20px" }}>
          {["allowAdd", "allowEdit", "allowDelete", "allowInvite", "notify"].map((key) => (
            <div key={key} style={{ marginBottom: "8px" }}>
              <Checkbox
                checked={typeof formData.permissions[key as keyof PermissionState] === "boolean" ? formData.permissions[key as keyof PermissionState] as boolean : undefined}
                onChange={() => handlePermissionChange(key as keyof PermissionState)}
              >
                {key.replace("allow", "Allow ").replace(/([A-Z])/g, " $1")}
              </Checkbox>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
        <Button
          onClick={() => setStep("add")}
          style={{ borderRadius: "20px", padding: "5px 15px" }}
        >
          Back
        </Button>
        <Button
          type="primary"
          onClick={() => setStep("share")}
          style={{ borderRadius: "20px", padding: "5px 15px" }}
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderSharingOptions = () => {
    const hasSelectedItems = Object.values(formData.sharedItems).some(items => items.length > 0);
    return (
      <div>
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
                      checked={formData.sharedItems[label]?.includes(child) || false}
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
          <Button
            onClick={() => setStep("permissions")}
            style={{ borderRadius: "20px", padding: "5px 15px" }}
          >
            Back
          </Button>
          <Button
            type="primary"
            disabled={!hasSelectedItems}
            onClick={() => {
              setPendingMember(formData);
              setStep("review");
            }}
            style={{ borderRadius: "20px", padding: "5px 15px" }}
          >
            Continue
          </Button>
        </div>
    </div>
  );
};

const renderReview = () => (
  <div>
    <h3>Review Invitation</h3>
    <p><strong>To:</strong> {formData.method === "Email" ? formData.email : formData.method === "Mobile" ? formData.phone : formData.accessCode}</p>
    <p><strong>Name:</strong> {formData.name}</p>
    <p><strong>Relationship:</strong> {formData.relationship.replace("❤️", "").replace("👶", "").replace("👴", "")}</p>
    <p><strong>Access:</strong> {formData.permissions.type}</p>
    <ul>
      {Object.entries(formData.sharedItems).flatMap(([category, items]) =>
        items.map(item => <li key={category + item}>{item}</li>)
      )}
    </ul>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
      <Button
        onClick={() => setStep("share")}
        style={{ borderRadius: "20px", padding: "5px 15px" }}
      >
        Back
      </Button>
      <Button
        type="primary"
        onClick={() => setStep("sent")}
        style={{ borderRadius: "20px", padding: "5px 15px" }}
      >
        Send Invitation
      </Button>
    </div>
  </div>
);

const renderSent = () => (
  <div style={{ textAlign: "center" }}>
    <h3>Invitation Sent!</h3>
    <p>An invitation has been sent to {pendingMember?.name || "the family member"}.</p>
    <Button
      type="primary"
      onClick={handleDone}
      style={{ marginTop: "20px", borderRadius: "20px", padding: "5px 15px" }}
    >
      Done
    </Button>
  </div>
);

const renderAddGuidelineForm = () => (
  <div style={{ padding: "20px" }}>
    <h3>Add a Family Guideline</h3>
    {familyMembers.length === 0 ? (
      <Text style={{ color: "red" }}>Please add a family member first.</Text>
    ) : (
      <>
        <Input
          value={newGuideline}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGuideline(e.target.value)}
          placeholder="Enter guideline (e.g., No screen time after 9 PM)"
          style={{ marginBottom: "20px", borderRadius: "5px", padding: "10px", fontSize: "14px", border: "1px solid #d9d9d9" }}
        />
        <Select
          value={newGuidelineAddedBy}
          onChange={(value) => setNewGuidelineAddedBy(value)}
          placeholder="Select family member"
          style={{ width: "100%", marginBottom: "20px", borderRadius: "5px" }}
        >
          {familyMembers.map(member => (
            <Option key={member.name} value={member.name}>{member.name}</Option>
          ))}
        </Select>
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
            disabled={!newGuideline.trim() || !newGuidelineAddedBy}
            onClick={handleAddGuideline}
            style={{
              borderRadius: "20px",
              padding: "5px 20px",
              fontSize: "14px",
              height: "auto",
              backgroundColor: newGuideline.trim() && newGuidelineAddedBy ? "#1890ff" : "#d9d9d9",
              border: "none",
            }}
          >
            Add Guideline
          </Button>
        </div>
      </>
    )}
  </div>
);

const renderEditGuidelineForm = () => (
  <div style={{ padding: "20px" }}>
    <h3>Edit Guideline</h3>
    <Input
      value={newGuideline}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGuideline(e.target.value)}
      placeholder="Enter guideline"
      style={{ marginBottom: "20px", borderRadius: "5px", padding: "10px", fontSize: "14px", border: "1px solid #d9d9d9" }}
    />
    <Select
      value={newGuidelineAddedBy}
      onChange={(value) => setNewGuidelineAddedBy(value)}
      placeholder="Select family member"
      style={{ width: "100%", marginBottom: "20px", borderRadius: "5px" }}
    >
      {familyMembers.map(member => (
        <Option key={member.name} value={member.name}>{member.name}</Option>
      ))}
    </Select>
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
        disabled={!newGuideline.trim() || !newGuidelineAddedBy}
        onClick={handleEditGuideline}
        style={{
          borderRadius: "20px",
          padding: "5px 20px",
          fontSize: "14px",
          height: "auto",
          backgroundColor: newGuideline.trim() && newGuidelineAddedBy ? "#1890ff" : "#d9d9d9",
          border: "none",
        }}
      >
        Save Changes
      </Button>
    </div>
  </div>
);

const renderAddNoteForm = () => (
  <div style={{ padding: "20px" }}>
    <h3>Add a Family Note</h3>
    {familyMembers.length === 0 ? (
      <Text style={{ color: "red" }}>Please add a family member first.</Text>
    ) : (
      <>
        <Input
          value={newNote}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewNote(e.target.value)}
          placeholder="Enter note (e.g., Buy groceries on Saturday)"
          style={{ marginBottom: "20px", borderRadius: "5px", padding: "10px", fontSize: "14px", border: "1px solid #d9d9d9" }}
        />
        <Select
          value={newNoteAddedBy}
          onChange={(value) => setNewNoteAddedBy(value)}
          placeholder="Select family member"
          style={{ width: "100%", marginBottom: "20px", borderRadius: "5px" }}
        >
          {familyMembers.map(member => (
            <Option key={member.name} value={member.name}>{member.name}</Option>
          ))}
        </Select>
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
            disabled={!newNote.trim() || !newNoteAddedBy}
            onClick={handleAddNote}
            style={{
              borderRadius: "20px",
              padding: "5px 20px",
              fontSize: "14px",
              height: "auto",
              backgroundColor: newNote.trim() && newNoteAddedBy ? "#1890ff" : "#d9d9d9",
              border: "none",
            }}
          >
            Add Note
          </Button>
        </div>
      </>
    )}
  </div>
);

const renderEditNoteForm = () => (
  <div style={{ padding: "20px" }}>
    <h3>Edit Note</h3>
    <Input
      value={newNote}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewNote(e.target.value)}
      placeholder="Enter note"
      style={{ marginBottom: "20px", borderRadius: "5px", padding: "10px", fontSize: "14px", border: "1px solid #d9d9d9" }}
    />
    <Select
      value={newNoteAddedBy}
      onChange={(value) => setNewNoteAddedBy(value)}
      placeholder="Select family member"
      style={{ width: "100%", marginBottom: "20px", borderRadius: "5px" }}
    >
      {familyMembers.map(member => (
        <Option key={member.name} value={member.name}>{member.name}</Option>
      ))}
    </Select>
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
        disabled={!newNote.trim() || !newNoteAddedBy}
        onClick={handleEditNote}
        style={{
          borderRadius: "20px",
          padding: "5px 20px",
          fontSize: "14px",
          height: "auto",
          backgroundColor: newNote.trim() && newNoteAddedBy ? "#1890ff" : "#d9d9d9",
          border: "none",
        }}
      >
        Save Changes
      </Button>
    </div>
  </div>
);

const renderAddSectionForm = () => (
  <div style={{ padding: "20px" }}>
    <h3>Add a Section</h3>
    {familyMembers.length === 0 ? (
      <Text style={{ color: "red" }}>Please add a family member first.</Text>
    ) : (
      <>
        <Input
          value={newSection.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSection({ ...newSection, title: e.target.value })}
          placeholder="Section title"
          style={{ marginBottom: "20px", borderRadius: "5px", padding: "10px", fontSize: "14px", border: "1px solid #d9d9d9" }}
        />
        <Input
          value={newSection.content}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSection({ ...newSection, content: e.target.value })}
          placeholder="Section content"
          style={{ marginBottom: "20px", borderRadius: "5px", padding: "10px", fontSize: "14px", border: "1px solid #d9d9d9" }}
        />
        <Select
          value={selectedUser}
          onChange={(value) => setSelectedUser(value)}
          placeholder="Select family member"
          style={{ width: "100%", marginBottom: "20px", borderRadius: "5px" }}
        >
          {familyMembers.map(member => (
            <Option key={member.name} value={member.name}>{member.name}</Option>
          ))}
        </Select>
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
            disabled={!newSection.title.trim() || !newSection.content.trim() || !selectedUser}
            onClick={handleAddSection}
            style={{
              borderRadius: "20px",
              padding: "5px 20px",
              fontSize: "14px",
              height: "auto",
              backgroundColor: newSection.title.trim() && newSection.content.trim() && selectedUser ? "#1890ff" : "#d9d9d9",
              border: "none",
            }}
          >
            Add Section
          </Button>
        </div>
      </>
    )}
  </div>
);

const renderEditSectionForm = () => (
  <div style={{ padding: "20px" }}>
    <h3>Edit Section</h3>
    <Input
      value={newSection.title}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSection({ ...newSection, title: e.target.value })}
      placeholder="Section title"
      style={{ marginBottom: "20px", borderRadius: "5px", padding: "10px", fontSize: "14px", border: "1px solid #d9d9d9" }}
    />
    <Input
      value={newSection.content}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSection({ ...newSection, content: e.target.value })}
      placeholder="Section content"
      style={{ marginBottom: "20px", borderRadius: "5px", padding: "10px", fontSize: "14px", border: "1px solid #d9d9d9" }}
    />
    <Select
      value={selectedUser}
      onChange={(value) => setSelectedUser(value)}
      placeholder="Select family member"
      style={{ width: "100%", marginBottom: "20px", borderRadius: "5px" }}
    >
      {familyMembers.map(member => (
        <Option key={member.name} value={member.name}>{member.name}</Option>
      ))}
    </Select>
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
        disabled={!newSection.title.trim() || !newSection.content.trim() || !selectedUser}
        onClick={handleEditSection}
        style={{
          borderRadius: "20px",
          padding: "5px 20px",
          fontSize: "14px",
          height: "auto",
          backgroundColor: newSection.title.trim() && newSection.content.trim() && selectedUser ? "#1890ff" : "#d9d9d9",
          border: "none",
        }}
      >
        Save Changes
      </Button>
    </div>
  </div>
);

const renderAddEventForm = () => (
  <div style={{ padding: "20px" }}>
    <h3>Add an Event</h3>
    {familyMembers.length === 0 ? (
      <Text style={{ color: "red" }}>Please add a family member first.</Text>
    ) : (
      <>
        <Input
          value={newEvent.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, title: e.target.value })}
          placeholder="Event title"
          style={{ marginBottom: "20px", borderRadius: "5px", padding: "10px", fontSize: "14px", border: "1px solid #d9d9d9" }}
        />
        <Select
          value={newEvent.color}
          onChange={(value) => setNewEvent({ ...newEvent, color: value })}
          placeholder="Select event color"
          style={{ width: "100%", marginBottom: "20px", borderRadius: "5px" }}
        >
          <Option value="#1890ff">Blue</Option>
          <Option value="#ff4d4f">Red</Option>
          <Option value="#52c41a">Green</Option>
        </Select>
        <Select
          value={selectedUser}
          onChange={(value) => setSelectedUser(value)}
          placeholder="Select family member"
          style={{ width: "100%", marginBottom: "20px", borderRadius: "5px" }}
        >
          {familyMembers.map(member => (
            <Option key={member.name} value={member.name}>{member.name}</Option>
          ))}
        </Select>
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
            disabled={!newEvent.title.trim() || !selectedUser}
            onClick={handleAddEvent}
            style={{
              borderRadius: "20px",
              padding: "5px 20px",
              fontSize: "14px",
              height: "auto",
              backgroundColor: newEvent.title.trim() && selectedUser ? "#1890ff" : "#d9d9d9",
              border: "none",
            }}
          >
            Add Event
          </Button>
        </div>
      </>
    )}
  </div>
);

const renderAddTaskForm = () => (
  <div style={{ padding: "20px" }}>
    <h3>Add a Task</h3>
    {familyMembers.length === 0 ? (
      <Text style={{ color: "red" }}>Please add a family member first.</Text>
    ) : (
      <>
        <Input
          value={newTask}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value)}
          placeholder="Task title (e.g., Take out trash)"
          style={{ marginBottom: "20px", borderRadius: "5px", padding: "10px", fontSize: "14px", border: "1px solid #d9d9d9" }}
        />
        <Select
          value={newTaskAssignee}
          onChange={(value) => setNewTaskAssignee(value)}
          placeholder="Assign to"
          style={{ width: "100%", marginBottom: "20px", borderRadius: "5px" }}
        >
          {familyMembers.map(member => (
            <Option key={member.name} value={member.name}>{member.name}</Option>
          ))}
        </Select>
        <Select
          value={newTaskAddedBy}
          onChange={(value) => setNewTaskAddedBy(value)}
          placeholder="Select family member"
          style={{ width: "100%", marginBottom: "20px", borderRadius: "5px" }}
        >
          {familyMembers.map(member => (
            <Option key={member.name} value={member.name}>{member.name}</Option>
          ))}
        </Select>
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
            disabled={!newTask.trim() || !newTaskAssignee || !newTaskAddedBy}
            onClick={handleAddTask}
            style={{
              borderRadius: "20px",
              padding: "5px 20px",
              fontSize: "14px",
              height: "auto",
              backgroundColor: newTask.trim() && newTaskAssignee && newTaskAddedBy ? "#1890ff" : "#d9d9d9",
              border: "none",
            }}
          >
            Add Task
          </Button>
        </div>
      </>
    )}
  </div>
);

const renderEditTaskForm = () => (
  <div style={{ padding: "20px" }}>
    <h3>Edit Task</h3>
    <Input
      value={newTask}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value)}
      placeholder="Task title"
      style={{ marginBottom: "20px", borderRadius: "5px", padding: "10px", fontSize: "14px", border: "1px solid #d9d9d9" }}
    />
    <Select
      value={newTaskAssignee}
      onChange={(value) => setNewTaskAssignee(value)}
      placeholder="Assign to"
      style={{ width: "100%", marginBottom: "20px", borderRadius: "5px" }}
    >
      {familyMembers.map(member => (
        <Option key={member.name} value={member.name}>{member.name}</Option>
      ))}
    </Select>
    <Select
      value={newTaskAddedBy}
      onChange={(value) => setNewTaskAddedBy(value)}
      placeholder="Select family member"
      style={{ width: "100%", marginBottom: "20px", borderRadius: "5px" }}
    >
      {familyMembers.map(member => (
        <Option key={member.name} value={member.name}>{member.name}</Option>
      ))}
    </Select>
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
        disabled={!newTask.trim() || !newTaskAssignee || !newTaskAddedBy}
        onClick={handleEditTask}
        style={{
          borderRadius: "20px",
          padding: "5px 20px",
          fontSize: "14px",
          height: "auto",
          backgroundColor: newTask.trim() && newTaskAssignee && newTaskAddedBy ? "#1890ff" : "#d9d9d9",
          border: "none",
        }}
      >
        Save Changes
      </Button>
    </div>
  </div>
);

const renderAddContactForm = () => (
  <div style={{ padding: "20px" }}>
    <h3>Add a Contact</h3>
    {familyMembers.length === 0 ? (
      <Text style={{ color: "red" }}>Please add a family member first.</Text>
    ) : (
      <>
        <Input
          value={newContact.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact({ ...newContact, name: e.target.value })}
          placeholder="Contact name"
          style={{ marginBottom: "20px", borderRadius: "5px", padding: "10px", fontSize: "14px", border: "1px solid #d9d9d9" }}
        />
        <Input
          value={newContact.role}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact({ ...newContact, role: e.target.value })}
          placeholder="Role (e.g., Family Doctor)"
          style={{ marginBottom: "20px", borderRadius: "5px", padding: "10px", fontSize: "14px", border: "1px solid #d9d9d9" }}
        />
        <Input
          value={newContact.phone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact({ ...newContact, phone: e.target.value })}
          placeholder="Phone number"
          style={{ marginBottom: "20px", borderRadius: "5px", padding: "10px", fontSize: "14px", border: "1px solid #d9d9d9" }}
        />
        <Select
          value={selectedUser}
          onChange={(value) => setSelectedUser(value)}
          placeholder="Select family member"
          style={{ width: "100%", marginBottom: "20px", borderRadius: "5px" }}
        >
          {familyMembers.map(member => (
            <Option key={member.name} value={member.name}>{member.name}</Option>
          ))}
        </Select>
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
            disabled={!newContact.name.trim() || !newContact.role.trim() || !newContact.phone.trim() || !selectedUser}
            onClick={handleAddContact}
            style={{
              borderRadius: "20px",
              padding: "5px 20px",
              fontSize: "14px",
              height: "auto",
              backgroundColor: newContact.name.trim() && newContact.role.trim() && newContact.phone.trim() && selectedUser ? "#1890ff" : "#d9d9d9",
              border: "none",
            }}
          >
            Add Contact
          </Button>
        </div>
      </>
    )}
  </div>
);

const renderEditContactForm = () => (
  <div style={{ padding: "20px" }}>
    <h3>Edit Contact</h3>
    <Input
      value={newContact.name}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact({ ...newContact, name: e.target.value })}
      placeholder="Contact name"
      style={{ marginBottom: "20px", borderRadius: "5px", padding: "10px", fontSize: "14px", border: "1px solid #d9d9d9" }}
    />
    <Input
      value={newContact.role}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact({ ...newContact, role: e.target.value })}
      placeholder="Role"
      style={{ marginBottom: "20px", borderRadius: "5px", padding: "10px", fontSize: "14px", border: "1px solid #d9d9d9" }}
    />
    <Input
      value={newContact.phone}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact({ ...newContact, phone: e.target.value })}
      placeholder="Phone number"
      style={{ marginBottom: "20px", borderRadius: "5px", padding: "10px", fontSize: "14px", border: "1px solid #d9d9d9" }}
    />
    <Select
      value={selectedUser}
      onChange={(value) => setSelectedUser(value)}
      placeholder="Select family member"
      style={{ width: "100%", marginBottom: "20px", borderRadius: "5px" }}
    >
      {familyMembers.map(member => (
        <Option key={member.name} value={member.name}>{member.name}</Option>
      ))}
    </Select>
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
        disabled={!newContact.name.trim() || !newContact.role.trim() || !newContact.phone.trim() || !selectedUser}
        onClick={handleEditContact}
        style={{
          borderRadius: "20px",
          padding: "5px 20px",
          fontSize: "14px",
          height: "auto",
          backgroundColor: newContact.name.trim() && newContact.role.trim() && newContact.phone.trim() && selectedUser ? "#1890ff" : "#d9d9d9",
          border: "none",
        }}
      >
        Save Changes
      </Button>
    </div>
  </div>
);

const renderAddDocumentForm = () => (
  <div style={{ padding: "20px" }}>
    <h3>Add a Document</h3>
    {familyMembers.length === 0 ? (
      <Text style={{ color: "red" }}>Please add a family member first.</Text>
    ) : (
      <>
        <Input
          value={newDocument.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDocument({ ...newDocument, title: e.target.value })}
          placeholder="Document title"
          style={{ marginBottom: "20px", borderRadius: "5px", padding: "10px", fontSize: "14px", border: "1px solid #d9d9d9" }}
        />
        <Select
          value={newDocument.category}
          onChange={(value) => setNewDocument({ ...newDocument, category: value })}
          placeholder="Select category"
          style={{ width: "100%", marginBottom: "20px", borderRadius: "5px" }}
        >
          {contentCategories.flatMap(category => category.children).map(child => (
            <Option key={child} value={child}>{child}</Option>
          ))}
        </Select>
        <Upload {...uploadProps}>
          <Button
            icon={<UploadOutlined />}
            style={{
              borderRadius: "5px",
              padding: "5px 10px",
              fontSize: "14px",
              border: "1px solid #d9d9d9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            Upload Document
          </Button>
        </Upload>
        <Select
          value={selectedUser}
          onChange={(value) => setSelectedUser(value)}
          placeholder="Select family member"
          style={{ width: "100%", marginBottom: "20px", borderRadius: "5px" }}
        >
          {familyMembers.map(member => (
            <Option key={member.name} value={member.name}>{member.name}</Option>
          ))}
        </Select>
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
            disabled={!newDocument.title.trim() || !newDocument.category || !newDocument.file || !selectedUser}
            onClick={handleAddDocument}
            style={{
              borderRadius: "20px",
              padding: "5px 20px",
              fontSize: "14px",
              height: "auto",
              backgroundColor: newDocument.title.trim() && newDocument.category && newDocument.file && selectedUser ? "#1890ff" : "#d9d9d9",
              border: "none",
            }}
          >
            Add Document
          </Button>
        </div>
      </>
    )}
  </div>
);

const renderEditDocumentForm = () => (
  <div style={{ padding: "20px" }}>
    <h3>Edit Document</h3>
    <Input
      value={newDocument.title}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDocument({ ...newDocument, title: e.target.value })}
      placeholder="Document title"
      style={{ marginBottom: "20px", borderRadius: "5px", padding: "10px", fontSize: "14px", border: "1px solid #d9d9d9" }}
    />
    <Select
      value={newDocument.category}
      onChange={(value) => setNewDocument({ ...newDocument, category: value })}
      placeholder="Select category"
      style={{ width: "100%", marginBottom: "20px", borderRadius: "5px" }}
    >
      {contentCategories.flatMap(category => category.children).map(child => (
        <Option key={child} value={child}>{child}</Option>
      ))}
    </Select>
    <Upload {...uploadProps}>
      <Button
        icon={<UploadOutlined />}
        style={{
          borderRadius: "5px",
          padding: "5px 10px",
          fontSize: "14px",
          border: "1px solid #d9d9d9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        Upload Document
      </Button>
    </Upload>
    <Select
      value={selectedUser}
      onChange={(value) => setSelectedUser(value)}
      placeholder="Select family member"
      style={{ width: "100%", marginBottom: "20px", borderRadius: "5px" }}
    >
      {familyMembers.map(member => (
        <Option key={member.name} value={member.name}>{member.name}</Option>
      ))}
    </Select>
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
        disabled={!newDocument.title.trim() || !newDocument.category || !selectedUser}
        onClick={handleEditDocument}
        style={{
          borderRadius: "20px",
          padding: "5px 20px",
          fontSize: "14px",
          height: "auto",
          backgroundColor: newDocument.title.trim() && newDocument.category && selectedUser ? "#1890ff" : "#d9d9d9",
          border: "none",
        }}
      >
        Save Changes
      </Button>
    </div>
  </div>
);

return (
  <MainLayout>
    {step === "intro" && renderIntro()}
    {step === "add" && renderAddForm()}
    {step === "permissions" && renderPermissions()}
    {step === "share" && renderSharingOptions()}
    {step === "review" && renderReview()}
    {step === "sent" && renderSent()}
    {step === "addGuideline" && renderAddGuidelineForm()}
    {step === "editGuideline" && renderEditGuidelineForm()}
    {step === "addNote" && renderAddNoteForm()}
    {step === "editNote" && renderEditNoteForm()}
    {step === "addSection" && renderAddSectionForm()}
    {step === "editSection" && renderEditSectionForm()}
    {step === "addEvent" && renderAddEventForm()}
    {step === "addTask" && renderAddTaskForm()}
    {step === "editTask" && renderEditTaskForm()}
    {step === "addContact" && renderAddContactForm()}
    {step === "editContact" && renderEditContactForm()}
    {step === "addDocument" && renderAddDocumentForm()}
    {step === "editDocument" && renderEditDocumentForm()}
  </MainLayout>
);
};

export default FamilySharing;