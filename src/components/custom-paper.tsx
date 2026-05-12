import { Paper, PaperProps, Stack } from "@mui/material";
import React from "react";

type CustomPaperProps = {
  children: React.ReactNode;
} & PaperProps;

const CustomPaper = ({ children, ...props }: CustomPaperProps) => {
  const { sx, ...other } = props;
  return (
    <Paper
      sx={{
        padding: "24px",
        boxShadow: {
          xs: "0",
          lg: "0px 0px 0px 0.5px rgba(0, 0, 0, 0.03), 0px 5px 22px 0px rgba(0, 0, 0, 0.04)",
        },
        borderRadius: {
          lg: "20px",
        },
        ...sx,
      }}
      {...other}
    >
      {children}
    </Paper>
  );
};

export default CustomPaper;
