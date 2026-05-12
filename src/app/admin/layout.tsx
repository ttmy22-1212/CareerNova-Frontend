"use client";

import type React from "react";

import { useState } from "react";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material";
import TopNav from "./_components/top-nav";
import RowStack from "@/components/row-stack";
import Sidebar from "./_components/sidebar";
import { HEIGHT_HEADER_ADMIN, WITDH_SIDEBAR_ADMIN } from "@/constants";
import { withAdminGuard } from "@/hocs/with-admin-guard";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  return (
    <RowStack sx={{ height: "100vh" }}>
      {/* TopNav */}
      <TopNav
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          p: 3,
          width: {
            sm: `calc(100% - ${sidebarOpen ? WITDH_SIDEBAR_ADMIN : 0}px)`,
          },
          height: "100vh",
          mt: `${HEIGHT_HEADER_ADMIN}px`,
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          backgroundColor: "#f5f5f5",
          //   minHeight: `calc(100vh - ${HEIGHT_HEADER_ADMIN}px)`,
          overflow: "auto",
        }}
      >
        <Stack sx={{ py: 2 }}>{children}</Stack>
      </Box>
    </RowStack>
  );
};

export default withAdminGuard(Layout);
