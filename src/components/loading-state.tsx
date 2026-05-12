"use client";

import { FC, ReactNode } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  useTheme,
  keyframes,
  alpha,
  Stack,
} from "@mui/material";
import { HEIGHT_HEADER_ADMIN } from "@/constants";

const textPulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const rippleEffect = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

interface LoadingStateProps {
  message?: string;
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  size?: number;
  fullScreen?: boolean;
  children?: ReactNode;
  backdropOpacity?: number;
}

const LoadingState: FC<LoadingStateProps> = ({
  message = "Đang tải dữ liệu...",
  color = "primary",
  size = 60,
  fullScreen = true,
  children,
  backdropOpacity = 0.9,
}) => {
  const theme = useTheme();

  return (
    <Stack
      sx={{
        position: fullScreen ? "fixed" : "absolute",
        top: fullScreen ? HEIGHT_HEADER_ADMIN : 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: theme.zIndex.modal + 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: alpha(theme.palette.background.paper, backdropOpacity),
        backdropFilter: "blur(8px)",
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {[...Array(3)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              border: `2px solid ${theme.palette[color].main}`,
              animation: `${rippleEffect} 1.5s infinite`,
              animationDelay: `${i * 0.3}s`,
              opacity: 0,
            }}
          />
        ))}

        <CircularProgress
          color={color}
          size={size}
          thickness={4}
          sx={{
            boxShadow: `0 0 ${size / 5}px ${alpha(
              theme.palette[color].main,
              0.5,
            )}`,
            borderRadius: "50%",
          }}
        />

        {children}

        {message && (
          <Typography
            variant="h6"
            color="textSecondary"
            sx={{
              mt: 3,
              animation: `${textPulse} 1.5s infinite ease-in-out`,
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            {message}
          </Typography>
        )}

        <Box sx={{ display: "flex", mt: 2, gap: 0.7 }}>
          {[...Array(3)].map((_, i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: theme.palette[color].main,
                animation: `${textPulse} 1.5s infinite ease-in-out`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </Box>
      </Box>
    </Stack>
  );
};

export default LoadingState;
