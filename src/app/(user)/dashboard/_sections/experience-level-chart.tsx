"use client";

import { useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { Stack } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  purple,
  error,
  success,
  info,
  warning,
  blue,
  green,
} from "@/theme/colors";
import { ExperienceLevelStats } from "@/api/job-postings";
import EmptyState from "@/components/empty-state";
import RowStack from "@/components/row-stack";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExperienceLevelChartProps {
  data: ExperienceLevelStats[];
}

export default function ExperienceLevelChart({
  data,
}: ExperienceLevelChartProps) {
  const chartData = useMemo(() => {
    return {
      labels: data.map((item) => item.label),
      datasets: [
        {
          data: data.map((item) => item.value),
          backgroundColor: [
            purple.main,
            error.main,
            info.main,
            warning.main,
            success.main,
            blue.main,
            green.main,
          ],
          borderColor: [
            purple.dark,
            error.dark,
            info.dark,
            warning.dark,
            success.dark,
            blue.dark,
            green.dark,
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            boxWidth: 12,
            padding: 20,
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || "";
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce(
                (a: number, b: number) => a + b,
                0,
              );
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${percentage}%`;
            },
          },
        },
      },
      cutout: "60%",
    };
  }, []);

  return (
    <Stack height={"100%"}>
      <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
        Tin tuyển dụng theo cấp độ kinh nghiệm
      </Typography>

      <Stack height={"100%"} justifyContent={"center"} flex={1}>
        <RowStack
          justifyContent={"center"}
          sx={{ height: 300, position: "relative" }}
        >
          {data.length === 0 ? (
            <EmptyState
              width={300}
              height={200}
              title="Hiện chưa có số liệu thống kê"
            />
          ) : (
            <Doughnut data={chartData} options={chartOptions} />
          )}
        </RowStack>
      </Stack>
    </Stack>
  );
}
