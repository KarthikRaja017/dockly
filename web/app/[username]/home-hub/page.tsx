
// "use client";
// import React, { useEffect, useState } from "react";
// import {
//   Layout,
//   Typography,
//   Table,
//   List,
//   Badge,
//   Calendar,
//   Tabs,
// } from "antd";
// import { HomeOutlined } from "@ant-design/icons";
// import { useRouter } from "next/navigation";
// import dayjs, { Dayjs } from "dayjs";

// import MainLayout from "../../../pages/components/mainLayout";

// import PropertyInformation from "../../../pages/home/PropertyInformation";
// // import MortgageLoans from "../../../pages/home/mortgageloans";
// import Utilities from "../../../pages/home/utilities";
// import Insurance from "../../../pages/home/insurance";
// import Documents from "../../../pages/home/documents";
// import Maintenance from "../../../pages/home/maintainance";
// import Notes from "../../../pages/home/notes";
// import MortgageLoans from "../../../pages/home/mortageloans";

// const { Content, Header } = Layout;
// const { Title } = Typography;

// interface CustomSectionData {
//   key: string;
//   value: string;
// }

// interface Section {
//   title: string;
//   type: string;
//   data: CustomSectionData[];
// }

// const HomeManagementDashboard: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<string>("Board");
//   const [customSections, setCustomSections] = useState<Section[]>([]);
//   const [isCustomSectionModalOpen, setIsCustomSectionModalOpen] = useState<boolean>(false);

//   const router = useRouter();

//   useEffect(() => {
//     const username = localStorage.getItem("username") || "";
//     if (localStorage.getItem("home-hub") === null) {
//       router.push(`/${username}/home-hub/setup`);
//     }
//   }, [router]);

//   const handleTabClick = (tab: string): void => {
//     setActiveTab(tab);
//   };

//   const addSection = (section: Section) => {
//     setCustomSections([...customSections, section]);
//   };

//   const showCustomSectionModal = () => setIsCustomSectionModalOpen(true);

//   const renderBoardView = () => (
//     <div
//       style={{
//         display: "grid",
//         gridTemplateColumns: "1fr 1fr", // Maintain two-column layout
//         gap: "16px", // Set explicit gap to control spacing
//         alignItems: "start", // Align items to the top to avoid stretching
//       }}
//     >
//       <div style={{ marginBottom: "0" }}>
//         <PropertyInformation />
//       </div>
//       <div style={{ marginBottom: "0" }}>
//         <Maintenance uid={""} />
//       </div>
//       <div style={{ marginBottom: "0" }}>
//         <MortgageLoans uid={""} />
//       </div>
//       <div style={{ marginBottom: "0" }}>
//         <Utilities />
//       </div>
//       <div style={{ marginBottom: "0" }}>
//         <Insurance isMobile={false} />
//       </div>
//       <div style={{ marginBottom: "0" }}>
//         <Documents isMobile={false} />
//       </div>
//       <div style={{ gridColumn: "", marginBottom: "0" }}>
//         <Notes />
//       </div>
//     </div>
//   );

//   const renderTableView = () => (
//     <Table
//       columns={[
//         { title: "Task", dataIndex: "name", key: "name" },
//         { title: "Due Date", dataIndex: "date", key: "date" },
//         {
//           title: "Status",
//           dataIndex: "completed",
//           key: "completed",
//           render: (completed: boolean) => (
//             <Badge status={completed ? "success" : "warning"} text={completed ? "Completed" : "Pending"} />
//           ),
//         },
//       ]}
//       dataSource={[
//         { name: "Replace HVAC filters", date: "Apr 10, 2025", completed: true },
//         { name: "Schedule annual A/C maintenance", date: "May 1, 2025", completed: false },
//         { name: "Clean gutters", date: "May 15, 2025", completed: false },
//       ]}
//       pagination={false}
//       style={{ border: "1px solid #d9d9d9", borderRadius: "4px" }}
//     />
//   );

//   const renderCalendarView = () => (
//     <div style={{ border: "1px solid #d9d9d9", borderRadius: "4px", padding: "16px" }}>
//       <Calendar
//         fullscreen={false}
//         onSelect={(date: Dayjs) => {
//           console.log("Selected date:", date.format("YYYY-MM-DD"));
//         }}
//       />
//     </div>
//   );

