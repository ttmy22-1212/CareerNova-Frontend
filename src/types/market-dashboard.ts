// ==========================================
// 1. FILTER PAYLOAD & OPTIONS INTERFACES
// ==========================================

export interface DashboardFilterDto {
  location?: string;
  time_range: "7days" | "14days" | "30days";
  work_type?:
    | "full_time"
    | "part_time"
    | "contract"
    | "internship"
    | "remote"
    | "hybrid";
}

export interface FilterOptionDto {
  label: string;
  value: string;
}

export interface DashboardFiltersOptionsData {
  locations: FilterOptionDto[];
  time_ranges: FilterOptionDto[];
  work_types: FilterOptionDto[];
}

export interface DashboardFiltersOptionsResponseDto {
  data: DashboardFiltersOptionsData;
}

// ==========================================
// 2. STATS CARDS INTERFACES
// ==========================================

export interface StatsCardData {
  active_jobs: {
    count: number;
    growth_percentage: number;
  };
  avg_it_salary: {
    average: number;
    min: number;
    max: number;
  };
  companies_hiring: {
    count: number;
  };
  market_growth: {
    yoy_percentage: number;
  };
}

export interface StatsCardResponseDto {
  data: StatsCardData;
}

// ==========================================
// 3. JOB TRENDS INTERFACES
// ==========================================

export interface TrendDataPointDto {
  label: string;
  total_postings: number;
  remote_jobs: number;
}

export interface JobPostingTrendsData {
  x_axis_scale: "hour" | "day" | "week" | "month";
  data: TrendDataPointDto[];
}

export interface JobPostingTrendsResponseDto {
  data: JobPostingTrendsData;
}

// ==========================================
// 4. INDUSTRY BREAKDOWN INTERFACES
// ==========================================

export interface IndustryItemDto {
  category_name: string;
  industry_name?: string;
  count: number;
  percentage: number;
}

export interface IndustryBreakdownResponseDto {
  data: IndustryItemDto[];
}

// ==========================================
// 5. HOT JOBS INTERFACES
// ==========================================

export interface HotJobItemDto {
  job_id: string;
  title: string;
  company_name: string | null;
  location: string | null;
  work_type: string | null;
  job_category: string;
  save_count: number;
  job_count: number;
  avg_salary: number;
}

export interface HotJobsResponseDto {
  data: HotJobItemDto[];
}

// ==========================================
// 6. SALARY RANGES INTERFACES
// ==========================================

export interface SalaryRangeItemDto {
  role: string;
  min_salary: number;
  max_salary: number;
  currency: string;
}

export interface SalaryRangesResponseDto {
  data: SalaryRangeItemDto[];
}

// ==========================================
// 7. SKILLS INTERFACES (IN-DEMAND & RISING)
// ==========================================

export interface InDemandSkillItemDto {
  skill_id: number;
  skill_name: string;
  job_count: number;
}

export interface InDemandSkillsResponseDto {
  data: InDemandSkillItemDto[];
}

export interface RisingSkillItemDto {
  skill_id: number;
  skill_name: string;
  job_count_current: number;
  avg_salary: number;
  growth_percentage: number;
}

export interface RisingSkillsResponseDto {
  data: RisingSkillItemDto[];
}
