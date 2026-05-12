export interface Comment {
  id: string;
  user_id: {
    id: string;
    name: string;
    photo_url?: string; // Thêm optional để khớp với backend
    company?: string;
    location?: string;
  };
  post_id: string;
  content: string;
  image_url: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  deleted_by?: string;
}

export interface CommentResponse {
  data: Comment[];
  total: number;
}