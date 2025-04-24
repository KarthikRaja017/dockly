import Dashboard from "../components/dashboard";
import HeaderBar from "../components/header";
import Sidebar from "../components/sideBar";
import Layout from "../layout";

const DashBoard = () => {
  return (
    <Layout>
    <Sidebar />
    <Layout>
      <HeaderBar />
      <Dashboard />
    </Layout>
  </Layout>
  );
};
export default DashBoard;
