import MapIcon from "@mui/icons-material/Map";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { paths } from "@/paths";

export interface MenuItemProps {
  title: string;
  icon: React.ReactNode;
  path: string;
}

export const getConfigAdmin = (): MenuItemProps[] => [
  {
    title: "Dashboard",
    icon: <DashboardIcon />,
    path: paths.admin.dashboard,
  },
  {
    title: "Roadmap",
    icon: <MapIcon />,
    path: paths.admin.roadmap.index,
  },
  {
    title: "Company",
    icon: <BusinessIcon />,
    path: paths.admin.company,
  },
  {
    title: "Career",
    icon: <WorkIcon />,
    path: paths.admin.career,
  },
  {
    title: "User",
    icon: <PeopleIcon />,
    path: paths.admin.user,
  },
];
