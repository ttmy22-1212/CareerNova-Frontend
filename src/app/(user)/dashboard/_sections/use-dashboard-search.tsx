import { useEffect, useMemo, useState } from "react";
import {
  getStatsFilterConfig,
  StatisticFilter,
  statsOptions,
} from "./filter-config";
import useFunction from "@/hooks/use-function";
import { JobPostingsApi } from "@/api/job-postings";

const useDashboardSearch = ({ isMobile }: { isMobile?: boolean }) => {
  const getPositionStatsApi = useFunction(JobPostingsApi.getPositionStats, {
    disableResetOnCall: true,
  });
  const getTopCompaniesByJobPostingsApi = useFunction(
    JobPostingsApi.getTopCompaniesByJobPostings,
    {
      disableResetOnCall: true,
    },
  );
  const getJobPostingsByExperienceLevelApi = useFunction(
    JobPostingsApi.getJobPostingsByExperienceLevel,
    {
      disableResetOnCall: true,
    },
  );
  const getTopSkillsDemandStatsApi = useFunction(
    JobPostingsApi.getTopSkillsDemandStats,
    {
      disableResetOnCall: true,
    },
  );
  const getJobPostingsHeatmapApi = useFunction(
    JobPostingsApi.getJobPostingsHeatmap,
    {
      disableResetOnCall: true,
    },
  );

  const [filter, setFilter] = useState<StatisticFilter>({
    date: {
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
    },
    region: "all",
  });

  const filterConfig = useMemo(
    () =>
      getStatsFilterConfig({
        options: statsOptions,
        isMobile,
      }),
    [],
  );

  useEffect(() => {
    getPositionStatsApi.call({
      date_from: filter.date?.startDate,
      date_to: filter.date?.endDate,
      region: filter.region === "all" ? undefined : filter.region,
    });
    getTopCompaniesByJobPostingsApi.call({
      date_from: filter.date?.startDate,
      date_to: filter.date?.endDate,
      region: filter.region === "all" ? undefined : filter.region,
    });
    getJobPostingsByExperienceLevelApi.call({
      date_from: filter.date?.startDate,
      date_to: filter.date?.endDate,
      region: filter.region === "all" ? undefined : filter.region,
    });
    getTopSkillsDemandStatsApi.call({
      date_from: filter.date?.startDate,
      date_to: filter.date?.endDate,
      region: filter.region === "all" ? undefined : filter.region,
    });
    getJobPostingsHeatmapApi.call({
      date_from: filter.date?.startDate,
      date_to: filter.date?.endDate,
      region: filter.region === "all" ? undefined : filter.region,
    });
  }, [filter.date?.endDate, filter.date?.startDate, filter.region]);

  const positionStats = useMemo(
    () => getPositionStatsApi.data || [],
    [getPositionStatsApi.data],
  );

  const topCompaniesByJobPostings = useMemo(
    () => getTopCompaniesByJobPostingsApi.data || [],
    [getTopCompaniesByJobPostingsApi.data],
  );

  const jobPostingsByExperienceLevel = useMemo(
    () => getJobPostingsByExperienceLevelApi.data || [],
    [getJobPostingsByExperienceLevelApi.data],
  );

  const topSkillsDemandStats = useMemo(
    () => getTopSkillsDemandStatsApi.data || [],
    [getTopSkillsDemandStatsApi.data],
  );

  const jobPostingsHeatmap = useMemo(
    () => getJobPostingsHeatmapApi.data || [],
    [getJobPostingsHeatmapApi.data],
  );

  return {
    filter,
    setFilter,
    filterConfig,
    positionStats,
    topCompaniesByJobPostings,
    jobPostingsByExperienceLevel,
    topSkillsDemandStats,
    jobPostingsHeatmap,
    getJobPostingsHeatmapApi,
    getTopSkillsDemandStatsApi,
    getJobPostingsByExperienceLevelApi,
    getTopCompaniesByJobPostingsApi,
    getPositionStatsApi,
  };
};

export default useDashboardSearch;
