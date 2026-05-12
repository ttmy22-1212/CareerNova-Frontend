"use client";

import type { FormikProps } from "formik";
import {
  Grid,
  TextField,
  Typography,
  Box,
  Button,
  IconButton,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import WorkIcon from "@mui/icons-material/Work";
import { useTheme } from "@mui/material/styles";
import { UserOnboarding } from "@/types/user";
import { useCallback } from "react";

interface ExperienceFormProps {
  formik: FormikProps<UserOnboarding>;
}

const ExperienceForm = ({ formik }: ExperienceFormProps) => {
  const handleAddExperience = useCallback(() => {
    const experiences = [...formik.values.experience!];
    experiences.push({ job_title: "", field: "", years: 0 });
    formik.setFieldValue("experience", experiences);
  }, [formik]);

  const handleRemoveExperience = useCallback(
    (index: number) => {
      const experiences = [...formik.values.experience!];
      experiences.splice(index, 1);
      formik.setFieldValue("experience", experiences);
    },
    [formik],
  );

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Kinh nghiệm làm việc
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Chia sẻ kinh nghiệm làm việc của bạn (nếu có)
      </Typography>

      <Box sx={{ mb: 3 }}>
        {formik.values.experience?.map((exp, index) => (
          <Card
            key={index}
            variant="outlined"
            sx={{ mb: 3, position: "relative" }}
          >
            <CardContent sx={{ pb: { xs: 2, sm: 1 }, px: { xs: 2, sm: 3 } }}>
              <Box
                sx={{
                  position: "absolute",
                  top: { xs: 4, sm: 8 },
                  right: { xs: 4, sm: 8 },
                }}
              >
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveExperience(index)}
                  disabled={formik.values.experience?.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>

              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  pr: 4, // Để tránh text bị đè bởi nút xóa
                }}
              >
                <WorkIcon fontSize="small" color="primary" />
                Kinh nghiệm {index + 1}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Chức danh công việc"
                    name={`experience[${index}].job_title`}
                    value={exp.job_title}
                    onChange={formik.handleChange}
                    placeholder="Ví dụ: Lập trình viên, Kế toán, v.v."
                    size={isSmallScreen ? "small" : "medium"}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Lĩnh vực"
                    name={`experience[${index}].field`}
                    value={exp.field}
                    onChange={formik.handleChange}
                    placeholder="Ví dụ: CNTT, Tài chính, v.v."
                    size={isSmallScreen ? "small" : "medium"}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Số năm kinh nghiệm"
                    name={`experience[${index}].years`}
                    type="number"
                    value={exp.years}
                    onChange={formik.handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">năm</InputAdornment>
                      ),
                      inputProps: { min: 0, step: 0.5 },
                    }}
                    size={isSmallScreen ? "small" : "medium"}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleAddExperience}
        sx={{ mt: 2 }}
      >
        Thêm kinh nghiệm
      </Button>
    </Box>
  );
};

export default ExperienceForm;
