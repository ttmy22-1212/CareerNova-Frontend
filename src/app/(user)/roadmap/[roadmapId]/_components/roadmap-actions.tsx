"use client";

import type React from "react";

import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useUserContext } from "@/contexts/user/user-context";
import { UserTopicStatus } from "@/types/user";
import { useAuth } from "@/contexts/auth/firebase-context";
import DevelopmentTooltip from "@/components/development-tooltip";
import useAppSnackbar from "@/hooks/use-app-snackbar";

export default function RoadmapActions() {
  const params = useParams();
  const { showSnackbarSuccess } = useAppSnackbar();
  const roadmapId = params.roadmapId as string;
  const { getTopicProgress, updateTopicProgress, removeTopicProgress } =
    useUserContext();
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null);

  const loadedFromLocalStorage = useRef(false);

  useEffect(() => {
    const topicProgress = getTopicProgress(roadmapId);

    if (topicProgress) {
      setBookmarked(true);
    } else if (!loadedFromLocalStorage.current) {
      loadedFromLocalStorage.current = true;
      const savedBookmarks = JSON.parse(
        localStorage.getItem("roadmap-bookmarks") || "[]",
      );
      setBookmarked(savedBookmarks.includes(roadmapId));
    }
  }, [roadmapId, getTopicProgress]);

  const handleBookmarkToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      setBookmarked(!bookmarked);

      const bookmarks = JSON.parse(
        localStorage.getItem("roadmap-bookmarks") || "[]",
      );

      if (!bookmarked) {
        if (!bookmarks.includes(roadmapId)) {
          bookmarks.push(roadmapId);
        }
        showSnackbarSuccess("Đã lưu lộ trình thành công");

        if (user?.email) {
          await updateTopicProgress(roadmapId, UserTopicStatus.NOT_STARTED);
        }
      } else {
        const index = bookmarks.indexOf(roadmapId);
        if (index > -1) {
          bookmarks.splice(index, 1);
        }
        showSnackbarSuccess("Đã gỡ lộ trình thành công");

        if (user?.email) {
          await removeTopicProgress(roadmapId);
        }
      }

      localStorage.setItem("roadmap-bookmarks", JSON.stringify(bookmarks));
    } catch (error) {
      setBookmarked(!bookmarked);
      showSnackbarSuccess("Đã xảy ra lỗi khi cập nhật tình trạng roadmap");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareClick = (event: React.MouseEvent<HTMLElement>) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url,
        )}&text=Check out this roadmap!`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url,
        )}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url,
        )}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        showSnackbarSuccess("Sao chép đường dẫn thành công");
        handleShareClose();
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }

    handleShareClose();
  };

  return (
    <>
      <Box sx={{ display: "flex", gap: 1 }}>
        <IconButton
          sx={{ color: bookmarked ? "primary.main" : "text.secondary" }}
          onClick={handleBookmarkToggle}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          disabled={isLoading}
        >
          {bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        </IconButton>

        <DevelopmentTooltip>
          <Button
            startIcon={<CalendarTodayIcon />}
            variant="outlined"
            sx={{
              color: "text.secondary",
              borderColor: "divider",
              "&:hover": {
                borderColor: "text.secondary",
                bgcolor: "action.hover",
              },
            }}
          >
            Lên lịch học
          </Button>
        </DevelopmentTooltip>

        <DevelopmentTooltip>
          <Button
            startIcon={<DownloadIcon />}
            variant="contained"
            sx={{
              bgcolor: "warning.main",
              color: "text.primary",
              "&:hover": {
                bgcolor: "warning.dark",
              },
            }}
          >
            Tải xuống
          </Button>
        </DevelopmentTooltip>

        <Button
          startIcon={<ShareIcon />}
          variant="outlined"
          onClick={handleShareClick}
          sx={{
            color: "text.secondary",
            borderColor: "divider",
            "&:hover": {
              borderColor: "text.secondary",
              bgcolor: "action.hover",
            },
          }}
        >
          Chia sẻ
        </Button>

        <Menu
          anchorEl={shareAnchorEl}
          open={Boolean(shareAnchorEl)}
          onClose={handleShareClose}
        >
          <MenuItem onClick={() => handleShare("twitter")}>Twitter</MenuItem>
          <MenuItem onClick={() => handleShare("facebook")}>Facebook</MenuItem>
          <MenuItem onClick={() => handleShare("linkedin")}>LinkedIn</MenuItem>
          <MenuItem onClick={() => handleShare("copy")}>
            Sao chép liên kết
          </MenuItem>
        </Menu>
      </Box>

      {/* <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar> */}
    </>
  );
}
