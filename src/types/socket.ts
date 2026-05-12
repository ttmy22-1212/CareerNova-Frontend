import { Post } from "./post";
import { Comment } from "./comment";
import { Notification } from "./notification";

// Định nghĩa các sự kiện mà server gửi tới client
export interface ServerToClientEvents {
  newPost: (post: Post) => void;
  newComment: (comment: Comment) => void;
  postLiked: (data: { postId: string; like_count: number }) => void;
  postUnliked: (data: { postId: string; like_count: number }) => void;
  newNotification: (notification: Notification) => void;
}

// Định nghĩa các sự kiện mà client gửi tới server
export interface ClientToServerEvents {
  joinPostRoom: (postId: string) => void;
  leavePostRoom: (postId: string) => void;
}