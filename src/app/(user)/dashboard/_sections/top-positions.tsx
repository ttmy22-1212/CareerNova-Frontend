"use client";

import { useCallback, useMemo, useState } from "react";
import { alpha, Box, keyframes, Typography, useTheme } from "@mui/material";
import { Stack } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
} from "chart.js";
import RowStack from "@/components/row-stack";
import { warning } from "@/theme/colors";
import { PositionStats } from "@/api/job-postings";
import EmptyState from "@/components/empty-state";
import LoadingBarChart from "@/components/loading-bar-chart";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip);

interface TopPositionsProps {
  data: PositionStats[];
  loading: boolean;
}

export default function TopPositions({ data, loading }: TopPositionsProps) {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const handleBarHover = useCallback((index: number | null) => {
    setHighlightedIndex(index);
  }, []);

  const chartData = useMemo(() => {
    return {
      labels: data.map((item) => item.position),
      datasets: [
        {
          data: data.map((item) => item.count),
          backgroundColor: data.map((_, index) =>
            index === highlightedIndex ? warning.main : warning.light,
          ),
          borderColor: warning.main,
          borderWidth: 1,
          borderRadius: 4,
          barThickness: 30,
        },
      ],
    };
  }, [data, highlightedIndex]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: any) => `${context.parsed.y} vị trí`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            drawBorder: false,
          },
        },
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
        },
      },
      onHover: (_: any, elements: any[]) => {
        if (elements && elements.length) {
          handleBarHover(elements[0].index);
        } else {
          handleBarHover(null);
        }
      },
    };
  }, [handleBarHover]);

  // if (loading || data.length === 0) {
  //   return <LoadingBarChart />;
  // }

  return (
    <Stack>
      <RowStack justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight="medium">
          5 vị trí vị trí có nhu cầu cao nhất
        </Typography>
        <RowStack></RowStack>
      </RowStack>

      <Stack justifyContent={"center"} sx={{ height: 300 }}>
        {data.length === 0 ? (
          <EmptyState
            width={300}
            height={200}
            title="Hiện chưa có số liệu thống kê"
          />
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </Stack>
    </Stack>
  );
}