//   const renderActivityView = () => (
//     <List
//       itemLayout="horizontal"
//       dataSource={[
//         { title: "Added Property Deed.pdf", date: "Apr 15, 2023" },
//         { title: "Updated Mortgage Details", date: "Apr 10, 2023" },
//         { title: "Added Maintenance Task", date: "Apr 5, 2023" },
//       ]}
//       renderItem={(item) => (
//         <List.Item>
//           <List.Item.Meta title={item.title} description={`Performed on ${item.date}`} />
//         </List.Item>
//       )}
//       style={{ border: "1px solid #d9d9d9", borderRadius: "4px", padding: "16px" }}
//     />
//   );

//   return (
//     <MainLayout >
//       <Layout style={{ background: "#fff" }}>
//         <Header
//           style={{
//             background: "#fff",
//             padding: "24px",
//             borderBottom: "1px solid #d9d9d9",
//             marginTop: "40px",
//             marginLeft: "24px",
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//             <Title level={3} style={{ margin: 0 }}>
//               🏠 Home Management
//             </Title>
//           </div>
//         </Header>

//         <Tabs
//           activeKey={activeTab}
//           onChange={handleTabClick}
//           style={{
//             padding: "0 24px",
//             background: "#fff",
//             borderBottom: "1px solid #f0f0f0",
//             marginLeft: "27px",
//           }}
//           items={[
//             { key: "Board", label: "Board View" },
//             { key: "Table", label: "Table View" },
//             // { key: "Calendar", label: "Calendar View" },
//             { key: "Activity", label: "Activity Log" },
//           ]}
//         />

//         <Content style={{ padding: "24px", background: "#fff", marginLeft: "24px" }}>
//           {activeTab === "Board" && renderBoardView()}
//           {activeTab === "Table" && <Utilities />}
//           {/* {activeTab === "Calendar" && renderCalendarView()} */}
//           {activeTab === "Activity"}
//         </Content>
//       </Layout>
//     </MainLayout>
//   );
// };

// export default HomeManagementDashboard;

'use client';

import PropertyInformation from "../../../pages/home/PropertyInformation";
import Utilities from "../../../pages/home/utilities";
import Insurance from "../../../pages/home/insurance";
import Documents from "../../../pages/home/documents";
import Maintenance from "../../../pages/home/maintainance";
import Notes from "../../../pages/home/notes";
import MortgageLoans from "../../../pages/home/mortageloans";
import { Tabs, Card } from "antd";
import { Typography } from "antd";
import { useState } from "react";

interface Section {
  title: string;
  type: string;
  data: { key: string; value: string }[];
}

const HomeManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Board');
  const [customSections, setCustomSections] = useState<Section[]>([]);

  const handleTabClick = (tab: string): void => {
    setActiveTab(tab);
  };

  const addSection = (section: Section) => {
    setCustomSections([...customSections, section]);
  };

  const renderBoardView = () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))',
        gap: '20px',
        alignItems: 'start',
      }}
    >
      <PropertyInformation />
      <Maintenance uid={''} />
      <MortgageLoans uid={''} />
      <Utilities />
      <Insurance isMobile={false} />
      <Documents isMobile={false} />
      <Notes />
    </div>
  );

  const renderTableView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card style={{ width: '100%' }}>
        <PropertyInformation />
      </Card>
      <Card style={{ width: '100%' }}>
        <Maintenance uid={''} />
      </Card>
      <Card style={{ width: '100%' }}>
        <MortgageLoans uid={''} />
      </Card>
      <Card style={{ width: '100%' }}>
        <Utilities />
      </Card>
      <Card style={{ width: '100%' }}>
        <Insurance isMobile={false} />
      </Card>
      <Card style={{ width: '100%' }}>
        <Documents isMobile={false} />
      </Card>
      <Card style={{ width: '100%' }}>
        <Notes />
      </Card>
    </div>
  );

  return (
    <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', marginTop: '60px', marginLeft: '50px' }}>
      <Typography.Title level={3} style={{ padding: '24px', margin: 0, borderBottom: '1px solid #f0f0f0' }}>
        🏠 Home Management
      </Typography.Title>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabClick}
        style={{
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          margin: 0,
          padding: '0 24px',
        }}
        items={[
          { key: 'Board', label: 'Overview' },
          { key: 'Table', label: 'Table View' },
        ]}
      />
      <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '500px' }}>
        {activeTab === 'Board' && renderBoardView()}
        {activeTab === 'Table' && renderTableView()}
      </div>
    </div>
  );
};

export default HomeManagementDashboard;