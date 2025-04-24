"use client";
import { Layout } from "antd";
import { useState } from "react";
import GettingStartedWidget from "./gettingStartedWidget";
import AIButton from "./aiButton";
import DocklySmartHub from "../dashboard/docklySmartHub";
import UpcomingAndTodoList from "../dashboard/upcomingAndTodoList";
import CalendarEventWidget from "../dashboard/calendar";

const { Content } = Layout;

const Dashboard = () => {
  const [showHub, setShowHub] = useState(false);

  return (
    <Layout>
      <Content style={{ padding: "0px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2>John's Dock</h2>
          <AIButton onClick={() => setShowHub(!showHub)} isOpen={showHub} />
        </div>

        <p>
          You have 3 accounts that need attention and 2 bills due this week.
        </p>

        <div style={{ display: "flex", gap: 20 }}>
          <GettingStartedWidget />
          {showHub && <DocklySmartHub />}
        </div>
        <div style={{ marginTop: 20, display: "flex", gap: 20 }}>
          <UpcomingAndTodoList />
          <CalendarEventWidget />
        </div>
      </Content>
    </Layout>
  );
};

export default Dashboard;
