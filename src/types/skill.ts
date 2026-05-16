export interface SkillItem {
  skill_id: number;
  skill_name: string;
}

export interface GetSkillsResponse {
  data: SkillItem[];
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
