export interface CvItemDto {
  cv_id: string;
  file_name: string;
  createdAt: string;
}

export interface UploadCvResponseDto {
  cv_id: string;
  file_name: string;
  file_url: string;
  message: string;
}

export interface MyCvsResponseDto {
  statusCode: number;
  message: string;
  data: CvItemDto[];
}
