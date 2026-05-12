"use client";

import { Typography, Box, useMediaQuery, useTheme } from "@mui/material";
import { Stack } from "@mui/material";
import RecruitmentHeatmap from "./recruitment-heatmap";
import TopPositions from "./top-positions";
import TopCompanies from "./top-companies";
import ExperienceLevelChart from "./experience-level-chart";
import InDemandSkills from "./in-demand-skills";
import { neutral } from "@/theme/colors";
import RowStack from "@/components/row-stack";
import { StatisticFilter } from "./filter-config";
import CustomFilter from "@/components/custom-filter";
import useDashboardSearch from "./use-dashboard-search";

export default function DashboardContent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const {
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
  } = useDashboardSearch({ isMobile });

  return (
    <Stack sx={{ bgcolor: neutral[50], minHeight: "100vh", pb: 4 }}>
      <Stack>
        <RowStack
          justifyContent="space-between"
          sx={{
            my: { xs: 2, sm: 3 },
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            gap: isMobile ? 2 : 0,
          }}
        >
          <Typography
            variant={isMobile ? "h4" : "h3"}
            component="h1"
            fontWeight="bold"
            sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" } }}
          >
            Xu hướng tuyển dụng IT
          </Typography>
          <Box width={isMobile ? "100%" : 444}>
            <CustomFilter
              configs={filterConfig}
              filter={filter}
              onChange={(filter) => {
                setFilter(filter as StatisticFilter);
              }}
            />
          </Box>
          {/* <DashboardFilters onFilterChange={handleFilterChange} /> */}
        </RowStack>

        {/* Heatmap Section - Full Width */}
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            p: { xs: 2, sm: 3 },
            mb: { xs: 2, sm: 3 },
            boxShadow: `0 1px 3px ${neutral[300]}`,
            overflowX: "auto",
          }}
        >
          <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
            Tin tuyển dụng IT
          </Typography>
          <RecruitmentHeatmap data={jobPostingsHeatmap} />
        </Box>

        {/* Top Positions and Top Companies - First Row, Full Width */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, sm: 3 },
            mb: { xs: 2, sm: 3 },
            width: "100%",
          }}
        >
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              p: { xs: 2, sm: 3 },
              flex: 1,
              boxShadow: `0 1px 3px ${neutral[300]}`,
            }}
          >
            <TopPositions
              data={positionStats}
              loading={getPositionStatsApi.loading}
            />
          </Box>
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              p: { xs: 2, sm: 3 },
              flex: 1,
              boxShadow: `0 1px 3px ${neutral[300]}`,
            }}
          >
            <TopCompanies data={topCompaniesByJobPostings} />
          </Box>
        </Box>

        {/* Experience Level and In-Demand Skills - Second Row */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, sm: 3 },
            width: "100%",
          }}
        >
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              p: { xs: 2, sm: 3 },
              flex: 4,
              boxShadow: `0 1px 3px ${neutral[300]}`,
              width: "100%",
            }}
          >
            <ExperienceLevelChart data={jobPostingsByExperienceLevel} />
          </Box>
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              p: { xs: 2, sm: 3 },
              flex: 8,
              boxShadow: `0 1px 3px ${neutral[300]}`,
              width: "100%",
            }}
          >
            <InDemandSkills
              data={topSkillsDemandStats}
              loading={getTopSkillsDemandStatsApi.loading}
            />
          </Box>
        </Box>
      </Stack>
    </Stack>
  );
}
