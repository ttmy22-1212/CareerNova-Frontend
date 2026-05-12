export enum NotificationType {
  NEW_POST = "NEW_POST",
  NEW_COMMENT = "NEW_COMMENT",
  NEW_LIKE = "NEW_LIKE",
  NEW_FOLLOW = "NEW_FOLLOW",
}

export interface Notification {
  id: string;
  user_id: {
    id: string;
    name: string;
    photo_url: string;
  };
  sender_id: {
    id: string;
    name: string;
    photo_url: string;
  };
  post_id?: {
    id: string;
    content: string;
  };
  comment_id?: {
    id: string;
    content: string;
  };
  type: NotificationType;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  data: Notification[];
  total: number;
}