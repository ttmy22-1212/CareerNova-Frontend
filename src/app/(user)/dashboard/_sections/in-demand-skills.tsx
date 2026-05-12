"use client";

import { useMemo } from "react";
import {
  Paper,
  Box,
  Typography,
  Link,
  Grid,
  useTheme,
  alpha,
  Card,
  CircularProgress,
  Tooltip,
  Stack,
} from "@mui/material";
import RowStack from "@/components/row-stack";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import BalanceIcon from "@mui/icons-material/Balance";
import { SkillDemandStats } from "@/api/job-postings";
import { InfoOutlined } from "@mui/icons-material";

interface SkillData {
  name: string;
  recruitment_demand: number;
  applicant_percentage: number;
}

interface InDemandSkillsProps {
  data: SkillDemandStats[];
  loading?: boolean;
}

const getComparisonColor = (demand: number, applicant: number) => {
  const ratio = demand / applicant;
  if (ratio > 1.1) return "success";
  if (ratio < 0.9) return "error";
  return "warning";
};

const getComparisonMessage = (demand: number, applicant: number) => {
  const ratio = demand / applicant;
  if (ratio > 1.1) return "Cơ hội cao";
  if (ratio < 0.9) return "Cạnh tranh cao";
  return "Cân bằng";
};

export default function InDemandSkills({ loading, data }: InDemandSkillsProps) {
  const theme = useTheme();

  const SkillCardSkeleton = () => (
    <Card
      sx={{
        p: 2,
        height: "100%",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(90deg, ${alpha(
          theme.palette.background.paper,
          0.6,
        )} 0%, ${alpha(theme.palette.background.paper, 0.9)} 50%, ${alpha(
          theme.palette.background.paper,
          0.6,
        )} 100%)`,
        backgroundSize: "200% 100%",
        animation: "shimmer 2s infinite",
        "@keyframes shimmer": {
          "0%": {
            backgroundPosition: "-200% 0",
          },
          "100%": {
            backgroundPosition: "200% 0",
          },
        },
      }}
    >
      <Box
        sx={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          mb: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
        }}
      />
      <Box
        sx={{
          width: "70%",
          height: 24,
          bgcolor: alpha(theme.palette.text.primary, 0.1),
          borderRadius: 1,
          mb: 1,
        }}
      />
      <Box
        sx={{
          width: "40%",
          height: 16,
          bgcolor: alpha(theme.palette.text.primary, 0.1),
          borderRadius: 1,
        }}
      />
    </Card>
  );

  if (loading) {
    return (
      <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box p={2}>
          <RowStack justifyContent="space-between" mb={2}>
            <Box
              sx={{
                width: "60%",
                height: 28,
                bgcolor: alpha(theme.palette.text.primary, 0.1),
                borderRadius: 1,
              }}
            />
            <Box
              sx={{
                width: "10%",
                height: 20,
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                borderRadius: 1,
              }}
            />
          </RowStack>
        </Box>

        <Box p={2}>
          <Grid container spacing={2}>
            {[...Array(5)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                <SkillCardSkeleton />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
      <Box p={2}>
        <RowStack justifyContent="space-between" mb={2}>
          <Typography
            variant="h6"
            fontWeight="medium"
            sx={{ whiteSpace: "nowrap" }}
          >
            Những kỹ năng cứng hàng đầu đang được yêu cầu
          </Typography>
          <Tooltip
            placement="top"
            title={
              <Stack>
                <Typography variant="body2">
                  • Nhu cầu: Tỷ lệ phần trăm các công việc yêu cầu kỹ năng này
                </Typography>
                <Typography variant="body2">
                  • Ứng viên: Tỷ lệ phần trăm ứng viên có kỹ năng này
                </Typography>
              </Stack>
            }
          >
            <InfoOutlined sx={{ color: "action.active" }} />
          </Tooltip>
        </RowStack>

        <Grid container spacing={2}>
          {data.map((skill, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card
                sx={{
                  p: 2,
                  height: "100%",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: theme.shadows[3],
                    transform: "translateY(-4px)",
                  },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Box sx={{ position: "relative", mb: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={skill.recruitment_demand}
                    size={100}
                    thickness={4}
                    sx={{ color: theme.palette.success.main }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={skill.applicant_percentage}
                    size={100}
                    thickness={4}
                    sx={{
                      color: theme.palette.info.main,
                      position: "absolute",
                      left: 0,
                      top: 0,
                      opacity: 0.7,
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Tooltip
                      title={
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            Nhu cầu: {skill.recruitment_demand}%
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            Ứng viên: {skill.applicant_percentage}%
                          </Typography>
                        </Box>
                      }
                      placement="top"
                    >
                      <BalanceIcon
                        color={getComparisonColor(
                          skill.recruitment_demand,
                          skill.applicant_percentage,
                        )}
                        sx={{ fontSize: 36 }}
                      />
                    </Tooltip>
                  </Box>
                </Box>

                <Typography
                  variant="h6"
                  fontWeight="medium"
                  gutterBottom
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {skill.name}
                </Typography>

                <RowStack spacing={0.5} justifyContent="center">
                  <TrendingUpIcon
                    fontSize="small"
                    color={getComparisonColor(
                      skill.recruitment_demand,
                      skill.applicant_percentage,
                    )}
                  />
                  <Typography
                    variant="body2"
                    color={
                      theme.palette[
                        getComparisonColor(
                          skill.recruitment_demand,
                          skill.applicant_percentage,
                        )
                      ].main
                    }
                    fontWeight="medium"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    {getComparisonMessage(
                      skill.recruitment_demand,
                      skill.applicant_percentage,
                    )}
                  </Typography>
                </RowStack>

                <Box sx={{ mt: 2 }}>
                  <RowStack spacing={1} mb={0.5}>
                    <TrendingUpIcon fontSize="small" color="success" />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Nhu cầu: {skill.recruitment_demand}%
                    </Typography>
                  </RowStack>
                  <RowStack spacing={1}>
                    <PeopleAltIcon fontSize="small" color="info" />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Ứng viên: {skill.applicant_percentage}%
                    </Typography>
                  </RowStack>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
}
