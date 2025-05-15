"use client";

import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  List,
  Input,
  Select,
  DatePicker,
  Divider,
  Checkbox,
  Calendar,
  Badge,
  Modal,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
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

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => (
  <div style={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
    {children}
  </div>
);

const FamilySharing: React.FC = () => {
  const [step, setStep] = useState<string>("intro");
  const [selectedMethod, setSelectedMethod] = useState<string>("Email");
  const [relationship, setRelationship] = useState<string>("Spouse/Partner");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    accessCode: "",
    name: "",
  });
  const [permissions, setPermissions] = useState<PermissionState>({
    type: "Custom Access",
    allowAdd: false,
    allowEdit: true,
    allowDelete: false,
    allowInvite: false,
    notify: true,
  });
  const [sharedItems, setSharedItems] = useState<{
    [category: string]: string[];
  }>({});
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [pendingMember, setPendingMember] = useState<FamilyMember | null>(null);
  const [familyGuidelines, setFamilyGuidelines] = useState<string[]>([
    "Homework First",
    "Chores Done",
    "Screen Time",
    "Bedtime Schedule",
  ]);
  const [newGuideline, setNewGuideline] = useState<string>("");
  const [editGuidelineIndex, setEditGuidelineIndex] = useState<number | null>(
    null
  );
  const [familyNotes, setFamilyNotes] = useState<string[]>([
    "Grocery List",
    "Vacation Ideas",
  ]);
  const [newNote, setNewNote] = useState<string>("");
  const [editNoteIndex, setEditNoteIndex] = useState<number | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([
    {
      title: "Emma’s Science Fair - School - 4:00 PM - 7:00 PM",
      color: "#ff6347",
      date: dayjs("2025-04-23"),
    },
    {
      title: "Liam’s Dental Appointment - Health - 4:00 PM - 7:00 PM",
      color: "#ffa500",
      date: dayjs("2025-04-25"),
    },
    {
      title: "Family Picnic - Family - 11:00 AM - Riverside Park",
      color: "#ff6347",
      date: dayjs("2025-04-27"),
    },
    {
      title: "Sarah’s Birthday - Family - All day - REMEMBER to order cake!",
      color: "#ff6347",
      date: dayjs("2025-05-01"),
    },
  ]);
  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: "",
    category: "School",
    date: null,
    timeRange: [],
    period: "AM",
  });
  const [tasks, setTasks] = useState<Task[]>([
    { title: "Take-out-trash", assignee: "JS", completed: true },
    { title: "Grocery-shopping", assignee: "S", completed: true },
    { title: "Clean-bathroom", assignee: "JS", completed: true },
    { title: "Mow-lawn", assignee: "L", completed: true },
    { title: "Vacuum living room", assignee: "E", completed: false },
    { title: "Clean kitchen", assignee: "S", completed: false },
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
    {
      name: "Dr. Robert Williams",
      role: "Family Doctor",
      phone: "(555) 123-4567",
    },
    {
      name: "Dr. Wilson Pediatric Dentistry",
      role: "Dentist",
      phone: "(555) 987-6543",
    },
    { name: "Martha Smith", role: "John's Mother", phone: "(555) 789-1231" },
    { name: "Michael Johnson", role: "Family Friend", phone: "(555) 234-5678" },
    {
      name: "Springfield High School",
      role: "Emma's School",
      phone: "(555) 345-6789",
    },
    {
      name: "Cedar Elementary School",
      role: "Liam's School",
      phone: "(555) 456-7890",
    },
  ]);
  const [newContact, setNewContact] = useState<Contact>({
    name: "",
    role: "",
    phone: "",
  });
  const [editContactIndex, setEditContactIndex] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs("2025-05-01"));
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);

  const contentCategories = [
    {
      label: "Home Management",
      children: [
        "Property Information",
        "Mortgage & Loans",
        "Home Maintenance",
        "Utilities",
        "Insurance",
        "Important Documents",
      ],
    },
    { label: "Financial Dashboard", children: [] },
    {
      label: "Family Hub",
      children: ["Family Calendar", "Shared Tasks", "Contact Information"],
    },
    {
      label: "Health Records",
      children: [
        "Insurance Information",
        "Medical Records",
        "Emergency Contacts",
      ],
    },
    { label: "Travel Planning", children: [] },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePermissionChange = (field: keyof PermissionState) => {
    setPermissions((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleParent = (category: string, checked: boolean) => {
    const children =
      contentCategories.find((c) => c.label === category)?.children || [];
    setSharedItems((prev) => ({
      ...prev,
      [category]: checked ? children : [],
    }));
  };

  const toggleChild = (category: string, item: string) => {
    setSharedItems((prev) => {
      const current = prev[category] || [];
      const updated = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item];
      return { ...prev, [category]: updated };
    });
  };

  const isParentChecked = (category: string) => {
    const children =
      contentCategories.find((c) => c.label === category)?.children || [];
    const selected = sharedItems[category] || [];
    return children.length > 0 && children.every((c) => selected.includes(c));
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
      setFamilyMembers((prev) => [...prev, pendingMember]);
      setPendingMember(null);
    }
    setFormData({ email: "", phone: "", accessCode: "", name: "" });
    setRelationship("Spouse/Partner");
    setPermissions({
      type: "Custom Access",
      allowAdd: false,
      allowEdit: true,
      allowDelete: false,
      allowInvite: false,
      notify: true,
    });
    setSharedItems({});
    setSelectedMethod("Email");
    setStep("intro");
  };

  const handleAddGuideline = () => {
    if (newGuideline.trim()) {
      setFamilyGuidelines((prev) => [...prev, newGuideline.trim()]);
      setNewGuideline("");
      setStep("intro");
    } else {
      alert("Please enter a guideline.");
    }
  };

  const handleEditGuideline = () => {
    if (editGuidelineIndex !== null && newGuideline.trim()) {
      setFamilyGuidelines((prev) => {
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
      setFamilyNotes((prev) => [...prev, newNote.trim()]);
      setNewNote("");
      setStep("intro");
    } else {
      alert("Please enter a note.");
    }
  };

  const handleEditNote = () => {
    if (editNoteIndex !== null && newNote.trim()) {
      setFamilyNotes((prev) => {
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
    const formattedTime = `${timeRange[0].format(
      "h:mm"
    )} ${period} - ${timeRange[1].format("h:mm")} ${period}`;
    const eventTitle = `${title} - ${category} - ${formattedTime}`;

    setUpcomingEvents((prev) => [...prev, { title: eventTitle, color, date }]);
    setNewEvent({
      title: "",
      category: "School",
      date: null,
      timeRange: [],
      period: "AM",
    });
    setStep("intro");
  };

  const handleAddTask = () => {
    if (newTask.trim() && newTaskAssignee.trim()) {
      setTasks((prev) => [
        ...prev,
        {
          title: newTask.trim(),
          assignee: newTaskAssignee.trim(),
          completed: false,
        },
      ]);
      setNewTask("");
      setNewTaskAssignee("");
      setStep("intro");
    } else {
      alert("Please enter a task and assignee.");
    }
  };

  const handleEditTask = () => {
    if (editTaskIndex !== null && newTask.trim() && newTaskAssignee.trim()) {
      setTasks((prev) => {
        const updated = [...prev];
        updated[editTaskIndex] = {
          ...updated[editTaskIndex],
          title: newTask.trim(),
          assignee: newTaskAssignee.trim(),
        };
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
    setTasks((prev) => {
      const updated = [...prev];
      updated[index].completed = !updated[index].completed;
      return updated;
    });
  };

  const handleAddContact = () => {
    const { name, role, phone } = newContact;
    if (name.trim() && role.trim() && phone.trim()) {
      setContacts((prev) => [
        ...prev,
        { name: name.trim(), role: role.trim(), phone: phone.trim() },
      ]);
      setNewContact({ name: "", role: "", phone: "" });
      setStep("intro");
    } else {
      alert("Please fill in all contact details.");
    }
  };

  const handleEditContact = () => {
    if (
      editContactIndex !== null &&
      newContact.name.trim() &&
      newContact.role.trim() &&
      newContact.phone.trim()
    ) {
      setContacts((prev) => {
        const updated = [...prev];
        if (editContactIndex !== null) {
          updated[editContactIndex] = {
            ...updated[editContactIndex],
            ...newContact,
          };
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

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf("day");
  };

  const dateCellRender = (value: Dayjs) => {
    const events = upcomingEvents.filter((event) =>
      event.date.isSame(value, "day")
    );
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {events.map((event, index) => (
          <li key={index}>
            <Badge
              color={event.color}
              text={
                <span
                  style={{
                    fontSize: "10px",
                    color: event.color,
                    cursor: "pointer",
                  }}
                >
                  {event.title.split(" - ")[0].length > 10
                    ? `${event.title.split(" - ")[0].substring(0, 10)}...`
                    : event.title.split(" - ")[0]}
                </span>
              }
            />
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
    const events = upcomingEvents.filter((event) =>
      event.date.isSame(value, "day")
    );
    setSelectedDateEvents(events);
    setIsModalVisible(true);
  };

  const renderIntro = () => {
    if (familyMembers.length === 0) {
      return (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <a
              href="#"
              style={{
                color: "#0044ff",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              ← Back to Dashboard
            </a>
            <h2 style={{ margin: 0, textAlign: "center", flex: 1 }}>
              Family Sharing
            </h2>
            <Button type="primary" onClick={() => setStep("add")}>
              Add Family Member
            </Button>
          </div>
          <Card style={{ marginTop: "20px", textAlign: "center" }}>
            <h3>Your Family Members</h3>
            <div
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "rgba(0, 0, 0, 0.05)",
                borderRadius: "50%",
                margin: "20px auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "30px" }}>👨‍👩‍👧</span>
            </div>
            <p style={{ fontWeight: "bold" }}>No family members added yet</p>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Add family members to securely share important information like
              emergency contacts, important documents, and more.
            </p>
          </Card>
        </div>
      );
    }

    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <Title level={2}>Family Hub</Title>
          <Button type="primary" onClick={() => setStep("add")}>
            Add Family Member
          </Button>
        </div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <Button type="primary">Table</Button>
          <Button>Calendar</Button>
          <Button>Activity</Button>
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <div>
              <Title level={4} style={{ color: "#ff6347" }}>
                Family Members
              </Title>
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {familyMembers.map((member, index) => (
                  <Card
                    key={index}
                    style={{ textAlign: "center", width: "120px" }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor:
                          index % 2 === 0 ? "#1890ff" : "#ff4d4f",
                        color: "white",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 10px",
                      }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <Text style={{ fontWeight: "normal" }}>{member.name}</Text>
                    <br />
                    <Text style={{ fontSize: "12px", color: "#666" }}>
                      {member.relationship
                        .replace("❤", "")
                        .replace("👶", "")
                        .replace("👴", "")}
                    </Text>
                  </Card>
                ))}
              </div>
            </div>
          </Col>
          <Col xs={24}>
            <div>
              <Title level={4} style={{ color: "#ffa500" }}>
                Family Calendar
              </Title>
              <Card>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <Button icon={<LeftOutlined />} onClick={handlePrevMonth} />
                  <Text strong>{currentMonth.format("MMMM YYYY")}</Text>
                  <Button icon={<RightOutlined />} onClick={handleNextMonth} />
                </div>
                <Calendar
                  fullscreen={false}
                  value={currentMonth}
                  dateCellRender={dateCellRender}
                  onSelect={handleDateSelect}
                  style={{ padding: "10px" }}
                />
                <Text strong style={{ display: "block", margin: "10px 0" }}>
                  Upcoming Events
                </Text>
                <List
                  itemLayout="horizontal"
                  dataSource={upcomingEvents.filter((event) =>
                    event.date.isSame(currentMonth, "month")
                  )}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              backgroundColor: item.color,
                              borderRadius: "50%",
                            }}
                          />
                        }
                        title={
                          <Text style={{ fontSize: "14px", color: item.color }}>
                            {item.date.format("D")} {item.title}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={() => setStep("addEvent")}
                  style={{ marginTop: "10px", padding: "0" }}
                >
                  Add Event
                </Button>
              </Card>
            </div>
          </Col>
          <Col xs={24}>
            <div>
              <Title level={4} style={{ color: "#52c41a" }}>
                Shared Tasks
              </Title>
              <Card>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <Text strong>Weekly Chores</Text>
                  {tasks.slice(0, 7).map((task, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Checkbox
                          checked={task.completed}
                          onChange={() => handleToggleTask(index)}
                          style={{ marginRight: "10px" }}
                        />
                        <Text style={{ fontWeight: "normal" }}>
                          {task.title}
                        </Text>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Text style={{ marginRight: "10px" }}>
                          {task.assignee}
                        </Text>
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => {
                            setNewTask(task.title);
                            setNewTaskAssignee(task.assignee);
                            setEditTaskIndex(index);
                            setStep("editTask");
                          }}
                          style={{ padding: "0" }}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Text strong style={{ marginTop: "10px" }}>
                    School Responsibilities
                  </Text>
                  {tasks.slice(7).map((task, index) => (
                    <div
                      key={index + 7}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Checkbox
                          checked={task.completed}
                          onChange={() => handleToggleTask(index + 7)}
                          style={{ marginRight: "10px" }}
                        />
                        <Text style={{ fontWeight: "normal" }}>
                          {task.title}
                        </Text>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Text style={{ marginRight: "10px" }}>
                          {task.assignee}
                        </Text>
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => {
                            setNewTask(task.title);
                            setNewTaskAssignee(task.assignee);
                            setEditTaskIndex(index + 7);
                            setStep("editTask");
                          }}
                          style={{ padding: "0" }}
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
                  style={{ marginTop: "10px", padding: "0" }}
                >
                  Add Task
                </Button>
              </Card>
            </div>
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
                    avatar={
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          backgroundColor: item.color,
                          borderRadius: "50%",
                        }}
                      />
                    }
                    title={
                      <Text style={{ fontSize: "14px", color: item.color }}>
                        {item.title}
                      </Text>
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
    const handleContinue = () => {
      const { email, phone, accessCode, name } = formData;
      if (!relationship) return alert("Please select a relationship.");
      if (selectedMethod === "Email" && (!email || !name))
        return alert("Please enter a valid email and name.");
      if (selectedMethod === "Mobile" && (!phone || !name))
        return alert("Please enter a valid phone number and name.");
      if (selectedMethod === "Access Code" && (!accessCode || !name))
        return alert("Please enter a valid access code and name.");
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
      <div>
        <h2>Add a Family Member</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          {["Email", "Mobile", "Access Code"].map((method) => (
            <Button
              key={method}
              type={selectedMethod === method ? "primary" : "default"}
              onClick={() => setSelectedMethod(method)}
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
            style={{ margin: "10px 0" }}
          />
        )}
        {selectedMethod === "Mobile" && (
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Phone Number"
            style={{ margin: "10px 0" }}
          />
        )}
        {selectedMethod === "Access Code" && (
          <Input
            type="text"
            name="accessCode"
            value={formData.accessCode}
            onChange={handleInputChange}
            placeholder="Access Code"
            style={{ margin: "10px 0" }}
          />
        )}
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Display Name"
          style={{ margin: "10px 0" }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {["❤Spouse/Partner", "👶Child", "👴Parent", "Other"].map((rel) => (
            <Button
              key={rel}
              type={relationship === rel ? "primary" : "default"}
              onClick={() => setRelationship(rel)}
            >
              {rel}
            </Button>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
          }}
        >
          <Button onClick={() => setStep("intro")}>Cancel</Button>
          <Button
            type="primary"
            disabled={!isFormValid()}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  };

  const renderAddGuidelineForm = () => (
    <div>
      <h2>Add a Family Guideline</h2>
      <Input
        type="text"
        value={newGuideline}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setNewGuideline(e.target.value)
        }
        placeholder="Enter a guideline"
        style={{ margin: "10px 0" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "30px",
        }}
      >
        <Button onClick={() => setStep("intro")}>Cancel</Button>
        <Button
          type="primary"
          disabled={!newGuideline.trim()}
          onClick={handleAddGuideline}
        >
          Add Guideline
        </Button>
      </div>
    </div>
  );

  const renderEditGuidelineForm = () => (
    <div>
      <h2>Edit Family Guideline</h2>
      <Input
        type="text"
        value={newGuideline}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setNewGuideline(e.target.value)
        }
        placeholder="Enter a guideline"
        style={{ margin: "10px 0" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "30px",
        }}
      >
        <Button onClick={() => setStep("intro")}>Cancel</Button>
        <Button
          type="primary"
          disabled={!newGuideline.trim()}
          onClick={handleEditGuideline}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderAddNoteForm = () => (
    <div>
      <h2>Add a Family Note</h2>
      <Input
        type="text"
        value={newNote}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setNewNote(e.target.value)
        }
        placeholder="Enter your note"
        style={{ margin: "10px 0" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "30px",
        }}
      >
        <Button onClick={() => setStep("intro")}>Cancel</Button>
        <Button
          type="primary"
          disabled={!newNote.trim()}
          onClick={handleAddNote}
        >
          Add Note
        </Button>
      </div>
    </div>
  );

  const renderEditNoteForm = () => (
    <div>
      <h2>Edit Family Note</h2>
      <Input
        type="text"
        value={newNote}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setNewNote(e.target.value)
        }
        placeholder="Enter your note"
        style={{ margin: "10px 0" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "30px",
        }}
      >
        <Button onClick={() => setStep("intro")}>Cancel</Button>
        <Button
          type="primary"
          disabled={!newNote.trim()}
          onClick={handleEditNote}
        >
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
      <div>
        <h2>Add an Event</h2>
        <Input
          type="text"
          value={newEvent.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewEvent({ ...newEvent, title: e.target.value })
          }
          placeholder="Enter event title"
          style={{ margin: "10px 0" }}
        />
        <Select
          value={newEvent.category}
          onChange={(value: string) =>
            setNewEvent({ ...newEvent, category: value })
          }
          style={{ margin: "10px 0", width: "100%" }}
        >
          <Option value="School">School</Option>
          <Option value="Health">Health</Option>
          <Option value="Family">Family</Option>
        </Select>
        <DatePicker
          value={newEvent.date}
          onChange={(date: Dayjs | null) => setNewEvent({ ...newEvent, date })}
          style={{ margin: "10px 0", width: "100%" }}
          disabledDate={disabledDate}
        />
        <RangePicker
          value={newEvent.timeRange as any}
          onChange={(
            dates: [Dayjs | null, Dayjs | null] | null,
            dateStrings: [string, string]
          ) => {
            setNewEvent({
              ...newEvent,
              timeRange: dates ? (dates as Dayjs[]) : [],
            });
          }}
          format="h:mm A"
          use12Hours
          style={{ margin: "10px 0", width: "100%" }}
        />
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          {["AM", "PM"].map((period) => (
            <Button
              key={period}
              type={newEvent.period === period ? "primary" : "default"}
              onClick={() => setNewEvent({ ...newEvent, period })}
            >
              {period}
            </Button>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
          }}
        >
          <Button onClick={() => setStep("intro")}>Cancel</Button>
          <Button
            type="primary"
            disabled={!isEventFormValid()}
            onClick={handleAddEvent}
          >
            Add Event
          </Button>
        </div>
      </div>
    );
  };

  const renderAddTaskForm = () => {
    const isTaskFormValid = () => newTask.trim() && newTaskAssignee.trim();

    return (
      <div>
        <h2>Add a Task</h2>
        <Input
          type="text"
          value={newTask}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewTask(e.target.value)
          }
          placeholder="Enter task title"
          style={{ margin: "10px 0" }}
        />
        <Input
          type="text"
          value={newTaskAssignee}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewTaskAssignee(e.target.value)
          }
          placeholder="Enter assignee (e.g., JS)"
          style={{ margin: "10px 0" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
          }}
        >
          <Button onClick={() => setStep("intro")}>Cancel</Button>
          <Button
            type="primary"
            disabled={!isTaskFormValid()}
            onClick={handleAddTask}
          >
            Add Task
          </Button>
        </div>
      </div>
    );
  };

  const renderEditTaskForm = () => {
    const isTaskFormValid = () => newTask.trim() && newTaskAssignee.trim();

    return (
      <div>
        <h2>Edit Task</h2>
        <Input
          type="text"
          value={newTask}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewTask(e.target.value)
          }
          placeholder="Enter task title"
          style={{ margin: "10px 0" }}
        />
        <Input
          type="text"
          value={newTaskAssignee}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewTaskAssignee(e.target.value)
          }
          placeholder="Enter assignee (e.g., JS)"
          style={{ margin: "10px 0" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
          }}
        >
          <Button onClick={() => setStep("intro")}>Cancel</Button>
          <Button
            type="primary"
            disabled={!isTaskFormValid()}
            onClick={handleEditTask}
          >
            Save Changes
          </Button>
        </div>
      </div>
    );
  };

  const renderAddContactForm = () => {
    const isContactFormValid = () =>
      newContact.name.trim() &&
      newContact.role.trim() &&
      newContact.phone.trim();

    return (
      <div>
        <h2>Add an Emergency Contact</h2>
        <Input
          type="text"
          value={newContact.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewContact({ ...newContact, name: e.target.value })
          }
          placeholder="Enter name"
          style={{ margin: "10px 0" }}
        />
        <Input
          type="text"
          value={newContact.role}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewContact({ ...newContact, role: e.target.value })
          }
          placeholder="Enter role"
          style={{ margin: "10px 0" }}
        />
        <Input
          type="text"
          value={newContact.phone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewContact({ ...newContact, phone: e.target.value })
          }
          placeholder="Enter phone number"
          style={{ margin: "10px 0" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
          }}
        >
          <Button onClick={() => setStep("intro")}>Cancel</Button>
          <Button
            type="primary"
            disabled={!isContactFormValid()}
            onClick={handleAddContact}
          >
            Add Contact
          </Button>
        </div>
      </div>
    );
  };

  const renderEditContactForm = () => {
    const isContactFormValid = () =>
      newContact.name.trim() &&
      newContact.role.trim() &&
      newContact.phone.trim();

    return (
      <div>
        <h2>Edit Emergency Contact</h2>
        <Input
          type="text"
          value={newContact.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewContact({ ...newContact, name: e.target.value })
          }
          placeholder="Enter name"
          style={{ margin: "10px 0" }}
        />
        <Input
          type="text"
          value={newContact.role}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewContact({ ...newContact, role: e.target.value })
          }
          placeholder="Enter role"
          style={{ margin: "10px 0" }}
        />
        <Input
          type="text"
          value={newContact.phone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewContact({ ...newContact, phone: e.target.value })
          }
          placeholder="Enter phone number"
          style={{ margin: "10px 0" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
          }}
        >
          <Button onClick={() => setStep("intro")}>Cancel</Button>
          <Button
            type="primary"
            disabled={!isContactFormValid()}
            onClick={handleEditContact}
          >
            Save Changes
          </Button>
        </div>
      </div>
    );
  };

  const renderPermissions = () => (
    <div>
      <h3>Set Permissions for: {formData.name}</h3>
      <div style={{ display: "flex", gap: "10px" }}>
        {["Full Access", "Custom Access"].map((type) => (
          <Button
            key={type}
            type={permissions.type === type ? "primary" : "default"}
            onClick={() => setPermissions({ ...permissions, type })}
          >
            {type}
          </Button>
        ))}
      </div>
      {permissions.type === "Custom Access" && (
        <div style={{ marginTop: "20px" }}>
          {[
            "allowAdd",
            "allowEdit",
            "allowDelete",
            "allowInvite",
            "notify",
          ].map((key) => (
            <div key={key} style={{ marginBottom: "8px" }}>
              <Checkbox
                checked={Boolean(permissions[key as keyof PermissionState])}
                onChange={() =>
                  handlePermissionChange(key as keyof PermissionState)
                }
              >
                {key.replace("allow", "Allow ").replace(/([A-Z])/g, " $1")}
              </Checkbox>
            </div>
          ))}
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "30px",
        }}
      >
        <Button onClick={() => setStep("add")}>Back</Button>
        <Button type="primary" onClick={() => setStep("share")}>
          Continue
        </Button>
      </div>
    </div>
  );

  const renderSharingOptions = () => {
    const hasSelectedItems = Object.values(sharedItems).some(
      (items) => items.length > 0
    );
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
                {children.map((child) => (
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
        {!hasSelectedItems && (
          <p style={{ color: "red" }}>
            Please select at least one item to share before continuing.
          </p>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
          }}
        >
          <Button onClick={() => setStep("permissions")}>Back</Button>
          <Button
            type="primary"
            disabled={!hasSelectedItems}
            onClick={() => setStep("review")}
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
      <p>
        <strong>To:</strong>{" "}
        {selectedMethod === "Email" ? formData.email : formData.phone}
      </p>
      <p>
        <strong>Name:</strong> {formData.name}
      </p>
      <p>
        <strong>Relationship:</strong> {relationship}
      </p>
      <p>
        <strong>Access:</strong> {permissions.type}
      </p>
      <ul>
        {Object.entries(sharedItems).flatMap(([category, items]) =>
          items.map((item) => <li key={category + item}>{item}</li>)
        )}
      </ul>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <Button onClick={() => setStep("share")}>Back</Button>
        <Button type="primary" onClick={handleAddMember}>
          Send Invitation
        </Button>
      </div>
    </div>
  );

  const renderSent = () => (
    <div style={{ textAlign: "center" }}>
      <h3>Invitation Sent!</h3>
      <p>
        An invitation has been sent to{" "}
        {pendingMember?.name || "the family member"}.
      </p>
      <Button type="primary" onClick={handleDone} style={{ marginTop: "20px" }}>
        Done
      </Button>
    </div>
  );

  return (
    <div style={{ padding: "30px", margin: "80px 10px 10px 60px" }}>
      <Card style={{ maxWidth: "920px", margin: "0 auto" }}>
        {step === "intro" && renderIntro()}
        {step === "add" && renderAddForm()}
        {step === "addGuideline" && renderAddGuidelineForm()}
        {step === "editGuideline" && renderEditGuidelineForm()}
        {step === "addNote" && renderAddNoteForm()}
        {step === "editNote" && renderEditNoteForm()}
        {step === "addEvent" && renderAddEventForm()}
        {step === "addTask" && renderAddTaskForm()}
        {step === "editTask" && renderEditTaskForm()}
        {step === "addContact" && renderAddContactForm()}
        {step === "editContact" && renderEditContactForm()}
        {step === "permissions" && renderPermissions()}
        {step === "share" && renderSharingOptions()}
        {step === "review" && renderReview()}
        {step === "sent" && renderSent()}
      </Card>
    </div>
  );
};

export default FamilySharing;
