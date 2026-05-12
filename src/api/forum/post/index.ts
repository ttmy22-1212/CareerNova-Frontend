import { Post } from "@/types/post";
import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  removeUndefinedKeys,
} from "@/utils/api-request";

export interface PostResponse {
  data: Post[];
  total: number;
}

export class PostApi {
  static async getPosts(params: {
    offset?: number;
    limit?: number;
    key?: string;
    user_id?: string;
  }): Promise<PostResponse> {
    return await apiGet("/posts", removeUndefinedKeys(params));
  }

  static async getFollowedPosts(params: {
    offset?: number;
    limit?: number;
    key?: string;
  }): Promise<PostResponse> {
    return await apiGet("/posts/followed", removeUndefinedKeys(params));
  }

  static async getPostById(id: string): Promise<Post> {
    return await apiGet(`/posts/${id}`);
  }

  static async createPost(post: {
    content: string;
    image_url?: string[];
  }): Promise<Post> {
    return await apiPost("/posts", post);
  }

  static async updatePost(
    id: string,
    post: { content: string; image_url?: string[] },
  ): Promise<Post> {
    return await apiPut(`/posts/${id}`, post);
  }

  static async removePost(id: string): Promise<void> {
    return await apiDelete(`/posts/${id}`, {});
  }

  static async likePost(id: string): Promise<void> {
    return await apiPost(`/posts/${id}/like`, {});
  }

  static async unlikePost(id: string): Promise<void> {
    return await apiPost(`/posts/${id}/unlike`, {});
  }

  static async savePost(id: string): Promise<void> {
    return await apiPost(`/posts/${id}/save`, {});
  }

  static async unsavePost(id: string): Promise<void> {
    return await apiPost(`/posts/${id}/unsave`, {});
  }

  static async checkSaved(id: string): Promise<{ isSaved: boolean }> {
    return await apiGet(`/posts/${id}/check-saved`);
  }
}
