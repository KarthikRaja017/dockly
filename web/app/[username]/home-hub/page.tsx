// HomeManagement.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Layout,
  Button,
  Row,
  Col,
  Card,
  Table,
  List,
  Space,
  Typography,
  Modal,
  Form,
  Input as AntInput,
  Checkbox,
  message,
  Calendar,
  Upload,
  Avatar,
  Badge,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";

// Assuming MainLayout is a TypeScript component
import MainLayout from "../../../pages/components/mainLayout";

const { Content } = Layout;
const { Title, Text } = Typography;

// Define consistent colors
const PRIMARY_COLOR = "#1890ff";
const SHADOW_COLOR = "rgba(0, 0, 0, 0.1)";

// Interfaces with TypeScript
interface Document {
  name: string;
  type: string;
  color: string;
  file?: File;
}

interface MaintenanceTask {
  name: string;
  date: string;
  completed: boolean;
}

interface CustomSectionData {
  key: string;
  value: string;
}

interface Section {
  title: string;
  type: string;
  data: CustomSectionData[];
}

interface Utility {
  name: string;
  meta: string;
  color: string;
}

interface Mortgage {
  name: string;
  meta: string;
  color: string;
}

interface Insurance {
  name: string;
  meta: string;
  color: string;
}

interface Note {
  content: string;
  date: string;
}

const HomeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("Board");
  const [documentsData, setDocumentsData] = useState<Document[]>([
    { name: "Property Deed.pdf", type: "PDF", color: PRIMARY_COLOR },
    { name: "Insurance Policy.pdf", type: "PDF", color: PRIMARY_COLOR },
    { name: "Mortgage Agreement.pdf", type: "PDF", color: PRIMARY_COLOR },
  ]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [customSections, setCustomSections] = useState<Section[]>([]);
  const [propertyData, setPropertyData] = useState<CustomSectionData[]>([
    { key: "Address", value: "123 Main Street, Springfield, IL 62701" },
    { key: "Purchase Date", value: "June 15, 2020" },
    { key: "Purchase Price", value: "$285,000" },
    { key: "Square Footage", value: "2,150 sq ft" },
    { key: "Lot Size", value: "0.25 acres" },
    { key: "Property Tax ID", value: "SN-37849221" },
  ]);
  const [mortgageData, setMortgageData] = useState<Mortgage[]>([
    { name: "Chase Mortgage", meta: "Primary Mortgage • $1,450/month", color: PRIMARY_COLOR },
    { name: "Santander HELOC", meta: "Home Equity Line • $220/month", color: PRIMARY_COLOR },
  ]);
  const [mortgageDetails, setMortgageDetails] = useState<CustomSectionData[]>([
    { key: "Primary Mortgage", value: "30-year fixed at 4.25%, $245,000 remaining balance" },
    { key: "HELOC", value: "$50,000 line, $32,500 drawn, variable rate 6.5%" },
    { key: "Refinance Notes", value: "Last refinanced June 2022, Loan Officer: Michael Johnson" },
  ]);
  const [utilitiesData, setUtilitiesData] = useState<Utility[]>([
    { name: "City Water", meta: "Account #WTR-849302 • $65/month", color: PRIMARY_COLOR },
    { name: "Electric Co.", meta: "Account #ELC-392847 • $120/month", color: PRIMARY_COLOR },
    { name: "Gas Services", meta: "Account #GAS-573920 • $45/month", color: PRIMARY_COLOR },
    { name: "Waste Mgmt", meta: "Account #WST-194857 • $30/month", color: PRIMARY_COLOR },
  ]);
  const [insuranceData, setInsuranceData] = useState<Insurance[]>([
    { name: "State Farm Insurance", meta: "Policy #HO-58392 • $1,250/year", color: PRIMARY_COLOR },
  ]);
  const [insuranceDetails, setInsuranceDetails] = useState<CustomSectionData[]>([
    { key: "Dwelling", value: "$350,000" },
    { key: "Personal Property", value: "$175,000" },
    { key: "Liability", value: "$300,000" },
    { key: "Deductible", value: "$1,000" },
  ]);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceTask[]>([
    { name: "Replace HVAC filters", date: "Apr 10, 2025", completed: true },
    { name: "Schedule annual A/C maintenance", date: "May 1, 2025", completed: false },
    { name: "Clean gutters", date: "May 15, 2025", completed: false },
    { name: "Lawn fertilization treatment", date: "May 20, 2025", completed: false },
    { name: "Check smoke detectors", date: "Jun 1, 2025", completed: false },
  ]);
  const [notesData, setNotesData] = useState<Note[]>([
    {
      content: "Need to call contractor about basement finishing quote next week.",
      date: "Apr 16, 2023",
    },
  ]);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState<boolean>(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isCustomSectionModalOpen, setIsCustomSectionModalOpen] = useState<boolean>(false);
  const [editSection, setEditSection] = useState<string>("");
  const [editSectionData, setEditSectionData] = useState<any[]>([]);
  const [maintenanceForm] = Form.useForm();
  const [noteForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [customSectionForm] = Form.useForm();

  const router = useRouter();
  
  useEffect(() => {
    const username = localStorage.getItem("username") || "";
    if (localStorage.getItem('home') === null) {
      router.push(`/${username}/home/setup`);
    }
  }, []);

  // Click Handlers for Tabs
  const handleTabClick = (tab: string): void => {
    setActiveTab(tab);
  };

  // Modal Handlers for Documents
  const showModal = (): void => setIsModalOpen(true);
  const handleOk = (): void => {
    form.validateFields().then((values) => {
      if (!values.file || !values.file.file) {
        message.error("Please upload a document!");
        return;
      }
      const file = values.file.file as File;
      if (!file.name.endsWith(".pdf")) {
        message.error("Only PDF files are allowed!");
        return;
      }
      const newDocument: Document = {
        name: file.name,
        type: "PDF",
        color: PRIMARY_COLOR,
        file,
      };
      setDocumentsData([...documentsData, newDocument]);
      form.resetFields();
      setIsModalOpen(false);
      message.success("Document uploaded successfully!");
    });
  };
  const handleCancel = (): void => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // Handler to open document
  const handleOpenDocument = (doc: Document): void => {
    if (!doc.file) {
      message.error("No file available to open for this document.");
      return;
    }
    const fileURL = URL.createObjectURL(doc.file);
    window.open(fileURL, "_blank");
    setTimeout(() => URL.revokeObjectURL(fileURL), 60000);
  };

  // Modal Handlers for Maintenance
  const showMaintenanceModal = (): void => setIsMaintenanceModalOpen(true);
  const handleMaintenanceOk = (): void => {
    maintenanceForm.validateFields().then((values) => {
      const newTask: MaintenanceTask = {
        name: values.name,
        date: values.date,
        completed: false,
      };
      setMaintenanceData([...maintenanceData, newTask]);
      maintenanceForm.resetFields();
      setIsMaintenanceModalOpen(false);
      message.success("Task added successfully!");
    });
  };
  const handleMaintenanceCancel = (): void => {
    setIsMaintenanceModalOpen(false);
    maintenanceForm.resetFields();
  };

  // Modal Handlers for Notes
  const showNoteModal = (): void => setIsNoteModalOpen(true);
  const handleNoteOk = (): void => {
    noteForm.validateFields().then((values) => {
      const newNote: Note = {
        content: values.content,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      setNotesData([...notesData, newNote]);
      noteForm.resetFields();
      setIsNoteModalOpen(false);
      message.success("Note added successfully!");
    });
  };
  const handleNoteCancel = (): void => {
    setIsNoteModalOpen(false);
    noteForm.resetFields();
  };

  // Modal Handlers for Custom Sections
  const showCustomSectionModal = (): void => setIsCustomSectionModalOpen(true);
  const handleCustomSectionOk = (): void => {
    customSectionForm.validateFields().then((values) => {
      const newData: CustomSectionData[] = [];
      for (let i = 0; i < 10; i++) {
        const key = values[`key${i}`];
        const value = values[`value${i}`];
        if (key && value) {
          newData.push({ key, value });
        }
      }
      const newSection: Section = {
        title: values.title,
        type: "custom",
        data: newData,
      };
      setCustomSections([...customSections, newSection]);
      customSectionForm.resetFields();
      setIsCustomSectionModalOpen(false);
      message.success("New section added successfully!");
    });
  };
  const handleCustomSectionCancel = (): void => {
    setIsCustomSectionModalOpen(false);
    customSectionForm.resetFields();
  };

  // Edit Handlers
  const handleEdit = (section: string, data: any[]): void => {
    setEditSection(section);
    setEditSectionData(data);
    if (section === "Property Information") {
      editForm.setFieldsValue({
        address: propertyData[0]?.value,
        purchaseDate: propertyData[1]?.value,
        purchasePrice: propertyData[2]?.value,
        squareFootage: propertyData[3]?.value,
        lotSize: propertyData[4]?.value,
        propertyTaxId: propertyData[5]?.value,
      });
    } else if (section === "Mortgage & Loans") {
      editForm.setFieldsValue({
        mortgage1Name: mortgageData[0]?.name,
        mortgage1Meta: mortgageData[0]?.meta,
        mortgage2Name: mortgageData[1]?.name,
        mortgage2Meta: mortgageData[1]?.meta,
        primaryMortgage: mortgageDetails[0]?.value,
        heloc: mortgageDetails[1]?.value,
        refinanceNotes: mortgageDetails[2]?.value,
      });
    } else if (section === "Utilities") {
      editForm.setFieldsValue({
        utility1Name: utilitiesData[0]?.name,
        utility1Meta: utilitiesData[0]?.meta,
        utility2Name: utilitiesData[1]?.name,
        utility2Meta: utilitiesData[1]?.meta,
        utility3Name: utilitiesData[2]?.name,
        utility3Meta: utilitiesData[2]?.meta,
        utility4Name: utilitiesData[3]?.name,
        utility4Meta: utilitiesData[3]?.meta,
      });
    } else if (section === "Insurance") {
      editForm.setFieldsValue({
        insuranceName: insuranceData[0]?.name,
        insuranceMeta: insuranceData[0]?.meta,
        dwelling: insuranceDetails[0]?.value,
        personalProperty: insuranceDetails[1]?.value,
        liability: insuranceDetails[2]?.value,
        deductible: insuranceDetails[3]?.value,
      });
    } else if (section === "Home Maintenance") {
      editForm.setFieldsValue({
        task1Name: maintenanceData[0]?.name,
        task1Date: maintenanceData[0]?.date,
        task2Name: maintenanceData[1]?.name,
        task2Date: maintenanceData[1]?.date,
        task3Name: maintenanceData[2]?.name,
        task3Date: maintenanceData[2]?.date,
        task4Name: maintenanceData[3]?.name,
        task4Date: maintenanceData[3]?.date,
        task5Name: maintenanceData[4]?.name,
        task5Date: maintenanceData[4]?.date,
      });
    } else {
      const customData: { [key: string]: string } = {};
      data.forEach((item: CustomSectionData, index: number) => {
        customData[`key${index}`] = item.key;
        customData[`value${index}`] = item.value;
      });
      customData["title"] = section;
      editForm.setFieldsValue(customData);
    }
    setIsEditModalOpen(true);
  };

  const handleEditOk = (): void => {
    editForm.validateFields().then((values) => {
      if (editSection === "Property Information") {
        setPropertyData([
          { key: "Address", value: values.address },
          { key: "Purchase Date", value: values.purchaseDate },
          { key: "Purchase Price", value: values.purchasePrice },
          { key: "Square Footage", value: values.squareFootage },
          { key: "Lot Size", value: values.lotSize },
          { key: "Property Tax ID", value: values.propertyTaxId },
        ]);
      } else if (editSection === "Mortgage & Loans") {
        setMortgageData([
          { name: values.mortgage1Name, meta: values.mortgage1Meta, color: PRIMARY_COLOR },
          { name: values.mortgage2Name, meta: values.mortgage2Meta, color: PRIMARY_COLOR },
        ]);
        setMortgageDetails([
          { key: "Primary Mortgage", value: values.primaryMortgage },
          { key: "HELOC", value: values.heloc },
          { key: "Refinance Notes", value: values.refinanceNotes },
        ]);
      } else if (editSection === "Utilities") {
        setUtilitiesData([
          { name: values.utility1Name, meta: values.utility1Meta, color: PRIMARY_COLOR },
          { name: values.utility2Name, meta: values.utility2Meta, color: PRIMARY_COLOR },
          { name: values.utility3Name, meta: values.utility3Meta, color: PRIMARY_COLOR },
          { name: values.utility4Name, meta: values.utility4Meta, color: PRIMARY_COLOR },
        ]);
      } else if (editSection === "Insurance") {
        setInsuranceData([
          { name: values.insuranceName, meta: values.insuranceMeta, color: PRIMARY_COLOR },
        ]);
        setInsuranceDetails([
          { key: "Dwelling", value: values.dwelling },
          { key: "Personal Property", value: values.personalProperty },
          { key: "Liability", value: values.liability },
          { key: "Deductible", value: values.deductible },
        ]);
      } else if (editSection === "Home Maintenance") {
        setMaintenanceData([
          { name: values.task1Name, date: values.task1Date, completed: maintenanceData[0]?.completed || false },
          { name: values.task2Name, date: values.task2Date, completed: maintenanceData[1]?.completed || false },
          { name: values.task3Name, date: values.task3Date, completed: maintenanceData[2]?.completed || false },
          { name: values.task4Name, date: values.task4Date, completed: maintenanceData[3]?.completed || false },
          { name: values.task5Name, date: values.task5Date, completed: maintenanceData[4]?.completed || false },
        ]);
      } else {
        const newData: CustomSectionData[] = [];
        for (let i = 0; i < 10; i++) {
          const key = values[`key${i}`];
          const value = values[`value${i}`];
          if (key && value) {
            newData.push({ key, value });
          }
        }
        setCustomSections(
          customSections.map(section =>
            section.title === editSection
              ? { ...section, title: values.title, data: newData }
              : section
          )
        );
      }
      setIsEditModalOpen(false);
      editForm.resetFields();
      message.success(`${editSection} section updated successfully!`);
    });
  };

  const handleEditCancel = (): void => {
    setIsEditModalOpen(false);
    editForm.resetFields();
  };

  // Delete Handlers
  const handleDelete = (section: string): void => {
    Modal.confirm({
      title: `Are you sure you want to delete the ${section} section?`,
      onOk: () => {
        if (section === "Property Information") {
          setPropertyData([]);
        } else if (section === "Mortgage & Loans") {
          setMortgageData([]);
          setMortgageDetails([]);
        } else if (section === "Utilities") {
          setUtilitiesData([]);
        } else if (section === "Insurance") {
          setInsuranceData([]);
          setInsuranceDetails([]);
        } else if (section === "Home Maintenance") {
          setMaintenanceData([]);
        } else if (section === "Important Documents") {
          setDocumentsData([]);
        } else if (section === "Notes") {
          setNotesData([]);
        } else {
          setCustomSections(customSections.filter(s => s.title !== section));
        }
        message.success(`${section} section deleted successfully!`);
      },
    });
  };

  const handleCheckboxChange = (index: number): void => {
    const updatedData = [...maintenanceData];
    updatedData[index].completed = !updatedData[index].completed;
    setMaintenanceData(updatedData);
  };

  // Render Edit Form based on section
  const renderEditForm = () => {
    if (editSection === "Property Information") {
      return (
        <>
          <Form.Item name="address" label="Address" rules={[{ required: true, message: "Please enter address!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter address" />
          </Form.Item>
          <Form.Item name="purchaseDate" label="Purchase Date" rules={[{ required: true, message: "Please enter purchase date!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter purchase date" />
          </Form.Item>
          <Form.Item name="purchasePrice" label="Purchase Price" rules={[{ required: true, message: "Please enter purchase price!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter purchase price" />
          </Form.Item>
          <Form.Item name="squareFootage" label="Square Footage" rules={[{ required: true, message: "Please enter square footage!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter square footage" />
          </Form.Item>
          <Form.Item name="lotSize" label="Lot Size" rules={[{ required: true, message: "Please enter lot size!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter lot size" />
          </Form.Item>
          <Form.Item name="propertyTaxId" label="Property Tax ID" rules={[{ required: true, message: "Please enter property tax ID!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter property tax ID" />
          </Form.Item>
        </>
      );
    } else if (editSection === "Mortgage & Loans") {
      return (
        <>
          <Form.Item name="mortgage1Name" label="Mortgage 1 Name" rules={[{ required: true, message: "Please enter mortgage name!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter mortgage name" />
          </Form.Item>
          <Form.Item name="mortgage1Meta" label="Mortgage 1 Meta" rules={[{ required: true, message: "Please enter mortgage meta!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter mortgage meta" />
          </Form.Item>
          <Form.Item name="mortgage2Name" label="Mortgage 2 Name" rules={[{ required: true, message: "Please enter mortgage name!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter mortgage name" />
          </Form.Item>
          <Form.Item name="mortgage2Meta" label="Mortgage 2 Meta" rules={[{ required: true, message: "Please enter mortgage meta!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter mortgage meta" />
          </Form.Item>
          <Form.Item name="primaryMortgage" label="Primary Mortgage Details" rules={[{ required: true, message: "Please enter details!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter primary mortgage details" />
          </Form.Item>
          <Form.Item name="heloc" label="HELOC Details" rules={[{ required: true, message: "Please enter HELOC details!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter HELOC details" />
          </Form.Item>
          <Form.Item name="refinanceNotes" label="Refinance Notes" rules={[{ required: true, message: "Please enter refinance notes!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter refinance notes" />
          </Form.Item>
        </>
      );
    } else if (editSection === "Utilities") {
      return (
        <>
          <Form.Item name="utility1Name" label="Utility 1 Name" rules={[{ required: true, message: "Please enter utility name!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter utility name" />
          </Form.Item>
          <Form.Item name="utility1Meta" label="Utility 1 Meta" rules={[{ required: true, message: "Please enter utility meta!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter utility meta" />
          </Form.Item>
          <Form.Item name="utility2Name" label="Utility 2 Name" rules={[{ required: true, message: "Please enter utility name!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter utility name" />
          </Form.Item>
          <Form.Item name="utility2Meta" label="Utility 2 Meta" rules={[{ required: true, message: "Please enter utility meta!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter utility meta" />
          </Form.Item>
          <Form.Item name="utility3Name" label="Utility 3 Name" rules={[{ required: true, message: "Please enter utility name!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter utility name" />
          </Form.Item>
          <Form.Item name="utility3Meta" label="Utility 3 Meta" rules={[{ required: true, message: "Please enter utility meta!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter utility meta" />
          </Form.Item>
          <Form.Item name="utility4Name" label="Utility 4 Name" rules={[{ required: true, message: "Please enter utility name!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter utility name" />
          </Form.Item>
          <Form.Item name="utility4Meta" label="Utility 4 Meta" rules={[{ required: true, message: "Please enter utility meta!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter utility meta" />
          </Form.Item>
        </>
      );
    } else if (editSection === "Insurance") {
      return (
        <>
          <Form.Item name="insuranceName" label="Insurance Name" rules={[{ required: true, message: "Please enter insurance name!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter insurance name" />
          </Form.Item>
          <Form.Item name="insuranceMeta" label="Insurance Meta" rules={[{ required: true, message: "Please enter insurance meta!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter insurance meta" />
          </Form.Item>
          <Form.Item name="dwelling" label="Dwelling" rules={[{ required: true, message: "Please enter dwelling value!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter dwelling value" />
          </Form.Item>
          <Form.Item name="personalProperty" label="Personal Property" rules={[{ required: true, message: "Please enter personal property value!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter personal property value" />
          </Form.Item>
          <Form.Item name="liability" label="Liability" rules={[{ required: true, message: "Please enter liability value!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter liability value" />
          </Form.Item>
          <Form.Item name="deductible" label="Deductible" rules={[{ required: true, message: "Please enter deductible value!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter deductible value" />
          </Form.Item>
        </>
      );
    } else if (editSection === "Home Maintenance") {
      return (
        <>
          <Form.Item name="task1Name" label="Task 1 Name" rules={[{ required: true, message: "Please enter task name!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter task name" />
          </Form.Item>
          <Form.Item name="task1Date" label="Task 1 Date" rules={[{ required: true, message: "Please enter task date!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter task date" />
          </Form.Item>
          <Form.Item name="task2Name" label="Task 2 Name" rules={[{ required: true, message: "Please enter task name!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter task name" />
          </Form.Item>
          <Form.Item name="task2Date" label="Task 2 Date" rules={[{ required: true, message: "Please enter task date!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter task date" />
          </Form.Item>
          <Form.Item name="task3Name" label="Task 3 Name" rules={[{ required: true, message: "Please enter task name!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter task name" />
          </Form.Item>
          <Form.Item name="task3Date" label="Task 3 Date" rules={[{ required: true, message: "Please enter task date!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter task date" />
          </Form.Item>
          <Form.Item name="task4Name" label="Task 4 Name" rules={[{ required: true, message: "Please enter task name!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter task name" />
          </Form.Item>
          <Form.Item name="task4Date" label="Task 4 Date" rules={[{ required: true, message: "Please enter task date!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter task date" />
          </Form.Item>
          <Form.Item name="task5Name" label="Task 5 Name" rules={[{ required: true, message: "Please enter task name!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter task name" />
          </Form.Item>
          <Form.Item name="task5Date" label="Task 5 Date" rules={[{ required: true, message: "Please enter task date!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter task date" />
          </Form.Item>
        </>
      );
    } else {
      return (
        <>
          <Form.Item name="title" label="Section Title" rules={[{ required: true, message: "Please enter section title!" }]}>
            <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter section title" />
          </Form.Item>
          {Array.from({ length: 10 }).map((_, index) => (
            <Row key={index} style={{ marginBottom: "16px" }}>
              <Col span={12} style={{ paddingRight: "8px" }}>
                <Form.Item name={`key${index}`} label={`Key ${index + 1}`}>
                  <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter key" />
                </Form.Item>
              </Col>
              <Col span={12} style={{ paddingLeft: "8px" }}>
                <Form.Item name={`value${index}`} label={`Value ${index + 1}`}>
                  <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter value" />
                </Form.Item>
              </Col>
            </Row>
          ))}
        </>
      );
    }
  };

  // Render Views
  const renderBoardView = () => (
    <Row style={{ margin: "0 -12px" }}>
      <Col span={12} style={{ padding: "0 12px" }}>
        <Card
          title={
            <span>
              <span style={{ marginRight: "8px" }}>🏠</span> Property Information
            </span>
          }
          extra={
            <Space>
              <Button
                type="default"
                onClick={() => handleEdit("Property Information", propertyData)}
                style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
              >
                <EditOutlined />
              </Button>
              <Button
                type="default"
                onClick={() => handleDelete("Property Information")}
                style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
              >
                <DeleteOutlined />
              </Button>
            </Space>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
            border: "1px solid #d9d9d9",
          }}
        >
          <Table
            columns={[
              { title: "Property", dataIndex: "key", key: "key" },
              { title: "Value", dataIndex: "value", key: "value" },
            ]}
            dataSource={propertyData}
            pagination={false}
            size="small"
            style={{ border: "1px solid #d9d9d9", borderRadius: "4px" }}
          />
        </Card>
        <Card
          title={
            <span>
              <span style={{ marginRight: "8px" }}>🏦</span> Mortgage & Loans
            </span>
          }
          extra={
            <Space>
              <Button
                type="default"
                onClick={() => handleEdit("Mortgage & Loans", mortgageDetails)}
                style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
              >
                <EditOutlined />
              </Button>
              <Button
                type="default"
                onClick={() => handleDelete("Mortgage & Loans")}
                style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
              >
                <DeleteOutlined />
              </Button>
            </Space>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
            border: "1px solid #d9d9d9",
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={mortgageData}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    size="small"
                    style={{
                      color: PRIMARY_COLOR,
                      borderColor: PRIMARY_COLOR,
                      backgroundColor: "transparent",
                      borderRadius: "4px",
                      padding: "0 8px",
                    }}
                  >
                    Log In
                  </Button>,
                ]}
                style={{ borderBottom: "1px solid #f0f0f0", padding: "8px 0" }}
              >
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: item.color, borderRadius: "50%" }}>{item.name[0]}</Avatar>}
                  title={<Text style={{ fontWeight: "bold" }}>{item.name}</Text>}
                  description={item.meta}
                />
              </List.Item>
            )}
            style={{ marginBottom: "16px" }}
          />
          <Table
            columns={[
              { title: "Loan Details", dataIndex: "key", key: "key" },
              { title: "Value", dataIndex: "value", key: "value" },
            ]}
            dataSource={mortgageDetails}
            pagination={false}
            size="small"
            style={{ border: "1px solid #d9d9d9", borderRadius: "4px" }}
          />
        </Card>
        <Card
          title={
            <span>
              <span style={{ marginRight: "8px" }}>🔌</span> Utilities
            </span>
          }
          extra={
            <Space>
              <Button
                type="default"
                onClick={() => handleEdit("Utilities", utilitiesData)}
                style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
              >
                <EditOutlined />
              </Button>
              <Button
                type="default"
                onClick={() => handleDelete("Utilities")}
                style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
              >
                <DeleteOutlined />
              </Button>
            </Space>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
            border: "1px solid #d9d9d9",
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={utilitiesData}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    size="small"
                    style={{
                      color: PRIMARY_COLOR,
                      borderColor: PRIMARY_COLOR,
                      backgroundColor: "transparent",
                      borderRadius: "4px",
                      padding: "0 8px",
                    }}
                  >
                    Log In
                  </Button>,
                ]}
                style={{ borderBottom: "1px solid #f0f0f0", padding: "8px 0" }}
              >
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: item.color, borderRadius: "50%" }}>{item.name[0]}</Avatar>}
                  title={<Text style={{ fontWeight: "bold" }}>{item.name}</Text>}
                  description={item.meta}
                />
              </List.Item>
            )}
          />
        </Card>
        <Card
          title={
            <Space style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
              <span>
                <span style={{ marginRight: "8px" }}>📄</span> Important Documents
              </span>
              <Space>
                <Button
                  type="default"
                  onClick={showModal}
                  style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
                >
                  Upload Document
                </Button>
                <Button
                  type="default"
                  onClick={() => handleDelete("Important Documents")}
                  style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
                >
                  <DeleteOutlined />
                </Button>
              </Space>
            </Space>
          }
          style={{
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
            border: "1px solid #d9d9d9",
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={documentsData}
            renderItem={(item) => (
              <List.Item style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: item.color, borderRadius: "50%" }}>{item.type[0]}</Avatar>}
                  title={
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: PRIMARY_COLOR,
                        cursor: item.file ? "pointer" : "default",
                        textDecoration: item.file ? "underline" : "none",
                      }}
                      onClick={() => item.file && handleOpenDocument(item)}
                    >
                      {item.name}
                    </Text>
                  }
                  description={item.type}
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
      <Col span={12} style={{ padding: "0 12px" }}>
        <Card
          title={
            <Space style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
              <span>
                <span style={{ marginRight: "8px" }}>🔧</span> Home Maintenance
              </span>
              <Space>
                <Button
                  type="default"
                  onClick={showMaintenanceModal}
                  style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
                >
                  Add Task
                </Button>
                <Button
                  type="default"
                  onClick={() => handleDelete("Home Maintenance")}
                  style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
                >
                  <DeleteOutlined />
                </Button>
              </Space>
            </Space>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
            border: "1px solid #d9d9d9",
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={maintenanceData}
            renderItem={(item, index) => (
              <List.Item style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                <List.Item.Meta
                  avatar={<Checkbox checked={item.completed} onChange={() => handleCheckboxChange(index)} />}
                  title={
                    <Text style={{ color: item.completed ? "#8c8c8c" : "#000" }}>
                      {item.name}
                    </Text>
                  }
                  description={
                    <Text style={{ color: item.completed ? "#8c8c8c" : "#000" }}>
                      {item.date}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
        <Card
          title={
            <span>
              <span style={{ marginRight: "8px" }}>🛡️</span> Insurance
            </span>
          }
          extra={
            <Space>
              <Button
                type="default"
                onClick={() => handleEdit("Insurance", insuranceDetails)}
                style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
              >
                <EditOutlined />
              </Button>
              <Button
                type="default"
                onClick={() => handleDelete("Insurance")}
                style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
              >
                <DeleteOutlined />
              </Button>
            </Space>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
            border: "1px solid #d9d9d9",
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={insuranceData}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    size="small"
                    style={{
                      color: PRIMARY_COLOR,
                      borderColor: PRIMARY_COLOR,
                      backgroundColor: "transparent",
                      borderRadius: "4px",
                      padding: "0 8px",
                    }}
                  >
                    Log In
                  </Button>,
                ]}
                style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}
              >
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: item.color, borderRadius: "50%" }}>{item.name[0]}</Avatar>}
                  title={<Text style={{ fontWeight: "bold" }}>{item.name}</Text>}
                  description={item.meta}
                />
              </List.Item>
            )}
            style={{ marginBottom: "16px" }}
          />
          <Table
            columns={[
              { title: "Property", dataIndex: "key", key: "key" },
              { title: "Value", dataIndex: "value", key: "value" },
            ]}
            dataSource={insuranceDetails}
            pagination={false}
            size="small"
            style={{ border: "1px solid #d9d9d9", borderRadius: "4px" }}
          />
        </Card>
        <Card
          title={
            <Space style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
              <span>
                <span style={{ marginRight: "8px" }}>📝</span> Notes
              </span>
              <Space>
                <Button
                  type="default"
                  onClick={showNoteModal}
                  style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
                >
                  Add Note
                </Button>
                <Button
                  type="default"
                  onClick={() => handleDelete("Notes")}
                  style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
                >
                  <DeleteOutlined />
                </Button>
              </Space>
            </Space>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
            border: "1px solid #d9d9d9",
          }}
        >
          <List
            itemLayout="vertical"
            dataSource={notesData}
            renderItem={(item) => (
              <List.Item
                style={{
                  backgroundColor: "#fffbe6",
                  borderRadius: "4px",
                  marginBottom: "8px",
                  padding: "8px",
                }}
              >
                <List.Item.Meta
                  title={<Text>{item.content}</Text>}
                  description={<Text style={{ color: "#8c8c8c" }}>{item.date}</Text>}
                />
              </List.Item>
            )}
          />
        </Card>
        {customSections.map((section, index) => (
          <Card
            key={index}
            title={
              <Space style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                <span>
                  <span style={{ marginRight: "8px" }}>📌</span> {section.title}
                </span>
                <Space>
                  <Button
                    type="default"
                    onClick={() => handleEdit(section.title, section.data)}
                    style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
                  >
                    <EditOutlined />
                  </Button>
                  <Button
                    type="default"
                    onClick={() => handleDelete(section.title)}
                    style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
                  >
                    <DeleteOutlined />
                  </Button>
                </Space>
              </Space>
            }
            style={{
              marginBottom: "24px",
              borderRadius: "8px",
              boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
              border: "1px solid #d9d9d9",
            }}
          >
            {section.data.length > 0 ? (
              <Table
                columns={[
                  { title: "Key", dataIndex: "key", key: "key" },
                  { title: "Value", dataIndex: "value", key: "value" },
                ]}
                dataSource={section.data}
                pagination={false}
                size="small"
                style={{ border: "1px solid #d9d9d9", borderRadius: "4px" }}
              />
            ) : (
              <Text style={{ color: "#8c8c8c" }}>No data available for this section.</Text>
            )}
          </Card>
        ))}
        <Card
          style={{
            borderRadius: "8px",
            border: "2px dashed #d9d9d9",
            textAlign: "center",
            cursor: "pointer",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
            marginTop: "24px",
            borderColor: "#d9d9d9",
          }}
          onClick={showCustomSectionModal}
        >
          <div style={{ padding: "16px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#e6f7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px",
              }}
            >
              <span style={{ fontSize: "24px", color: PRIMARY_COLOR }}>+</span>
            </div>
            <Text style={{ fontWeight: "bold", display: "block", marginBottom: "4px" }}>
              Add a new section
            </Text>
            <Text style={{ color: "#8c8c8c" }}>
              Customize your board with additional sections
            </Text>
          </div>
        </Card>
      </Col>
    </Row>
  );

  const renderTableView = () => (
    <Row style={{ margin: "0 -12px" }}>
      <Col span={24} style={{ padding: "0 12px" }}>
        <Card
          title={
            <span>
              <span style={{ marginRight: "8px" }}>📋</span> All Data Overview
            </span>
          }
          style={{
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
            border: "1px solid #d9d9d9",
          }}
        >
          <Table
            columns={[
              { title: "Category", dataIndex: "category", key: "category" },
              { title: "Name", dataIndex: "name", key: "name" },
              { title: "Details", dataIndex: "details", key: "details" },
            ]}
            dataSource={[
              ...documentsData.map((doc) => ({
                category: "Documents",
                name: doc.name,
                details: doc.type,
              })),
              ...maintenanceData.map((task) => ({
                category: "Maintenance",
                name: task.name,
                details: `${task.date} • ${task.completed ? "Completed" : "Pending"}`,
              })),
              ...notesData.map((note) => ({
                category: "Notes",
                name: note.content.slice(0, 20) + "...",
                details: note.date,
              })),
              ...customSections.flatMap((section) =>
                section.data.map((item) => ({
                  category: section.title,
                  name: item.key,
                  details: item.value,
                }))
              ),
              ...propertyData.map((item) => ({
                category: "Property Information",
                name: item.key,
                details: item.value,
              })),
              ...mortgageDetails.map((item) => ({
                category: "Mortgage & Loans",
                name: item.key,
                details: item.value,
              })),
              ...utilitiesData.map((item) => ({
                category: "Utilities",
                name: item.name,
                details: item.meta,
              })),
              ...insuranceDetails.map((item) => ({
                category: "Insurance",
                name: item.key,
                details: item.value,
              })),
            ]}
            pagination={{ pageSize: 10 }}
            size="small"
            style={{ border: "1px solid #d9d9d9", borderRadius: "4px" }}
          />
        </Card>
      </Col>
    </Row>
  );

  const renderCalendarView = () => {
    // Use Dayjs for Ant Design Calendar
    const cellRender = (current: Dayjs, info: { type: string }) => {
      if (info.type === "date") {
        const formattedDate = current.format("MMM D, YYYY");
        const tasks = maintenanceData.filter((task) => task.date === formattedDate);
        if (tasks.length > 0) {
          return (
            <div style={{ position: "relative", textAlign: "center" }}>
              <Badge
                count={tasks.length}
                style={{
                  backgroundColor: PRIMARY_COLOR,
                  color: "#fff",
                  borderRadius: "50%",
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  fontSize: "10px",
                  padding: "2px 5px",
                }}
              />
              <div style={{ color: tasks.some((task) => !task.completed) ? PRIMARY_COLOR : "#8c8c8c" }}>
                {current.date()}
              </div>
            </div>
          );
        }
        return <span>{current.date()}</span>;
      }
      return null;
    };

    return (
      <Row style={{ margin: "0 -12px" }}>
        <Col span={24} style={{ padding: "0 12px" }}>
          <Card
            title={
              <span>
                <span style={{ marginRight: "8px" }}>📅</span> Maintenance Schedule
              </span>
            }
            style={{
              borderRadius: "8px",
              boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
              border: "1px solid #d9d9d9",
            }}
          >
            <Calendar
              fullscreen={false}
              cellRender={cellRender}
              onSelect={(date) => {
                const formattedDate = date.format("MMM D, YYYY");
                const tasks = maintenanceData.filter((task) => task.date === formattedDate);
                if (tasks.length) {
                  message.info(`Tasks on ${formattedDate}: ${tasks.map((t) => t.name).join(", ")}`);
                } else {
                  message.info(`No tasks scheduled for ${formattedDate}`);
                }
              }}
              style={{ border: "1px solid #d9d9d9", borderRadius: "4px", padding: "8px" }}
            />
            <List
              header={<Text style={{ fontWeight: "bold" }}>Upcoming Tasks</Text>}
              dataSource={maintenanceData.filter((task) => !task.completed)}
              renderItem={(item) => (
                <List.Item style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <Text>{item.name} - {item.date}</Text>
                </List.Item>
              )}
              style={{ marginTop: "16px" }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const renderActivityView = () => (
    <Row style={{ margin: "0 -12px" }}>
      <Col span={12} style={{ padding: "0 12px" }}>
        <Card
          title={
            <span>
              <span style={{ marginRight: "8px" }}>🔌</span> Utilities Overview
            </span>
          }
          extra={
            <Space>
              <Button
                type="default"
                onClick={() => handleEdit("Utilities", utilitiesData)}
                style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
              >
                <EditOutlined />
              </Button>
              <Button
                type="default"
                onClick={() => handleDelete("Utilities")}
                style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
              >
                <DeleteOutlined />
              </Button>
            </Space>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
            border: "1px solid #d9d9d9",
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={utilitiesData}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    size="small"
                    style={{
                      color: PRIMARY_COLOR,
                      borderColor: PRIMARY_COLOR,
                      backgroundColor: "transparent",
                      borderRadius: "4px",
                      padding: "0 8px",
                    }}
                  >
                    Log In
                  </Button>,
                ]}
                style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}
              >
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: item.color, borderRadius: "50%" }}>{item.name[0]}</Avatar>}
                  title={<Text style={{ fontWeight: "bold" }}>{item.name}</Text>}
                  description={item.meta}
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
      <Col span={12} style={{ padding: "0 12px" }}>
        <Card
          title={
            <Space style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
              <span>
                <span style={{ marginRight: "8px" }}>🔧</span> Home Maintenance Overview
              </span>
              <Space>
                <Button
                  type="default"
                  onClick={showMaintenanceModal}
                  style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
                >
                  Add Task
                </Button>
                <Button
                  type="default"
                  onClick={() => handleDelete("Home Maintenance")}
                  style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
                >
                  <DeleteOutlined />
                </Button>
              </Space>
            </Space>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
            border: "1px solid #d9d9d9",
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={maintenanceData}
            renderItem={(item, index) => (
              <List.Item style={{ padding: "8px 0", borderBottom: "none" }}>
                <List.Item.Meta
                  avatar={<Checkbox checked={item.completed} onChange={() => handleCheckboxChange(index)} />}
                  title={
                    <Text style={{ color: item.completed ? "#8c8c8c" : "#000" }}>
                      {item.name}
                    </Text>
                  }
                  description={
                    <Text style={{ color: item.completed ? "#8c8c8c" : "#000", fontSize: "12px" }}>
                      {item.date}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      <Content style={{ padding: "24px" }}>
        <Title
          level={3}
          style={{ color: "#001529", fontWeight: "600", marginBottom: "8px" }}
        >
          <span style={{ marginRight: "8px" }}>🏠</span> Home Management
        </Title>
        <Space style={{ marginBottom: "24px" }}>
          {["Board", "Table", "Calendar", "Activity"].map((tab) => (
            <Button
              key={tab}
              type="text"
              style={{
                fontWeight: activeTab === tab ? "bold" : "normal",
                color: activeTab === tab ? PRIMARY_COLOR : "#000",
                borderBottom: activeTab === tab ? `2px solid ${PRIMARY_COLOR}` : "none",
                padding: "0 8px",
              }}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </Button>
          ))}
        </Space>
        <MainLayout>
          {activeTab === "Board" && renderBoardView()}
          {activeTab === "Table" && renderTableView()}
          {activeTab === "Calendar" && renderCalendarView()}
          {activeTab === "Activity" && renderActivityView()}
        </MainLayout>
        <Modal
          title="Upload Document"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          style={{ borderRadius: "8px" }}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="file"
              label="Upload PDF Document"
              rules={[{ required: true, message: "Please upload a PDF file!" }]}
            >
              <Upload
                accept=".pdf"
                beforeUpload={() => false}
                maxCount={1}
              >
                <Button
                  icon={<UploadOutlined />}
                  style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
                >
                  Select PDF File
                </Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Add New Maintenance Task"
          open={isMaintenanceModalOpen}
          onOk={handleMaintenanceOk}
          onCancel={handleMaintenanceCancel}
          style={{ borderRadius: "8px" }}
        >
          <Form form={maintenanceForm} layout="vertical">
            <Form.Item
              name="name"
              label="Task Name"
              rules={[{ required: true, message: "Please enter task name!" }]}
            >
              <AntInput
                id="task-name"
                style={{ padding: "5px", borderRadius: "4px" }}
                placeholder="Enter task name"
              />
            </Form.Item>
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: "Please enter date!" }]}
            >
              <AntInput
                id="task-date"
                style={{ padding: "5px", borderRadius: "4px" }}
                placeholder="e.g., May 1, 2025"
              />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Add New Note"
          open={isNoteModalOpen}
          onOk={handleNoteOk}
          onCancel={handleNoteCancel}
          style={{ borderRadius: "8px" }}
        >
          <Form form={noteForm} layout="vertical">
            <Form.Item
              name="content"
              label="Note Content"
              rules={[{ required: true, message: "Please enter note content!" }]}
            >
              <AntInput.TextArea
                id="note-content"
                style={{ padding: "5px", borderRadius: "4px", minHeight: "100px" }}
                placeholder="Enter note content"
                rows={4}
              />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Add New Section"
          open={isCustomSectionModalOpen}
          onOk={handleCustomSectionOk}
          onCancel={handleCustomSectionCancel}
          style={{ borderRadius: "8px" }}
        >
          <Form form={customSectionForm} layout="vertical">
            <Form.Item
              name="title"
              label="Section Title"
              rules={[{ required: true, message: "Please enter section title!" }]}
            >
              <AntInput
                id="section-title"
                style={{ padding: "5px", borderRadius: "4px" }}
                placeholder="Enter section title"
              />
            </Form.Item>
            {Array.from({ length: 10 }).map((_, index) => (
              <Row key={index} style={{ marginBottom: "16px" }}>
                <Col span={12} style={{ paddingRight: "8px" }}>
                  <Form.Item name={`key${index}`} label={`Key ${index + 1}`}>
                    <AntInput
                      style={{ padding: "5px", borderRadius: "4px" }}
                      placeholder="Enter key"
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ paddingLeft: "8px" }}>
                  <Form.Item name={`value${index}`} label={`Value ${index + 1}`}>
                    <AntInput
                      style={{ padding: "5px", borderRadius: "4px" }}
                      placeholder="Enter value"
                    />
                  </Form.Item>
                </Col>
              </Row>
            ))}
          </Form>
        </Modal>
        <Modal
          title={`Edit Section: ${editSection}`}
          open={isEditModalOpen}
          onOk={handleEditOk}
          onCancel={handleEditCancel}
          style={{ borderRadius: "8px" }}
        >
          <Form form={editForm} layout="vertical">
            {renderEditForm()}
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default HomeManagement;