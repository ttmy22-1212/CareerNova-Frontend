export interface Post {
  id: string;
  user_id: {
    id: string;
    name: string;
    photo_url?: string; 
    company?: string;
    location?: string;
  };
  content: string;
  image_url: string[];
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  deleted_by?: string;
  comments?: Comment[];
}

export interface PostResponse {
  data: Post[];
  total: number;
}