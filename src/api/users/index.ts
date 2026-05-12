import type {
  User,
  UserOnboarding,
  UserTopicProgress,
  UserTopicStatus,
} from "@/types/user";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "@/utils/api-request";

type SignInResponse = Promise<{
  data: User;
  token: string;
}>;

type LoginFirebaseRequest = { id_token: string };

export default class UsersApi {
  static async loginFirebase(request: LoginFirebaseRequest): SignInResponse {
    return await apiPost("/users/login", request);
  }

  static async me(): Promise<User> {
    return await apiGet("/users/info");
  }

  static async updatePassword(payload: {
    old_password: string;
    new_password: string;
  }): Promise<User> {
    return await apiPost("/users/password", payload);
  }

  static async userOnboarding(
    payload: UserOnboarding,
  ): Promise<UserOnboarding> {
    return await apiPost("/users/onboarding", payload);
  }

  static async updateProfile(payload: Partial<User>): Promise<User> {
    return await apiPut("/users/info", payload);
  }

  static async getUserTopics(): Promise<UserTopicProgress[]> {
    return await apiGet("/users/topics");
  }

  static async getTopicProgressByTopicId(
    topicId: string,
  ): Promise<UserTopicProgress[]> {
    return await apiGet(`/users/topics/${topicId}/progress`);
  }

  static async createTopicProgress({
    topicId,
    status,
    notes,
    rating,
  }: {
    topicId: string;
    status?: UserTopicStatus;
    notes?: string;
    rating?: number;
  }): Promise<void> {
    return await apiPut(`/users/topics/${topicId}/progress`, {
      status,
      notes,
      rating,
    });
  }

  static async deleteTopicProgress(topicId: string): Promise<{
    message: string;
  }> {
    return await apiDelete(`/users/topics/${topicId}/progress`, {});
  }

  static async addOrUpdateSkills(payload: { skills: string[] }): Promise<User> {
    return await apiPut("/users/skills", payload);
  }

  static async removeSkills(payload: { skills: string[] }): Promise<User> {
    return await apiDelete("/users/skills", payload);
  }
}
