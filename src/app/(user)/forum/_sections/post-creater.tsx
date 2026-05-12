"use client";

import { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  InputBase,
  Stack,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import { InsertPhoto, Event, Article } from "@mui/icons-material";
import { usePostContext } from "@/contexts/forum/post-context";
import useAppSnackbar from "@/hooks/use-app-snackbar";
import UsersApi from "@/api/users";
import type { User } from "@/types/user";

export default function PostCreator() {
  const { createPostApi } = usePostContext();
  const { showSnackbarSuccess, showSnackbarError } = useAppSnackbar();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await UsersApi.me();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const handleSubmit = async () => {
    if (!content.trim()) {
      showSnackbarError("Vui lòng nhập nội dung bài viết!");
      return;
    }

    const response = await createPostApi.call({
      content,
      image_url: imageUrls.length > 0 ? imageUrls : undefined,
    });

    if (response.data) {
      setOpen(false);
      setContent("");
      setImageUrls([]);
      showSnackbarSuccess("Đăng bài viết thành công!");
    } else {
      showSnackbarError(`Đăng bài viết thất bại: ${response.error}`);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <Avatar
          src={user?.photo_url}
          alt={user?.name || "User"}
          sx={{ width: 55, height: 55 }}
        />
        <InputBase
          fullWidth
          placeholder="Hãy viết những thắc mắc của bạn..."
          onClick={() => setOpen(true)}
          sx={{
            p: 1,
            border: "1px solid #e0e0e0",
            borderRadius: 30,
            pl: 2,
          }}
        />
      </Box>

      {open && (
        <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Tạo bài viết mới
          </Typography>
          <TextareaAutosize
            minRows={3}
            placeholder="Nội dung bài viết..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #e0e0e0",
              marginBottom: "8px",
            }}
          />
          <InputBase
            fullWidth
            placeholder="URL hình ảnh (cách nhau bởi dấu phẩy)"
            value={imageUrls.join(",")}
            onChange={(e) =>
              setImageUrls(e.target.value.split(",").filter(Boolean))
            }
            sx={{
              p: 1,
              border: "1px solid #e0e0e0",
              borderRadius: 4,
              mb: 2,
            }}
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => {
                setOpen(false);
                setContent("");
                setImageUrls([]);
              }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={createPostApi.loading}
            >
              {createPostApi.loading ? "Đang đăng..." : "Đăng"}
            </Button>
          </Stack>
        </Box>
      )}

      <Divider />

      <Stack direction="row" spacing={1} justifyContent="space-between" sx={{ pt: 1 }}>
        <Button startIcon={<InsertPhoto color="primary" />} sx={{ textTransform: "none" }}>
          Ảnh
        </Button>
        <Button startIcon={<Event sx={{ color: "orange" }} />} sx={{ textTransform: "none" }}>
          Sự kiện
        </Button>
        <Button startIcon={<Article sx={{ color: "red" }} />} sx={{ textTransform: "none" }}>
          Viết bài
        </Button>
      </Stack>
    </Box>
  );
}
