"use client";

import { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import PostItem from "./post-item";
import { usePostContext } from "@/contexts/forum/post-context";
import { Post } from "@/types/post";
import { SocketClient } from "@/api/forum/socket";
import useAppSnackbar from "@/hooks/use-app-snackbar";
import { useAuth } from "@/contexts/auth/firebase-context";
import { Typography } from "@mui/material";

interface PostListProps {
    tab: "default" | "followed" | "my-posts"; // Định nghĩa các tab
}

export default function PostList({ tab }: PostListProps) {
    const { getPostsApi, getFollowedPostsApi } = usePostContext();
    const { user } = useAuth();
    const { showSnackbarError } = useAppSnackbar();
    const [posts, setPosts] = useState<Post[]>([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const limit = 10;
    // Track loaded post IDs to prevent duplicates
    const [loadedPostIds, setLoadedPostIds] = useState<Set<string>>(new Set());

    // Helper function to add posts without duplicates
    const addUniquePosts = (newPosts: Post[]) => {
        setPosts(prevPosts => {
            // Create a map of existing posts by ID for quick lookup
            const existingPostsMap = new Map(prevPosts.map(post => [post.id, post]));

            // Add new posts to the map, overwriting any duplicates
            newPosts.forEach(post => {
                if (post && post.id) {
                    existingPostsMap.set(post.id, post);
                }
            });

            // Convert map values back to array
            return Array.from(existingPostsMap.values());
        });

        // Update the set of loaded post IDs
        setLoadedPostIds(prevIds => {
            const newIds = new Set(prevIds);
            newPosts.forEach(post => {
                if (post && post.id) {
                    newIds.add(post.id);
                }
            });
            return newIds;
        });
    };

    const loadPosts = async () => {
        if (!hasMore) return;

        let response;
        if (tab === "followed") {
            // Lấy bài viết của người mà người dùng đang theo dõi
            response = await getFollowedPostsApi.call({ offset, limit });
        } else if (tab === "my-posts" && user) {
            // Lấy bài viết của người dùng hiện tại
            response = await getPostsApi.call({ offset, limit, user_id: user.id });
        } else {
            // Tab "Đề xuất" (mặc định): Lấy tất cả bài viết
            response = await getPostsApi.call({ offset, limit });
        }

        if (response.data) {
            const newPosts = response.data.data || [];
            addUniquePosts(newPosts);
            setOffset(offset + limit);
            setHasMore(newPosts.length === limit);
        } else {
            showSnackbarError(`Không thể tải bài viết: ${response.error}`);
        }
    };

    useEffect(() => {
        // Reset state when tab changes
        setPosts([]);
        setOffset(0);
        setHasMore(true);
        setLoadedPostIds(new Set());
        loadPosts();
    }, [tab]);

    useEffect(() => {
        // Socket event handler for new posts
        const handleNewPost = (newPost: Post) => {
            // Only add if we don't already have this post
            if (!loadedPostIds.has(newPost.id)) {
                if (tab === "default") {
                    addUniquePosts([newPost]);
                } else if (tab === "my-posts" && user && newPost.user_id?.id === user.id) {
                    addUniquePosts([newPost]);
                }
            }
        };

        // Set up socket listener
        SocketClient.on("newPost", handleNewPost);

        // Clean up socket connection
        return () => {
            // We can't remove individual event listeners with SocketClient
            // So we'll just disconnect the socket when the component unmounts
            SocketClient.disconnect();
        };
    }, [tab, user, loadedPostIds]);

    return (
        <Box>
            {posts.length > 0 ? (
                <>
                    {posts.map((post) => (
                        <PostItem key={post.id} post={post} />
                    ))}
                    {hasMore && (
                        <Button onClick={loadPosts} variant="outlined" sx={{ mt: 2 }}>
                            Tải thêm
                        </Button>
                    )}
                </>
            ) : (
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                    Chưa có bài viết nào.
                </Typography>
            )}
        </Box>
    );
}