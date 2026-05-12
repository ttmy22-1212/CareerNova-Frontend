import { ResponseWithTotal } from "@/types";
import { Topic } from "@/types/topic";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  removeUndefinedKeys,
} from "@/utils/api-request";

export type TopicResponse = ResponseWithTotal<Topic[]>;

export class TopicApi {
  static async getTopics(params: {
    page?: number;
    limit?: number;
    key?: string;
  }): Promise<TopicResponse> {
    return await apiGet("/topics", removeUndefinedKeys(params));
  }

  

  static async getTopicById(id: string): Promise<{
    topic: Topic;
    childs: Topic[];
    parent: Topic | null;
  }> {
    return await apiGet(`/topics/${id}`);
  }

  static async createTopic(topic: Omit<Topic, "id">): Promise<Topic> {
    return await apiPost("/topics", topic);
  }

  static async updateTopic(topic: Topic): Promise<Topic> {
    return await apiPut(`/topics/${topic.id}`, topic);
  }

  static async deleteTopic(id: string): Promise<void> {
    return await apiDelete(`/topics/${id}`, {});
  }
}
