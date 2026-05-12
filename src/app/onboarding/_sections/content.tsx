"use client";

import { useCallback, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useFormik } from "formik";
import { initialValuesOnboarding, validationSchema } from "@/types/user";
import PersonalInfoForm from "./personal-info-form";
import EducationForm from "./education-form";
import CareerGoalsForm from "./career-goals-form";
import SkillsForm from "./skills-form";
import ExperienceForm from "./experience-form";
import ReviewForm from "./review-form";
import { useAuth } from "@/contexts/auth/firebase-context";
import ThankYouDialog from "./thank-you-dialog";
import { useDialog } from "@/hooks/use-dialog";

const steps = [
  "Thông tin cá nhân",
  "Học vấn",
  "Mục tiêu nghề nghiệp",
  "Kỹ năng",
  "Kinh nghiệm",
  "Xem lại",
];

const OnboardingContent = () => {
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { completeOnboarding } = useAuth();
  const thankyouDialog = useDialog();

  const formik = useFormik({
    initialValues: initialValuesOnboarding,
    validationSchema: validationSchema[activeStep],
    onSubmit: (values) => {
      if (activeStep === steps.length - 1) {
        thankyouDialog.handleOpen();
        const convertedValues = {
          ...values,
          full_name: values.full_name.trim(),
          experience: (values.experience || []).filter((exp) => exp.job_title),
        };
        completeOnboarding(convertedValues);
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    },
  });
  const getStepContent = useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return <PersonalInfoForm formik={formik} />;
        case 1:
          return <EducationForm formik={formik} />;
        case 2:
          return <CareerGoalsForm formik={formik} />;
        case 3:
          return <SkillsForm formik={formik} />;
        case 4:
          return <ExperienceForm formik={formik} />;
        case 5:
          return <ReviewForm formik={formik} />;
        default:
          return "Unknown step";
      }
    },
    [formik],
  );

  return (
    <>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            fontWeight="bold"
            color="primary"
          >
            Phân tích nghề nghiệp
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="text.secondary"
            paragraph
          >
            Hoàn thành các thông tin dưới đây để nhận được phân tích nghề nghiệp
            phù hợp với bạn
          </Typography>

          <Stepper
            activeStep={activeStep}
            alternativeLabel={!isMobile}
            orientation={isMobile ? "vertical" : "horizontal"}
            sx={{ mb: 4, mt: 4 }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 4, minHeight: "300px" }}>
            {getStepContent(activeStep)}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 4,
              pt: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={() =>
                setActiveStep((prevActiveStep) => prevActiveStep - 1)
              }
              sx={{ mr: 1 }}
            >
              Quay lại
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => formik.handleSubmit()}
                >
                  Hoàn thành
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => formik.handleSubmit()}
                >
                  Tiếp theo
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
      <ThankYouDialog
        open={thankyouDialog.open}
        onClose={thankyouDialog.handleClose}
        userName={formik.values.full_name}
      />
    </>
  );
};

export default OnboardingContent;
