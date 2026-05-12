import type { JobWithDetails, UserProfile, UserSkill } from "../types/database";

export interface SkillMatch {
  skill_name: string;
  skill_id: number;
  required: boolean;
  user_proficiency: number | null;
  years_experience: number | null;
  match_level: "strong" | "partial" | "missing";
  match_score: number; // 0-100
}

export interface JobMatchResult {
  job: JobWithDetails;
  overall_score: number;
  skill_matches: SkillMatch[];
  matched_skills_count: number;
  total_required_skills: number;
  missing_critical_skills: string[];
}

/**
 * Calculate match score between user skills and a job
 */
export function calculateJobMatch(job: JobWithDetails, userProfile: UserProfile): JobMatchResult {
  const skillMatches: SkillMatch[] = [];

  // Get required skills (non-inferred are required, inferred are nice-to-have)
  const requiredSkills = job.skills.filter(s => !s.is_inferred);
  const preferredSkills = job.skills.filter(s => s.is_inferred);

  // Process required skills
  for (const jobSkill of requiredSkills) {
    const userSkill = userProfile.skills.find(us => us.skill_id === jobSkill.skill_id);

    if (userSkill) {
      const matchScore = calculateSkillMatchScore(userSkill.proficiency_level, userSkill.years_experience);
      skillMatches.push({
        skill_name: jobSkill.skill_name,
        skill_id: jobSkill.skill_id,
        required: true,
        user_proficiency: userSkill.proficiency_level,
        years_experience: userSkill.years_experience,
        match_level: matchScore >= 80 ? "strong" : matchScore >= 50 ? "partial" : "missing",
        match_score: matchScore,
      });
    } else {
      skillMatches.push({
        skill_name: jobSkill.skill_name,
        skill_id: jobSkill.skill_id,
        required: true,
        user_proficiency: null,
        years_experience: null,
        match_level: "missing",
        match_score: 0,
      });
    }
  }

  // Process preferred skills
  for (const jobSkill of preferredSkills) {
    const userSkill = userProfile.skills.find(us => us.skill_id === jobSkill.skill_id);

    if (userSkill) {
      const matchScore = calculateSkillMatchScore(userSkill.proficiency_level, userSkill.years_experience);
      skillMatches.push({
        skill_name: jobSkill.skill_name,
        skill_id: jobSkill.skill_id,
        required: false,
        user_proficiency: userSkill.proficiency_level,
        years_experience: userSkill.years_experience,
        match_level: matchScore >= 80 ? "strong" : "partial",
        match_score: matchScore,
      });
    } else {
      skillMatches.push({
        skill_name: jobSkill.skill_name,
        skill_id: jobSkill.skill_id,
        required: false,
        user_proficiency: null,
        years_experience: null,
        match_level: "missing",
        match_score: 0,
      });
    }
  }

  // Calculate overall score
  const requiredMatches = skillMatches.filter(sm => sm.required);
  const requiredScore = requiredMatches.length > 0
    ? requiredMatches.reduce((sum, sm) => sum + sm.match_score, 0) / requiredMatches.length
    : 0;

  const preferredMatches = skillMatches.filter(sm => !sm.required);
  const preferredScore = preferredMatches.length > 0
    ? preferredMatches.reduce((sum, sm) => sum + sm.match_score, 0) / preferredMatches.length
    : 0;

  // Weight: 80% required, 20% preferred
  const overall_score = Math.round(requiredScore * 0.8 + preferredScore * 0.2);

  const matched_skills_count = skillMatches.filter(sm => sm.match_level !== "missing").length;
  const missing_critical_skills = skillMatches
    .filter(sm => sm.required && sm.match_level === "missing")
    .map(sm => sm.skill_name);

  return {
    job,
    overall_score,
    skill_matches: skillMatches,
    matched_skills_count,
    total_required_skills: requiredSkills.length,
    missing_critical_skills,
  };
}

/**
 * Calculate a skill match score based on proficiency and experience
 */
function calculateSkillMatchScore(proficiency: number, yearsExperience: number): number {
  // Weight: 70% proficiency, 30% experience (capped at 5 years = 100%)
  const proficiencyScore = proficiency;
  const experienceScore = Math.min((yearsExperience / 5) * 100, 100);
  return Math.round(proficiencyScore * 0.7 + experienceScore * 0.3);
}

/**
 * Get all jobs with match scores, sorted by match score
 */
export function getMatchedJobs(jobs: JobWithDetails[], userProfile: UserProfile): JobMatchResult[] {
  return jobs
    .map(job => calculateJobMatch(job, userProfile))
    .sort((a, b) => b.overall_score - a.overall_score);
}

/**
 * Get skill gap analysis across all jobs in target roles
 */
export function analyzeSkillGaps(jobs: JobWithDetails[], userProfile: UserProfile) {
  const skillFrequency = new Map<number, { skill_name: string; count: number; category: string | null; type: string | null }>();

  // Count skill frequency across all jobs
  for (const job of jobs) {
    for (const skill of job.skills) {
      const existing = skillFrequency.get(skill.skill_id);
      if (existing) {
        existing.count++;
      } else {
        skillFrequency.set(skill.skill_id, {
          skill_name: skill.skill_name,
          count: 1,
          category: skill.category,
          type: skill.type,
        });
      }
    }
  }

  // Identify gaps
  const gaps: Array<{
    skill_id: number;
    skill_name: string;
    category: string | null;
    type: string | null;
    demand_percentage: number;
    user_has: boolean;
    user_proficiency: number | null;
    priority: "critical" | "high" | "medium" | "low";
  }> = [];

  skillFrequency.forEach((data, skillId) => {
    const demandPercentage = (data.count / jobs.length) * 100;
    const userSkill = userProfile.skills.find(us => us.skill_id === skillId);
    const userHas = !!userSkill;
    const userProficiency = userSkill?.proficiency_level ?? null;

    // Determine priority
    let priority: "critical" | "high" | "medium" | "low";
    if (!userHas && demandPercentage >= 60) priority = "critical";
    else if (!userHas && demandPercentage >= 40) priority = "high";
    else if (userProficiency && userProficiency < 60 && demandPercentage >= 40) priority = "high";
    else if (!userHas) priority = "medium";
    else priority = "low";

    gaps.push({
      skill_id: skillId,
      skill_name: data.skill_name,
      category: data.category,
      type: data.type,
      demand_percentage: Math.round(demandPercentage),
      user_has: userHas,
      user_proficiency: userProficiency,
      priority,
    });
  });

  // Sort by priority and demand
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  gaps.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.demand_percentage - a.demand_percentage;
  });

  return gaps;
}

/**
 * Format salary for display
 */
export function formatSalary(min: number | null | undefined, max: number | null | undefined, currency = "USD"): string {
  if (!min && !max) return "Not specified";

  const formatNum = (n: number) => {
    if (n >= 1000) return `$${Math.round(n / 1000)}K`;
    return `$${n}`;
  };

  if (min && max) {
    return `${formatNum(min)}–${formatNum(max)}`;
  }
  if (min) return `From ${formatNum(min)}`;
  if (max) return `Up to ${formatNum(max)}`;
  return "Not specified";
}

/**
 * Format date to relative time
 */
export function formatRelativeTime(date: Date | null | undefined): string {
  if (!date) return "Unknown";

  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}
