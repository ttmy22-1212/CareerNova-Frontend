import { alpha, Box, keyframes, Typography, useTheme } from "@mui/material";
import { Stack } from "@mui/material";
import RowStack from "@/components/row-stack";
import { warning } from "@/theme/colors";

const pulse = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const LoadingBarChart = () => {
  const theme = useTheme();
  return (
    <Stack>
      {/* <RowStack justifyContent="space-between" mb={2}>
        <Box
          sx={{
            width: "60%",
            height: 32,
            borderRadius: 1,
            background: `linear-gradient(90deg, ${alpha(
              theme.palette.background.paper,
              0.5,
            )} 0%, ${alpha(theme.palette.background.paper, 0.8)} 50%, ${alpha(
              theme.palette.background.paper,
              0.5,
            )} 100%)`,
            backgroundSize: "200% 100%",
            animation: `${shimmer} 2s infinite`,
          }}
        />
      </RowStack> */}

      <Box
        sx={{
          height: 300,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderRadius: 1,
          background: alpha(theme.palette.background.paper, 0.7),
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="flex-end"
          sx={{
            position: "absolute",
            bottom: 40,
            left: 40,
            right: 40,
            height: "calc(100% - 80px)",
            justifyContent: "space-between",
          }}
        >
          {[...Array(5)].map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 30,
                height: `${20 + Math.random() * 60}%`,
                borderRadius: "4px 4px 0 0",
                backgroundColor: alpha(warning.light, 0.7),
                animation: `${pulse} 1.5s infinite ease-in-out ${index * 0.2}s`,
              }}
            />
          ))}
        </Stack>

        <Box
          sx={{
            position: "absolute",
            bottom: 30,
            left: 40,
            right: 40,
            height: 1,
            backgroundColor: alpha(theme.palette.text.secondary, 0.2),
          }}
        />

        <Stack
          direction="row"
          sx={{
            position: "absolute",
            bottom: 10,
            left: 40,
            right: 40,
            justifyContent: "space-between",
          }}
        >
          {[...Array(5)].map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 30,
                height: 8,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.text.secondary, 0.2),
                animation: `${pulse} 1.5s infinite ease-in-out ${index * 0.2}s`,
              }}
            />
          ))}
        </Stack>

        <Box
          sx={{
            position: "absolute",
            bottom: 30,
            left: 40,
            top: 20,
            width: 1,
            backgroundColor: alpha(theme.palette.text.secondary, 0.2),
          }}
        />

        <Stack
          sx={{
            position: "absolute",
            bottom: 30,
            left: 10,
            top: 20,
            height: "calc(100% - 50px)",
            justifyContent: "space-between",
          }}
        >
          {[...Array(4)].map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 20,
                height: 8,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.text.secondary, 0.2),
                animation: `${pulse} 1.5s infinite ease-in-out ${index * 0.2}s`,
              }}
            />
          ))}
        </Stack>

        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            color: theme.palette.text.secondary,
            animation: `${pulse} 1.5s infinite ease-in-out`,
          }}
        >
          Đang tải dữ liệu...
        </Typography>
      </Box>
    </Stack>
  );
};

export default LoadingBarChart;
