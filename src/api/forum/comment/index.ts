import { Comment } from "@/types/comment";
import { apiGet, apiPost, removeUndefinedKeys } from "@/utils/api-request";
import { ResponseWithTotal } from "@/types";

export type CommentResponse = ResponseWithTotal<Comment[]>;

export class CommentApi {
  static async getComments(params: {
    offset?: number;
    limit?: number;
    key?: string;
    post_id?: string;
  }): Promise<CommentResponse> {
    return await apiGet("/comments", removeUndefinedKeys(params));
  }

  static async createComment(comment: { content: string; post_id: string; image_url?: string[] }): Promise<Comment> {
    return await apiPost("/comments", comment);
  }
}