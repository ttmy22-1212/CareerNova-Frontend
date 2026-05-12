"use client";

import type { FormikProps } from "formik";
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { UserOnboarding } from "@/types/user";

interface EducationFormProps {
  formik: FormikProps<UserOnboarding>;
}

const educationLevels = [
  "Trung học cơ sở",
  "Trung học phổ thông",
  "Trung cấp",
  "Cao đẳng",
  "Đại học",
  "Thạc sĩ",
  "Tiến sĩ",
  "Khác",
];

const EducationForm = ({ formik }: EducationFormProps) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Thông tin học vấn
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Thông tin về quá trình học tập và chuyên môn của bạn
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="education-level-label">Trình độ học vấn</InputLabel>
            <Select
              labelId="education-level-label"
              id="education_level"
              name="education_level"
              value={formik.values.education_level || ""}
              onChange={formik.handleChange}
              label="Trình độ học vấn"
            >
              {educationLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="major"
            name="major"
            label="Chuyên ngành"
            value={formik.values.major || ""}
            onChange={formik.handleChange}
            placeholder="Ví dụ: Công nghệ thông tin, Kinh tế, v.v."
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            id="school"
            name="school"
            label="Trường học"
            value={formik.values.school || ""}
            onChange={formik.handleChange}
            placeholder="Tên trường bạn đã/đang theo học"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default EducationForm;
