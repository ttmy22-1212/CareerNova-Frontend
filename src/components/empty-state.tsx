import React from "react";
import { Typography, Stack, Box, Paper, StackProps } from "@mui/material";
import { neutral } from "@/theme/colors";
import LazyLottie from "./lazy-lottie";

interface EmptyStateProps extends StackProps {
  width: number;
  height: number;
  title?: string;
  isMobile?: boolean;
}

function EmptyState({
  width,
  height,
  title,
  isMobile,
  ...stackProps
}: EmptyStateProps) {
  return (
    <Stack alignItems={"center"} justifyContent={"center"} {...stackProps}>
      <LazyLottie
        path="/assets/lottie/empty-state.json"
        width={width}
        height={height}
      />
      <Typography
        variant="subtitle1"
        textAlign={"center"}
        sx={{ whiteSpace: "pre-line" }}
      >
        {title}
      </Typography>
    </Stack>
  );
}

export default EmptyState;
