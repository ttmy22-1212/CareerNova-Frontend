import { apiGet } from "@/utils/api-request";
import { Skill } from "@/types/skill";

export class SkillApi {
  static async getSkills(): Promise<Skill[]> {
    return await apiGet("/skills");
  }
}
