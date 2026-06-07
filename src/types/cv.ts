export interface CvItemDto {
  cv_id: string;
  file_name: string;
  file_url: string;
  createdAt: string;
}

export interface UploadCvResponseDto {
  cv_id: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

export interface MyCvsResponseDto {
  statusCode: number;
  message: string;
  data: CvItemDto[];
}

export interface SyncProfileSkillsPayload {
  cv_id: string | null;
  skills: string[];
}

export interface SyncProfileSkillsResponse {
  message: string;
  cv_id: string;
  synced_count: number;
}
