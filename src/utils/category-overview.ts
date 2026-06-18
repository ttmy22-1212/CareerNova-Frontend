import MatchingApi from "@/api/matching";

const norm = (v: unknown) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.round(n <= 1 ? n * 100 : n), 100);
};

export interface OverviewPoint {
  subject: string;
  you: number;
  required: number;
}

/**
 * Tính điểm trung bình theo từng nhóm kỹ năng (cho radar "tổng quan theo nhóm").
 * Gọi getRadarByCategory cho mỗi nhóm đã match rồi lấy trung bình similarity.
 * Trả [] nếu <2 nhóm (không đủ để vẽ overview).
 */
export async function buildCategoryOverview(
  matchId: string,
  categories: { category: string; is_matched?: boolean }[],
): Promise<OverviewPoint[]> {
  const matched = categories.filter(
    (c) => c.is_matched && c.category && c.category !== "All",
  );
  if (matched.length < 2) return [];

  const results = await Promise.all(
    matched.map((c) =>
      MatchingApi.getRadarByCategory(matchId, c.category).catch(() => null),
    ),
  );

  return results
    .map((res, i) => {
      const gap = (res?.data?.gap_report as any) || {};
      const skills = [
        ...(res?.data?.radar_data || []),
        ...(gap.partially_matched_skills || []),
        ...(gap.missing_skills || []),
      ];
      if (!skills.length) return null;
      const avg =
        skills.reduce((sum: number, s: any) => sum + norm(s.similarity), 0) /
        skills.length;
      return {
        subject: matched[i].category,
        you: Math.round(avg),
        required: 100,
      };
    })
    .filter(Boolean) as OverviewPoint[];
}
