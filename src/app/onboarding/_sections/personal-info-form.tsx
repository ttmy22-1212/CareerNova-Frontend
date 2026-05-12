"use client";

import type { FormikProps } from "formik";
import {
  Grid,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { UserOnboarding } from "@/types/user";

interface PersonalInfoFormProps {
  formik: FormikProps<UserOnboarding>;
}

const PersonalInfoForm = ({ formik }: PersonalInfoFormProps) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Thông tin cá nhân
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Thông tin cơ bản giúp chúng tôi hiểu rõ hơn về bạn
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="full_name"
            label="Họ và tên"
            {...formik.getFieldProps("full_name")}
            error={formik.touched.full_name && Boolean(formik.errors.full_name)}
            helperText={formik.touched.full_name && formik.errors.full_name}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <DatePicker
            label="Ngày sinh"
            value={formik.values.date_of_birth}
            onChange={(date) => formik.setFieldValue("date_of_birth", date)}
            slotProps={{
              textField: {
                fullWidth: true,
                error:
                  formik.touched.date_of_birth &&
                  Boolean(formik.errors.date_of_birth),
                helperText:
                  formik.touched.date_of_birth &&
                  (formik.errors.date_of_birth as string),
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Giới tính</FormLabel>
            <RadioGroup
              row
              name="gender"
              value={formik.values.gender || ""}
              onChange={formik.handleChange}
            >
              <FormControlLabel value="male" control={<Radio />} label="Nam" />
              <FormControlLabel value="female" control={<Radio />} label="Nữ" />
              <FormControlLabel
                value="other"
                control={<Radio />}
                label="Khác"
              />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PersonalInfoForm;
