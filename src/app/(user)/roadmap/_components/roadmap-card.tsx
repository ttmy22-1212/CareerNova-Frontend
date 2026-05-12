"use client";

import type React from "react";

import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import Link from "next/link";
import { useUserContext } from "@/contexts/user/user-context";
import { UserTopicStatus } from "@/types/user";
import { useState, useEffect, useRef } from "react";
import { paths } from "@/paths";
import { useAuth } from "@/contexts/auth/firebase-context";

interface RoadmapCardProps {
  id: string;
  title: string;
  description: string;
}

export default function RoadmapCard({
  id,
  title,
  description,
}: RoadmapCardProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { getTopicProgress, updateTopicProgress, removeTopicProgress } =
    useUserContext();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  // Use a ref to track if we've already loaded from localStorage
  const loadedFromLocalStorage = useRef(false);

  // Check if the topic is bookmarked
  useEffect(() => {
    // Get from API if available
    const topicProgress = getTopicProgress(id);

    if (topicProgress) {
      setIsBookmarked(true);
    }
    // Only load from localStorage once to prevent infinite loops
    else if (!loadedFromLocalStorage.current) {
      loadedFromLocalStorage.current = true;
      // Fallback to localStorage if API data is not available yet
      const savedBookmarks = JSON.parse(
        localStorage.getItem("roadmap-bookmarks") || "[]",
      );
      setIsBookmarked(savedBookmarks.includes(id));
    }
  }, [id, getTopicProgress]);

  // Handle bookmark toggle
  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);
    try {
      // Update local state immediately for better UX
      setIsBookmarked(!isBookmarked);

      // Save to localStorage as fallback
      const bookmarks = JSON.parse(
        localStorage.getItem("roadmap-bookmarks") || "[]",
      );
      if (!isBookmarked) {
        if (!bookmarks.includes(id)) {
          bookmarks.push(id);
        }
        setSnackbar({
          open: true,
          message: "Roadmap added to bookmarks",
          severity: "success",
        });
      } else {
        const index = bookmarks.indexOf(id);
        if (index > -1) {
          bookmarks.splice(index, 1);
        }
        setSnackbar({
          open: true,
          message: "Roadmap removed from bookmarks",
          severity: "info",
        });
      }
      localStorage.setItem("roadmap-bookmarks", JSON.stringify(bookmarks));

      // If user is logged in, update on the server
      if (user?.email) {
        if (!isBookmarked) {
          // Add bookmark
          await updateTopicProgress(id, UserTopicStatus.NOT_STARTED);
        } else {
          // Remove bookmark
          await removeTopicProgress(id);
        }
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      // Revert to previous state on error
      setIsBookmarked(!isBookmarked);
      setSnackbar({
        open: true,
        message: "Error updating bookmark status",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <>
      <Card
        sx={{
          height: "100%",
          bgcolor: "background.paper",
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: "background.default",
            transform: "translateY(-4px)",
          },
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              component="h3"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                fontSize: isMobile ? "1rem" : "1.125rem",
              }}
            >
              <Link
                href={paths.roadmap.detail.replace(":roadmapId", id)}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {title}
              </Link>
            </Typography>
            <IconButton
              size="small"
              sx={{
                color: isBookmarked ? "primary.main" : "text.secondary",
                "&:hover": {
                  color: isBookmarked ? "primary.dark" : "primary.light",
                },
              }}
              onClick={handleBookmarkToggle}
              disabled={isLoading}
            >
              {isBookmarked ? (
                <BookmarkIcon fontSize="small" />
              ) : (
                <BookmarkBorderIcon fontSize="small" />
              )}
            </IconButton>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: isMobile ? "-webkit-box" : "block",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontSize: isMobile ? "0.8125rem" : "0.875rem",
            }}
          >
            {description}
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Link
              href={`/roadmap/${id}`}
              style={{
                textDecoration: "none",
                color: "primary.main",
                fontSize: isMobile ? "0.8125rem" : "0.875rem",
                fontWeight: 500,
              }}
            >
              Xem lộ trình →
            </Link>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
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
      </Snackbar>
    </>
  );
}
