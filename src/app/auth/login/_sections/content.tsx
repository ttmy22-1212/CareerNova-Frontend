"use client";

import {
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
  Link as MuiLink,
  useMediaQuery,
  Theme,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { paths } from "@/paths";
import { useAuth } from "@/contexts/auth/firebase-context";
import { useState } from "react";
import useFunction from "@/hooks/use-function";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@/types/user";
import { useFormik } from "formik";
import * as Yup from "yup";
import useAppSnackbar from "@/hooks/use-app-snackbar";

const AuthLoginContent = () => {
  const { signInWithGoogle, signInWithFacebook, signInWithEmailAndPassword } =
    useAuth();
  const { showSnackbarError } = useAppSnackbar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md"),
  );

  const signInWithGoogleHelper = useFunction(signInWithGoogle, {
    onSuccess: ({ result }: { result: User | null }) => {
      const returnTo = searchParams.get("returnTo");
      if (!result?.onboarding_completed) {
        router.push(paths.onboarding);
        return;
      }
      if (returnTo) {
        router.push(returnTo as string);
        return;
      }
      router.push(paths.dashboard);
    },
  });
  const signInWithFacebookHelper = useFunction(signInWithFacebook, {
    onSuccess: ({ result }: { result: User | null }) => {
      const returnTo = searchParams.get("returnTo");
      if (!result?.onboarding_completed) {
        router.push(paths.onboarding);
        return;
      }
      if (returnTo) {
        router.push(returnTo as string);
        return;
      }
      router.push(paths.dashboard);
    },
  });
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Email không hợp lệ")
        .required("Email là bắt buộc"),
      password: Yup.string()
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
        .required("Mật khẩu là bắt buộc"),
    }),
    onSubmit: async (values) => {
      const { email, password } = values;
      try {
        signInWithEmailAndPassword(email, password);

        router.push(paths.dashboard);
      } catch (error) {
        console.error("Đăng ký thất bại:", error);
        showSnackbarError(error);
      }
    },
  });
  return (
    <Box display="flex" minHeight="100vh">
      {/* Bên trái - Form đăng nhập */}
      <Stack
        flex={1}
        px={6}
        py={8}
        alignItems="center"
        justifyContent="center"
        bgcolor="white"
        spacing={3}
      >
        <Image
          src="/images/logo-transparent.png"
          alt="Logo CareerLens"
          width={140}
          height={140}
        />

        <Box textAlign="center">
          <Typography variant="h5" fontWeight="bold">
            Chào mừng bạn quay lại
          </Typography>
          <Typography variant="body2" mt={1} color="text.secondary">
            Vui lòng nhập thông tin để đăng nhập vào tài khoản của bạn.
          </Typography>
        </Box>

        <Stack
          direction={isMobile ? "column-reverse" : "column"}
          width={"100%"}
          alignItems={"center"}
        >
          {/* Nút đăng nhập qua MXH */}
          <Stack spacing={1.5} width="100%" maxWidth={320}>
            <Button
              variant="outlined"
              startIcon={
                <Image
                  src="/icons/google-icon.svg"
                  alt="Google"
                  width={20}
                  height={20}
                />
              }
              sx={{
                backgroundColor: "#FFECEC",
                color: "#c72b32",
                borderColor: "#f5c2c7",
                textTransform: "none",
                borderRadius: "12px",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "#fddede",
                },
              }}
              onClick={signInWithGoogleHelper.call}
            >
              Đăng nhập bằng Google
            </Button>

            <Button
              variant="outlined"
              startIcon={
                <Image
                  src="/icons/facebook-icon.svg"
                  alt="Facebook"
                  width={20}
                  height={20}
                />
              }
              sx={{
                backgroundColor: "#EEF2FF",
                color: "#3b5998",
                borderColor: "#c7d2fe",
                textTransform: "none",
                borderRadius: "12px",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "#e0e7ff",
                },
              }}
              onClick={signInWithFacebookHelper.call}
            >
              Đăng nhập bằng Facebook
            </Button>
          </Stack>

          {/* Divider */}
          <Box width="100%" maxWidth={320}>
            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">
                HOẶC ĐĂNG NHẬP BẰNG EMAIL
              </Typography>
            </Divider>
          </Box>

          {/* Form đăng nhập */}
          <Stack width={"100%"} alignItems={"center"}>
            <Box width="100%" maxWidth={320}>
              <Typography variant="body2" fontWeight="bold" mb={1}>
                Email
              </Typography>
              <TextField
                type="email"
                placeholder="example.email@gmail.com"
                fullWidth
                {...formik.getFieldProps("email")}
                error={Boolean(formik.touched.email && formik.errors.email)}
                helperText={
                  formik.touched.email && formik.errors.email
                    ? formik.errors.email
                    : ""
                }
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#F9FAFB",
                    "&.Mui-focused fieldset": {
                      borderColor: "#6366F1",
                      boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.2)",
                    },
                  },
                }}
              />

              <Typography variant="body2" fontWeight="bold" mt={3} mb={1}>
                Mật khẩu
              </Typography>
              <TextField
                type={"password"}
                {...formik.getFieldProps("password")}
                error={Boolean(
                  formik.touched.password && formik.errors.password,
                )}
                helperText={
                  formik.touched.password && formik.errors.password
                    ? formik.errors.password
                    : ""
                }
                placeholder="Nhập mật khẩu của bạn"
                fullWidth
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#F9FAFB",
                    "&.Mui-focused fieldset": {
                      borderColor: "#6366F1",
                      boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.2)",
                    },
                  },
                }}
              />

              <Box textAlign="right" mt={1}>
                <MuiLink
                  component={Link}
                  href={paths.auth.forgotPassword}
                  underline="hover"
                  color="primary"
                >
                  Quên mật khẩu?
                </MuiLink>
              </Box>

              <Button
                variant="contained"
                fullWidth
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  backgroundColor: "#6366F1",
                  "&:hover": {
                    backgroundColor: "#4F46E5",
                  },
                }}
                onClick={() => formik.handleSubmit()}
              >
                Đăng nhập
              </Button>
            </Box>

            {/* Link chuyển sang đăng ký */}
            <Typography variant="body2" mt={3}>
              Chưa có tài khoản?{" "}
              <MuiLink
                component={Link}
                href={paths.auth.register}
                underline="hover"
              >
                Đăng ký ngay
              </MuiLink>
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      {/* Bên phải - Minh hoạ */}
      {!isMobile && (
        <Box
          flex={1}
          bgcolor="#F9FAFB"
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          textAlign="center"
        >
          <Typography variant="h5" fontWeight="bold" mb={1}>
            Rất vui được gặp lại bạn!
          </Typography>
          <Typography variant="body2" mb={3} color="text.secondary">
            Chúng tôi luôn sẵn sàng đồng hành cùng bạn 👋🏼
          </Typography>
          <Image
            src="/images/login-illustration.png"
            alt="Minh hoạ đăng nhập"
            width={300}
            height={300}
            suppressHydrationWarning
          />
        </Box>
      )}
    </Box>
  );
};

export default AuthLoginContent;
