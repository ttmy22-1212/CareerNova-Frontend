"use client";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Link,
  Stack,
  Typography,
  TextField,
  IconButton,
} from "@mui/material";
import {
  ThumbUp,
  ChatBubbleOutline,
  Save,
  Visibility,
  Send,
} from "@mui/icons-material";
import { blue } from "@mui/material/colors";
import { Post } from "@/types/post";
import { Comment } from "@/types/comment";
import { usePostContext } from "@/contexts/forum/post-context";
import { useCommentContext } from "@/contexts/forum/comment-context";
import { useState, useEffect, useCallback } from "react";
import { SocketClient } from "@/api/forum/socket";
import useAppSnackbar from "@/hooks/use-app-snackbar";

interface PostItemProps {
  post: Post;
}

interface CommentItemProps {
  comment: Comment;
}

function CommentItem({ comment }: CommentItemProps) {
  const user = comment.user_id || { name: "Unknown", photo_url: null };

  return (
    <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
      {user.photo_url ? (
        <Avatar
          src={user.photo_url}
          alt={user.name}
          sx={{ width: 32, height: 32 }}
        />
      ) : (
        <Avatar sx={{ bgcolor: blue[500], width: 32, height: 32 }}>
          {user.name.charAt(0)}
        </Avatar>
      )}
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" fontWeight="medium">
          {user.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date(comment.created_at).toLocaleString()}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {comment.content}
        </Typography>
      </Box>
    </Box>
  );
}

export default function PostItem({ post }: PostItemProps) {
  const { likePostApi, unlikePostApi } = usePostContext();
  const { getCommentsApi, createCommentApi } = useCommentContext();
  const { showSnackbarSuccess, showSnackbarError } = useAppSnackbar();
  const [likes, setLikes] = useState(post.like_count);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const limit = 5;

  const loadComments = useCallback(async () => {
    if (!hasMoreComments) return;

    const response = await getCommentsApi.call({
      post_id: post.id,
      offset,
      limit,
    });
    if (response.data) {
      const newComments = response.data.data || [];
      setComments((prev) => [...prev, ...newComments]);
      setOffset(offset + limit);
      setHasMoreComments(newComments.length === limit);
    } else {
      showSnackbarError(`Không thể tải bình luận: ${response.error}`);
    }
  }, [post.id, offset, limit, hasMoreComments]);

  const handleToggleComments = useCallback(async () => {
    if (!showComments) {
      await loadComments();
    }
    setShowComments(!showComments);
  }, [showComments, loadComments]);

  const handleCreateComment = useCallback(async () => {
    if (!newComment.trim()) {
      showSnackbarError("Vui lòng nhập nội dung bình luận!");
      return;
    }

    const response = await createCommentApi.call({
      post_id: post.id,
      content: newComment,
      image_url: [],
    });

    if (response.data && typeof response.data === 'object' && 'id' in response.data) {
      setComments((prev) => [response.data as Comment, ...prev]);
      setCommentCount((prev) => prev + 1);
      setNewComment("");
      showSnackbarSuccess("Đã đăng bình luận!");
    } else {
      showSnackbarError(`Đăng bình luận thất bại: ${response.error}`);
    }
  }, [post.id, newComment]);

  useEffect(() => {
    SocketClient.on(
      "postLiked",
      (data: { postId: string; like_count: number }) => {
        if (data.postId === post.id) {
          setLikes(data.like_count);
        }
      },
    );

    SocketClient.on(
      "postUnliked",
      (data: { postId: string; like_count: number }) => {
        if (data.postId === post.id) {
          setLikes(data.like_count);
        }
      },
    );

    SocketClient.on("newComment", (data: Comment) => {
      if (data.post_id === post.id) {
        setComments((prev) => [data, ...prev]);
        setCommentCount((prev) => prev + 1);
      }
    });

    return () => {
      SocketClient.disconnect();
    };
  }, [post.id]);

  const handleLike = async () => {
    if (isLiked) {
      const response = await unlikePostApi.call(post.id);
      if (!response.error) {
        setIsLiked(false);
        setLikes((prev) => prev - 1);
        showSnackbarSuccess("Đã bỏ thích bài viết!");
      } else {
        showSnackbarError(`Bỏ thích thất bại: ${response.error}`);
      }
    } else {
      const response = await likePostApi.call(post.id);
      if (!response.error) {
        setIsLiked(true);
        setLikes((prev) => prev + 1);
        showSnackbarSuccess("Đã thích bài viết!");
      } else {
        showSnackbarError(`Thích bài viết thất bại: ${response.error}`);
      }
    }
  };

  const renderContent = (text: string) => {
    if (!text.includes("#")) return text;

    const parts = text.split(/(#\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("#")) {
        return (
          <Link
            key={index}
            href="#"
            sx={{ color: blue[500], textDecoration: "none" }}
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  const user = post.user_id || { name: "Unknown", photo_url: null };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          {user.photo_url ? (
            <Avatar src={user.photo_url} alt={user.name} />
          ) : (
            <Avatar sx={{ bgcolor: blue[500] }}>{user.name.charAt(0)}</Avatar>
          )}

          <Box>
            <Typography variant="subtitle1" fontWeight="medium">
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(post.created_at).toLocaleString()} •{" "}
              <Visibility
                sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5 }}
              />
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body1"
          sx={{
            whiteSpace: "pre-line",
            mb: 2,
          }}
        >
          {renderContent(post.content)}
        </Typography>

        {post.image_url && post.image_url.length > 0 && (
          <Box sx={{ mt: 1, mb: 2 }}>
            <Box
              component="img"
              src={post.image_url[0]}
              alt="Post image"
              sx={{
                width: "100%",
                borderRadius: "8px",
                maxHeight: "300px",
                objectFit: "cover",
              }}
            />
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",

            color: "text.secondary",
            mb: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {likes} lượt thích
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {commentCount} bình luận
          </Typography>
        </Box>

        <Divider />

        <Stack
          direction="row"
          spacing={1}
          justifyContent="space-between"
          sx={{ pt: 1 }}
        >
          <Button
            startIcon={<ThumbUp />}
            sx={{
              textTransform: "none",
              color: isLiked ? blue[500] : "text.secondary",
              flex: 1,
            }}
            onClick={handleLike}
            aria-label={`Like post, ${likes} likes`}
          >
            {likes > 0 ? likes : "Thích"}
          </Button>
          <Button
            startIcon={<ChatBubbleOutline />}
            sx={{
              textTransform: "none",
              color: "text.secondary",
              flex: 1,
            }}
            onClick={handleToggleComments}
            aria-label={`Comment on post, ${commentCount} comments`}
          >
            {commentCount > 0 ? commentCount : "Bình luận"}
          </Button>
          <Button
            startIcon={<Save />}
            sx={{
              textTransform: "none",
              color: "text.secondary",
              flex: 1,
            }}
            aria-label={`Save post`}
          >
            Lưu
          </Button>
        </Stack>

        {showComments && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            {/* Ô nhập bình luận */}
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Viết bình luận..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleCreateComment();
                  }
                }}
              />
              <IconButton color="primary" onClick={handleCreateComment}>
                <Send />
              </IconButton>
            </Box>

            {/* Danh sách bình luận */}
            {comments.length > 0 ? (
              <>
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
                {hasMoreComments && (
                  <Button onClick={loadComments} variant="text" sx={{ mt: 1 }}>
                    Tải thêm bình luận
                  </Button>
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa có bình luận nào.
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
