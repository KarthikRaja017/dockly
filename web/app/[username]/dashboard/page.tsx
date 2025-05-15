import Dashboard from "../../../pages/components/dashboard";
import MainLayout from "../../../pages/components/mainLayout";

const DashboardPage = () => {
  return (
    <MainLayout>
      <div style={{marginLeft: "20px", }}>
         <Dashboard />
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
