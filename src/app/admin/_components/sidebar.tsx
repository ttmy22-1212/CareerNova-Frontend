"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Collapse,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getConfigAdmin } from "./get-config-admin";
import { WITDH_SIDEBAR_ADMIN } from "@/constants";
import RowStack from "@/components/row-stack";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const theme = useTheme();
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const configAdmin = useMemo(() => getConfigAdmin(), []);

  const handleSettingsClick = () => {
    setSettingsOpen(!settingsOpen);
  };

  return (
    <Drawer
      variant='permanent'
      open={open}
      onClose={onClose}
      sx={{
        width: open ? WITDH_SIDEBAR_ADMIN : 0,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          boxSizing: "border-box",
          borderRight: "1px solid rgba(0, 0, 0, 0.12)",
          whiteSpace: "nowrap",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: "hidden",
          width: open ? WITDH_SIDEBAR_ADMIN : 0,
          [theme.breakpoints.down("sm")]: {
            width: open ? WITDH_SIDEBAR_ADMIN : 0,
          },
        },
      }}
    >
      <Stack>
        <Toolbar>
          <RowStack spacing={1}>
            <Box
              component='img'
              src='/placeholder.svg?height=30&width=30'
              alt='Logo'
              sx={{ width: 30, height: 30 }}
            />
            <Typography variant='h6' noWrap component='div'>
              Admin Panel
            </Typography>
          </RowStack>
        </Toolbar>
        <List sx={{ mt: 2 }}>
          {configAdmin.map((item) => (
            <Link
              href={item.path}
              passHref
              key={item.title}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <ListItem disablePadding>
                <ListItemButton
                  selected={pathname.includes(item.path)}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    "&.Mui-selected": {
                      backgroundColor: theme.palette.action.selected,
                      borderRight: `3px solid ${theme.palette.primary.main}`,
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 3,
                      justifyContent: "center",
                      color:
                        pathname === item.path
                          ? theme.palette.primary.main
                          : "inherit",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      fontWeight: pathname === item.path ? "bold" : "normal",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Link>
          ))}
        </List>

        <Box>
          <ListItemButton onClick={handleSettingsClick}>
            <ListItemIcon sx={{ minWidth: 0, mr: 3, justifyContent: "center" }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary='Cài đặt' />
            {settingsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={settingsOpen} timeout='auto' unmountOnExit>
            <List component='div' disablePadding>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemText primary='Cài đặt chung' />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemText primary='Bảo mật' />
              </ListItemButton>
            </List>
          </Collapse>
        </Box>

        <Box sx={{ position: "absolute", bottom: 0, width: "100%", p: 2 }}>
          <ListItemButton>
            <ListItemIcon sx={{ minWidth: 0, mr: 3, justifyContent: "center" }}>
              <HelpOutlineIcon />
            </ListItemIcon>
            <ListItemText primary='Trợ giúp' />
          </ListItemButton>
        </Box>
      </Stack>
    </Drawer>
  );
};

export default Sidebar;
