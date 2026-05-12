"use client";

import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useRouter } from "next/navigation";
import { paths } from "@/paths";
import useCareerDetailSearch from "./use-career-detail-search";
import CareerDetailInfo from "./career-detail-info";
import LoadingState from "@/components/loading-state";
import CustomBreadcrumbs from "@/components/custom-breadcrumbs";
import EmptyState from "@/components/empty-state";
import NotFound from "@/app/not-found";
import { CareerAnalytics } from "./career-analytics";
import RowStack from "@/components/row-stack";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import useFunction from "@/hooks/use-function";
import UsersApi from "@/api/users";

const CareerDetailContent = () => {
  const router = useRouter();
  const {
    getCareersByIdApi,
    career,
    getCareerAnalyticsApi,
    careerAnalytics,
    careerDetail,
    getCareerDetailByIdApi,
  } = useCareerDetailSearch();
  const createTopicProgressApi = useFunction(UsersApi.createTopicProgress, {
    hideSnackbarError: true,
  });
  const handleGotoPath = (id: string) => {};

  if (!career && getCareersByIdApi.callCount > 0) {
    return <NotFound />;
  }

  if (getCareersByIdApi.loading || !career) {
    return <LoadingState />;
  }
  console.log("careerDetail", careerDetail);

  return (
    <Stack px={4} py={6} gap={3}>
      <CustomBreadcrumbs
        data={[
          {
            label: "Phân tích nghề",
            link: paths.career.index,
          },
          {
            label: career.name,
          },
        ]}
      />
      <Stack spacing={4}>
        <CareerDetailInfo career={career} />

        <Stack gap={1}>
          <RowStack gap={1}>
            <Typography fontWeight="bold">Gợi ý từ AI</Typography>
            <Tooltip
              title="Gợi ý được tạo dựa trên kỹ năng của bạn"
              placement="top"
            >
              <InfoOutlinedIcon
                sx={{
                  color: "action.active",
                }}
              />
            </Tooltip>
          </RowStack>
          {getCareerDetailByIdApi.loading ? (
            <LoadingState />
          ) : (
            <Paper
              sx={{
                p: 2,
              }}
            >
              <Typography>
                {careerDetail?.guidance.guidance ||
                  "Chưa có thông tin gợi ý từ AI cho nghề này."}
              </Typography>
            </Paper>
          )}
        </Stack>

        <CareerAnalytics
          data={careerAnalytics}
          loading={getCareerAnalyticsApi.loading}
        />

        <RowStack gap={1}>
          <Typography fontWeight="bold">Lộ trình học tập</Typography>
          <Tooltip
            title="Lộ trình học tập được xây dựng bởi các chuyên gia trong ngành"
            placement="top"
          >
            <InfoOutlinedIcon
              sx={{
                color: "action.active",
              }}
            />
          </Tooltip>
        </RowStack>
        <Stack spacing={2}>
          {career.topics.map((topic, index) => (
            <Box
              key={topic.id}
              onClick={() => handleGotoPath(topic.id)}
              sx={{
                border: "1px solid #E0E7FF",
                borderRadius: 2,
                p: 2,
                cursor: "pointer",
                backgroundColor: "white",
                "&:hover": {
                  borderColor: "#6366F1",
                  backgroundColor: "#F9FAFF",
                },
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <RowStack gap={1}>
                  <Typography>Giai đoạn {index + 1}:</Typography>
                  <Typography fontWeight="bold">{topic.title}</Typography>
                </RowStack>
                <Chip
                  label={1}
                  size="small"
                  sx={{ bgcolor: "#F5F3FF", color: "#7C3AED", fontWeight: 500 }}
                />
              </Stack>
            </Box>
          ))}
        </Stack>

        <Stack direction="row" justifyContent="space-between" mt={4}>
          {/* <Button
            startIcon={<FavoriteBorderIcon />}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderColor: "#6366F1",
              color: "#6366F1",
              "&:hover": { borderColor: "#4F46E5", backgroundColor: "#EEF2FF" },
            }}
          >
            Thêm vào yêu thích
          </Button> */}
          <Box></Box>

          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{
              backgroundColor: "#6366F1",
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#4F46E5" },
            }}
            onClick={() => {
              router.push(
                paths.roadmap.detail.replace(
                  ":roadmapId",
                  career?.topic_id as string,
                ),
              );
              createTopicProgressApi.call({
                topicId: career?.topic_id as string,
              });
            }}
          >
            Khám phá lộ trình học tập ngay
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default CareerDetailContent;
