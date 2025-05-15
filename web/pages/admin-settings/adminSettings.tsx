import { Tabs } from "antd";
import React from "react";
import ThemesPage from "./themes";

const AdminSettingsPage: React.FC = () => {
  const { TabPane } = Tabs;
  const items = [
    {
      label: "Themes",
      key: "1",
      children: (
        <div style={{ display: "flex" }}>
          <ThemesPage />
        </div>
      ),
    },
    {
      label: "Formula",
      key: "2",
      children: (
        <div>
          {/* <AccountsList accountDetails={bankDetails.connections[0].accounts} /> */}
        </div>
      ),
    },
  ];

  return (
    <div style={{ marginTop: "60px" }}>
      <h2>Admin Settings</h2>
      <div
        style={{
          margin: 20,
          padding: 20,
          background: "#f7f9fb",
          borderRadius: 16,
          maxHeight: "80vh",
        }}
      >
        <Tabs
          defaultActiveKey="1"
          tabBarGutter={30}
          tabBarStyle={{
            marginBottom: 24,
            fontWeight: "500",
            fontSize: 16,
          }}
          size="large"
          animated
          items={items}
        />
      </div>
    </div>
  );
};

export default AdminSettingsPage;
