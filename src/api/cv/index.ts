import { apiGet, apiPost } from "@/utils/api-request";
import { IBaseResponse } from "@/types/apis";
import { CvItemDto, UploadCvResponseDto } from "@/types/cv";

export default class CvApi {
  static async getMyCvs(): Promise<IBaseResponse<CvItemDto[]>> {
    return await apiGet("/cv");
  }

  //   /**
  //    * Upload file CV mới (PDF/DOCX) lên hệ thống
  //    * POST /cvs/upload
  //    */
  //   static async uploadCv(
  //     file: File,
  //   ): Promise<IBaseResponse<UploadCvResponseDto>> {
  //     const formData = new FormData();
  //     formData.append("file", file);

  //     return await apiPost("/cvs/upload", formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });
  //   }
}
