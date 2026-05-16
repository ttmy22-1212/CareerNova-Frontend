import { apiGet, apiPost } from "@/utils/api-request";
import { IBaseResponse } from "@/types/apis";
import {
  CvItemDto,
  UploadCvResponseDto,
  SyncProfileSkillsPayload,
  SyncProfileSkillsResponse,
} from "@/types/cv";

export default class CvApi {
  static async getMyCvs(): Promise<IBaseResponse<CvItemDto[]>> {
    return await apiGet("/cv");
  }

  static async uploadCv(
    file: File,
  ): Promise<IBaseResponse<UploadCvResponseDto>> {
    const formData = new FormData();
    formData.append("file", file);
    return await apiPost("/cv/upload", formData);
  }

  static async syncProfileSkills(
    payload: SyncProfileSkillsPayload,
  ): Promise<IBaseResponse<SyncProfileSkillsResponse>> {
    return await apiPost("/cv/profile-skills", payload);
  }
}
