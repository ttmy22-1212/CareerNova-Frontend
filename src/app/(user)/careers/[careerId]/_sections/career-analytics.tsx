import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Tooltip as MuiTooltip,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { CareerAnalytics } from "@/types/career";
import { useCallback, useMemo } from "react";
import RowStack from "@/components/row-stack";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface CareerAnalyticsProps {
  data: CareerAnalytics[];
  loading: boolean;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

export function CareerAnalytics({ data, loading }: CareerAnalyticsProps) {
  if (loading || !data || data.length === 0) {
    return (
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Typography>Đang tải dữ liệu...</Typography>
      </Box>
    );
  }

  const latestAnalytics = data[data.length - 1];
  const { salary_prediction, job_postings_prediction } = latestAnalytics;

  // Generate chart data from historical analytics
  const salaryChartData = useMemo(
    () => ({
      labels: data.map((_, index) => `Tháng ${index + 1}`),
      datasets: [
        {
          label: "Lương tối thiểu",
          data: data.map((d) => d.salary_prediction.min_salary),
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
        {
          label: "Lương trung bình",
          data: data.map((d) => d.salary_prediction.avg_salary),
          borderColor: "rgb(255, 159, 64)",
          tension: 0.1,
        },
        {
          label: "Lương tối đa",
          data: data.map((d) => d.salary_prediction.max_salary),
          borderColor: "rgb(255, 99, 132)",
          tension: 0.1,
        },
      ],
    }),
    [data],
  );

  const jobChartData = useMemo(
    () => ({
      labels: data.map((_, index) => `Tháng ${index + 1}`),
      datasets: [
        {
          label: "Số lượng việc làm",
          data: data.map((d) => d.job_postings_prediction.total_openings),
          borderColor: "rgb(54, 162, 235)",
          tension: 0.1,
        },
      ],
    }),
    [data],
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: {
          position: "top" as const,
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              if (context.dataset.label === "Số lượng việc làm") {
                return context.dataset.label + ": " + context.raw;
              }
              return context.dataset.label + ": " + formatCurrency(context.raw);
            },
          },
        },
      },
    }),
    [],
  );

  const getTrendIcon = useCallback(
    (trend: "stable" | "increasing" | "decreasing") => {
      switch (trend) {
        case "increasing":
          return <TrendingUpIcon color="success" />;
        case "decreasing":
          return <TrendingDownIcon color="error" />;
        default:
          return null;
      }
    },
    [],
  );

  return (
    <Stack gap={1}>
      <RowStack gap={1}>
        <Typography variant="h6">
          Phân tích nghề nghiệp trong tương lai
        </Typography>
        <MuiTooltip
          title="Kết quả dự đoán được tính toán dựa trên dữ liệu thống kê từ các việc làm đã được đăng tải trên các trang web tuyển dụng và các nguồn thông tin khác."
          placement="top"
        >
          <InfoOutlinedIcon
            sx={{
              color: "action.active",
            }}
          />
        </MuiTooltip>
      </RowStack>
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Dự đoán mức lương
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line options={chartOptions} data={salaryChartData} />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Mức lương dự kiến:{" "}
                    {formatCurrency(salary_prediction.min_salary)} -{" "}
                    {formatCurrency(salary_prediction.max_salary)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mức lương trung bình:{" "}
                    {formatCurrency(salary_prediction.avg_salary)}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Xu hướng:{" "}
                      {salary_prediction.trend === "increasing"
                        ? "Tăng"
                        : salary_prediction.trend === "decreasing"
                        ? "Giảm"
                        : "Ổn định"}
                    </Typography>
                    {getTrendIcon(salary_prediction.trend)}
                    {/* <Typography variant="body2" color="text.secondary">
                      (Độ tin cậy:{" "}
                      {(salary_prediction.confidence * 100).toFixed(1)}%)
                    </Typography> */}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Dự đoán cơ hội việc làm
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line options={chartOptions} data={jobChartData} />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tổng số vị trí tuyển dụng:{" "}
                    {job_postings_prediction.total_openings}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Số lượng trung bình mỗi vị trí:{" "}
                    {job_postings_prediction.average_openings_per_posting}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Xu hướng:{" "}
                      {job_postings_prediction.trend === "increasing"
                        ? "Tăng"
                        : job_postings_prediction.trend === "decreasing"
                        ? "Giảm"
                        : "Ổn định"}
                    </Typography>
                    {getTrendIcon(job_postings_prediction.trend)}
                    {/* <Typography variant="body2" color="text.secondary">
                      (Độ tin cậy:{" "}
                      {(job_postings_prediction.confidence * 100).toFixed(1)}%)
                    </Typography> */}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Stack>
  );
}
