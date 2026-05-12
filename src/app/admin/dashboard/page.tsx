import OnDevelopmentPage from "@/components/development-page";
import DashboardContent from "./_sections/content";

const onDevelopment = true;

const Dashboard = () => {
  if (onDevelopment) {
    return <OnDevelopmentPage />;
  }
  return <DashboardContent />;
};

export default Dashboard;
