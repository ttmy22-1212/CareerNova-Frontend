"use client";

import type { FormikProps } from "formik";
import {
  Grid,
  TextField,
  Typography,
  Box,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { UserOnboarding } from "@/types/user";

interface CareerGoalsFormProps {
  formik: FormikProps<UserOnboarding>;
}

const commonCareerGoals = [
  "Tìm việc làm phù hợp với chuyên môn",
  "Chuyển đổi ngành nghề",
  "Thăng tiến trong công việc hiện tại",
  "Khởi nghiệp/Tự kinh doanh",
  "Nâng cao kỹ năng chuyên môn",
  "Cân bằng công việc và cuộc sống",
  "Tăng thu nhập",
  "Khác",
];

const CareerGoalsForm = ({ formik }: CareerGoalsFormProps) => {
  const handleGoalSelect = (goal: string) => {
    formik.setFieldValue("current_goal", goal);
  };

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Mục tiêu nghề nghiệp
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Chia sẻ mục tiêu nghề nghiệp hiện tại của bạn
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Mục tiêu phổ biến
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: { xs: 0.5, sm: 1 },
              }}
            >
              {commonCareerGoals.map((goal) => (
                <Chip
                  key={goal}
                  label={goal}
                  onClick={() => handleGoalSelect(goal)}
                  color={
                    formik.values.current_goal === goal ? "primary" : "default"
                  }
                  variant={
                    formik.values.current_goal === goal ? "filled" : "outlined"
                  }
                  size={isSmallScreen ? "small" : "medium"}
                  sx={{ mb: 1, mr: 0.5 }}
                />
              ))}
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            id="current_goal"
            name="current_goal"
            label="Mục tiêu nghề nghiệp của bạn"
            value={formik.values.current_goal || ""}
            onChange={formik.handleChange}
            multiline
            rows={4}
            placeholder="Mô tả chi tiết mục tiêu nghề nghiệp của bạn..."
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CareerGoalsForm;
