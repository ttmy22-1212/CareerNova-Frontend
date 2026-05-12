"use client";

import { useState, useEffect, useRef } from "react";
import { Box, Tooltip, IconButton, Snackbar, Alert } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { useUserContext } from "@/contexts/user/user-context";
import { UserTopicStatus } from "@/types/user";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth/firebase-context";
import useAppSnackbar from "@/hooks/use-app-snackbar";

interface ResourceProgressProps {
  resourceId: string;
  topicId: string;
}

export default function ResourceProgress({
  resourceId,
  topicId,
}: ResourceProgressProps) {
  const { showSnackbarSuccess, showSnackbarError } = useAppSnackbar();
  const params = useParams();
  const roadmapId = params.roadmapId as string;
  const { user } = useAuth();
  const { getTopicProgress, updateTopicProgress } = useUserContext();
  const [progress, setProgress] = useState<UserTopicStatus>(
    UserTopicStatus.NOT_STARTED,
  );
  const [isLoading, setIsLoading] = useState(false);
  const loadedFromLocalStorage = useRef(false);

  useEffect(() => {
    const topicProgress = getTopicProgress(topicId);

    if (topicProgress) {
      setProgress(topicProgress.status);
    } else if (!loadedFromLocalStorage.current) {
      loadedFromLocalStorage.current = true;
      const savedProgress = localStorage.getItem(
        `progress-${topicId}-${resourceId}`,
      );
      if (
        savedProgress &&
        Object.values(UserTopicStatus).includes(
          savedProgress as UserTopicStatus,
        )
      ) {
        setProgress(savedProgress as UserTopicStatus);
      }
    }
  }, [topicId, resourceId, getTopicProgress]);

  const handleProgressChange = async (newStatus: UserTopicStatus) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      setProgress(newStatus);

      localStorage.setItem(`progress-${topicId}-${resourceId}`, newStatus);

      if (user?.email) {
        const parentProgress = getTopicProgress(roadmapId);

        if (!parentProgress) {
          await updateTopicProgress(roadmapId, UserTopicStatus.NOT_STARTED);

          showSnackbarSuccess("Lưu lộ trình thành công");

          const bookmarks = JSON.parse(
            localStorage.getItem("roadmap-bookmarks") || "[]",
          );
          if (!bookmarks.includes(roadmapId)) {
            bookmarks.push(roadmapId);
            localStorage.setItem(
              "roadmap-bookmarks",
              JSON.stringify(bookmarks),
            );
          }
        }

        await updateTopicProgress(topicId, newStatus);

        showSnackbarSuccess(`Tiến độ được cập nhật thành công`);
      }
    } catch (error) {
      console.error("Lỗi cập nhật tiến độ:", error);
      const topicProgress = getTopicProgress(topicId);
      if (topicProgress) {
        setProgress(topicProgress.status);
      }

      showSnackbarError("Đã xảy ra lỗi khi cập nhật tiến độ");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: UserTopicStatus): string => {
    switch (status) {
      case UserTopicStatus.NOT_STARTED:
        return "Chưa học";
      case UserTopicStatus.IN_PROGRESS:
        return "Đang học";
      case UserTopicStatus.COMPLETED:
        return "Hoàn thành";
      default:
        return "Unknown";
    }
  };

  const statusConfig = {
    [UserTopicStatus.NOT_STARTED]: {
      icon: <RadioButtonUncheckedIcon fontSize="small" />,
      label: "Chưa học",
      color: "text.secondary",
      bgColor: "transparent",
      borderColor: "divider",
    },
    [UserTopicStatus.IN_PROGRESS]: {
      icon: <AccessTimeIcon fontSize="small" />,
      label: "Đang học",
      color: "warning.main",
      bgColor: "warning.light",
      borderColor: "warning.main",
    },
    [UserTopicStatus.COMPLETED]: {
      icon: <CheckCircleIcon fontSize="small" />,
      label: "Hoàn thành",
      color: "success.main",
      bgColor: "success.light",
      borderColor: "success.main",
    },
  };

  const currentStatus = statusConfig[progress];

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {Object.entries(statusConfig).map(([status, config]) => (
          <Tooltip
            key={status}
            title={
              user?.email
                ? config.label
                : "Vui lòng đăng nhập để cập nhật tiến độ"
            }
            placement="top"
          >
            <IconButton
              size="small"
              onClick={
                user?.email
                  ? () => handleProgressChange(status as UserTopicStatus)
                  : undefined
              }
              disabled={isLoading && status === progress}
              sx={{
                color: status === progress ? config.color : "text.disabled",
                bgcolor: status === progress ? config.bgColor : "transparent",
                border: "1px solid",
                borderColor:
                  status === progress ? config.borderColor : "transparent",
                p: 0.5,
                "&:hover": {
                  bgcolor: config.bgColor,
                  opacity: 0.8,
                },
              }}
            >
              {config.icon}
            </IconButton>
          </Tooltip>
        ))}

        <Box
          component="span"
          sx={{
            fontSize: "0.75rem",
            fontWeight: 500,
            color: currentStatus.color,
            ml: 0.5,
          }}
        >
          {currentStatus.label}
        </Box>
      </Box>
    </>
  );
}
