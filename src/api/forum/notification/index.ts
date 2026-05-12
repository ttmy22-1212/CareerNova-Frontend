import { apiGet, apiPatch, removeUndefinedKeys } from "@/utils/api-request";
import { ResponseWithTotal } from "@/types";
import { Notification } from "@/types/notification";

export type NotificationResponse = ResponseWithTotal<NotificationResponse[]>;

export class NotificationApi {
  static async getNotifications(params: {
    offset?: number;
    limit?: number;
  }): Promise<NotificationResponse> {
    return await apiGet("/notifications", removeUndefinedKeys(params));
  }

  static async markAsRead(id: string): Promise<void> {
    return await apiPatch(`/notifications/${id}/read`, {});
  }

  static async markAllAsRead(): Promise<void> {
    return await apiPatch("/notifications/read-all", {});
  }
}