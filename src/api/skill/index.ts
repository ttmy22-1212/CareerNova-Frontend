import { apiGet } from "@/utils/api-request";
import { SkillItem } from "@/types/skill";

export class SkillApi {
  static async getSkills(): Promise<SkillItem[]> {
    return await apiGet("/skills");
  }
}
