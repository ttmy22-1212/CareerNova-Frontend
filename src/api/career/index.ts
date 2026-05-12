import { ResponseWithTotal } from "@/types";
import { Career, CareerAnalytics, CareerList } from "@/types/career";
import { apiGet, removeUndefinedKeys } from "@/utils/api-request";

export type GetCareerRequest = {
  offset?: number;
  limit?: number;
  key?: string;
  skills?: string | string[];
  salary_min?: number;
  salary_max?: number;
  experience_min?: number;
  experience_max?: number;
  major?: string;
};

export class CareerApi {
  static async getCareers(
    request: GetCareerRequest,
  ): Promise<ResponseWithTotal<CareerList[]>> {
    return await apiGet("/careers", removeUndefinedKeys(request));
  }

  static async getCareerById(id: string): Promise<Career> {
    return await apiGet(`/careers/${id}`);
  }

  static async getCareerAnalytics(id: string): Promise<CareerAnalytics[]> {
    return await apiGet(`/careers/${id}/future`);
  }

  static async getCareerDetailById(id: string): Promise<{
    guidance: {
      guidance: string;
    };
  }> {
    return await apiGet(`/careers/${id}/detail`);
  }
}
