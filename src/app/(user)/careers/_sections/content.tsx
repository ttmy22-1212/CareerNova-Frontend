"use client";

import {
  Box,
  Button,
  Fade,
  Paper,
  Stack,
  Typography,
  IconButton,
  Grid2,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useCallback, useState } from "react";
import useCareerSearch from "./use-career-search";
import RowStack from "@/components/row-stack";
import CustomFilter from "@/components/custom-filter";
import CareerItem from "../_components/career-item";
import CustomPagination from "@/components/custom-pagination";
import DevelopmentTooltip from "@/components/development-tooltip";
import CustomSearchInput from "@/components/custom-search-input";
import useAppSnackbar from "@/hooks/use-app-snackbar";

const CareerContent = () => {
  const { showSnackbarError } = useAppSnackbar();
  const {
    getCareersApi,
    filterConfig,
    filter,
    pagination,
    handleSubmitFilter,
    careers,
  } = useCareerSearch();

  const handleAnalyze = useCallback(() => {
    if (
      !filter.salary[0] &&
      !filter.salary[1] &&
      !filter.experience[0] &&
      !filter.experience[1] &&
      !filter.skills.length &&
      !filter.major
    ) {
      showSnackbarError("Vui lòng chọn tiêu chí để tìm kiếm nghề nghiệp.");
      return;
    }
    getCareersApi.call({
      salary_min: filter.salary[0],
      salary_max: filter.salary[1],
      experience_min: filter.experience[0],
      experience_max: filter.experience[1],
      skills: filter.skills.length > 0 ? filter.skills : undefined,
      major: filter.major,
      offset: pagination.page * pagination.rowsPerPage,
      limit: pagination.rowsPerPage,
      key: filter.key,
    });
  }, [filter, getCareersApi]);

  const handleClickSearch = useCallback((value: string) => {
    handleSubmitFilter({
      ...filter,
      key: value,
    });

    if (value) {
      getCareersApi.call({
        salary_min: filter.salary[0],
        salary_max: filter.salary[1],
        experience_min: filter.experience[0],
        experience_max: filter.experience[1],
        skills: filter.skills.length > 0 ? filter.skills : undefined,
        major: filter.major,
        offset: pagination.page * pagination.rowsPerPage,
        limit: pagination.rowsPerPage,
        key: value,
      });
    } else {
      showSnackbarError("Vui lòng nhập từ khóa để tìm kiếm nghề nghiệp.");
    }
  }, []);

  return (
    <Stack spacing={6} py={4}>
      <Grid2 container>
        <Grid2 size={6}>
          <Typography
            variant={"h5"}
            component="h1"
            fontWeight="bold"
            sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" } }}
          >
            Phân tích nghề
          </Typography>
        </Grid2>

        <Grid2 size={6}>
          <CustomSearchInput onSearch={handleClickSearch} />
        </Grid2>
      </Grid2>
      <Paper
        sx={{
          borderRadius: 3,
          p: 4,
          backgroundColor: "white",
          border: "1px solid #D6D9FF",
          boxShadow: 3,
          "&:hover": { boxShadow: 6, borderColor: "#6366F1" },
        }}
      >
        {/* Phần form */}
        <RowStack justifyContent={"space-between"} mb={3}>
          <Typography variant="h6" fontWeight="bold">
            Thông tin cơ bản
          </Typography>
          <RowStack spacing={1}>
            <Typography fontWeight="bold">Tải lên CV</Typography>
            <Typography color="text.secondary">(tùy chọn)</Typography>
            <DevelopmentTooltip>
              <IconButton color="primary" size="small">
                <CloudUploadIcon />
              </IconButton>
            </DevelopmentTooltip>
          </RowStack>
        </RowStack>

        <CustomFilter
          filter={filter}
          onChange={handleSubmitFilter}
          configs={filterConfig}
        />

        <RowStack justifyContent="flex-end" mt={5}>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={handleAnalyze}
          >
            Phân tích nghề nghiệp
          </Button>
        </RowStack>
      </Paper>

      {/* Loading */}
      {careers.length === 0 && getCareersApi.loading && (
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mt: 4 }}
        >
          🔄 Đang phân tích nghề nghiệp phù hợp...
        </Typography>
      )}

      {/* Danh sách nghề nghiệp */}
      <Fade in={!!careers.length} timeout={600}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight="bold">
            Nghề nghiệp phù hợp
          </Typography>
          <Grid2 container spacing={2}>
            {careers.map((career, index) => (
              <Grid2
                size={{
                  xs: 12,
                  md: 6,
                }}
                key={index}
              >
                <CareerItem career={career} />
              </Grid2>
            ))}
          </Grid2>
        </Stack>
      </Fade>

      {/* Phân trang */}
      {careers.length > 0 && !getCareersApi.loading && (
        <CustomPagination
          pagination={pagination}
          justifyContent="end"
          p={2}
          borderTop={1}
          borderColor={"divider"}
          rowsPerPageOptions={[4, 8, 12]}
        />
      )}

      {/* Hiển thị thông báo khi không có kết quả */}
      {careers.length === 0 &&
        !getCareersApi.loading &&
        (getCareersApi.callCount !== 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Không tìm thấy nghề nghiệp phù hợp với tiêu chí của bạn.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Hãy thử điều chỉnh các bộ lọc để có kết quả phù hợp hơn.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Bạn chưa nhập tiêu chí nào để tìm kiếm nghề nghiệp.
            </Typography>
          </Box>
        ))}
    </Stack>
  );
};

export default CareerContent;
