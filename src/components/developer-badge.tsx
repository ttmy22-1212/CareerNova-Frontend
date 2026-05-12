import { Warning } from "@mui/icons-material";
import { Paper, SvgIcon, SxProps, Tooltip } from "@mui/material";
import React from "react";

interface DeveloperBadgeProps {
  sx?: SxProps;
}

const DeveloperBadge = ({ sx }: DeveloperBadgeProps) => {
  return (
    <Tooltip title="Tính năng đang phát triển. Vì tài khoản của bạn ở chế độ kiểm tra nội bộ nên sẽ thấy giao diện này">
      <Paper
        sx={{
          position: "fixed",
          bgcolor: (theme) => theme.palette.error.light,
          right: 8,
          bottom: 8,
          p: 1,
          zIndex: 10000000,
          ...sx,
        }}
      >
        <SvgIcon color="error" sx={{ width: 32, height: 32 }}>
          <Warning />
        </SvgIcon>
      </Paper>
    </Tooltip>
  );
};

export default DeveloperBadge;
