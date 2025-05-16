// "use client";

// import React, { useState } from "react";
// import { Input, Typography, Card, Divider, Tooltip, Space } from "antd";
// import {
//   BgColorsOutlined,
//   HighlightOutlined,
//   BorderOutlined,
//   EyeOutlined,
// } from "@ant-design/icons";
// import { PRIMARY_COLOR, ACTIVE_TEXT_COLOR, SIDEBAR_BG } from "../../app/comman";
// import MainLayout from "../components/mainLayout";

// const { Title, Text } = Typography;

const ThemesPage = () => {
  return <></>;
};
//   const [primaryColor, setPrimaryColor] = useState(PRIMARY_COLOR);
//   const [activeTextColor, setActiveTextColor] = useState(ACTIVE_TEXT_COLOR);
//   const [sidebarBg, setSidebarBg] = useState(SIDEBAR_BG);

//   return (
//     <div
//       style={{
//         display: "flex",
//         backgroundColor: "#f9f9f9",
//         gap: "30px",
//         minHeight: "30vh",
//         fontFamily: "Segoe UI, sans-serif",
//       }}
//     >
//       <div style={{ flex: 1, maxWidth: 400 }}>
//         <Title level={3} style={{ marginBottom: 30, marginTop: 0 }}>
//           🎨 Customize Theme
//         </Title>

//         <Space direction="vertical" size="large" style={{ width: "100%" }}>
//           <Card style={{ borderRadius: 16 }}>
//             <Space align="center" size="middle">
//               <BgColorsOutlined style={{ fontSize: 22, color: primaryColor }} />
//               <Text strong>Primary Color</Text>
//             </Space>
//             <Input
//               type="color"
//               value={primaryColor}
//               onChange={(e) => setPrimaryColor(e.target.value)}
//               style={{ marginTop: 15, width: "100%", height: 40 }}
//             />
//           </Card>

//           <Card style={{ borderRadius: 16 }}>
//             <Space align="center" size="middle">
//               <HighlightOutlined
//                 style={{ fontSize: 22, color: activeTextColor }}
//               />
//               <Text strong>Active Text Color</Text>
//             </Space>
//             <Input
//               type="color"
//               value={activeTextColor}
//               onChange={(e) => setActiveTextColor(e.target.value)}
//               style={{ marginTop: 15, width: "100%", height: 40 }}
//             />
//           </Card>

//           <Card style={{ borderRadius: 16 }}>
//             <Space align="center" size="middle">
//               <BorderOutlined style={{ fontSize: 22, color: sidebarBg }} />
//               <Text strong>Sidebar Background</Text>
//             </Space>
//             <Input
//               type="color"
//               value={sidebarBg}
//               onChange={(e) => setSidebarBg(e.target.value)}
//               style={{ marginTop: 15, width: "100%", height: 40 }}
//             />
//           </Card>
//         </Space>
//       </div>

//       <div style={{ flex: 1.5 }}>
//         <Title level={4} style={{ marginBottom: 20, marginTop: 0 }}>
//           <EyeOutlined /> Live Preview
//         </Title>

//         <iframe
//           src={`/theme-preview?primaryColor=${encodeURIComponent(
//             primaryColor
//           )}&activeTextColor=${encodeURIComponent(
//             activeTextColor
//           )}&sidebarBg=${encodeURIComponent(sidebarBg)}`}
//           style={{
//             width: "65vw",
//             height: "400px",
//             border: "1px solid #ccc",
//             borderRadius: 16,
//             boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
//             marginTop: 30,
//           }}
//         />
//       </div>
//     </div>
//   );
// };

export default ThemesPage;
