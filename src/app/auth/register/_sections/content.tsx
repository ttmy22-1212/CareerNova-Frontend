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
import { useState } from "react";
import { paths } from "@/paths";
import { useAuth } from "@/contexts/auth/firebase-context";
import useFunction from "@/hooks/use-function";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import { useFormik } from "formik";
import * as Yup from "yup";
import useAppSnackbar from "@/hooks/use-app-snackbar";

const AuthRegisterContent = () => {
  const { showSnackbarError } = useAppSnackbar();
  const { signInWithGoogle, signInWithFacebook, register } = useAuth();
  const router = useRouter();
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md"),
  );

  const signInWithGoogleHelper = useFunction(signInWithGoogle, {
    onSuccess: () => {
      router.push(paths.dashboard);
    },
  });
  const signInWithFacebookHelper = useFunction(signInWithFacebook, {
    onSuccess: () => {
      router.push(paths.dashboard);
    },
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, "Tên phải có ít nhất 2 ký tự")
        .max(50, "Tên không được vượt quá 50 ký tự")
        .required("Tên là bắt buộc"),
      email: Yup.string()
        .email("Email không hợp lệ")
        .required("Email là bắt buộc"),
      password: Yup.string()
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
        .required("Mật khẩu là bắt buộc"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Mật khẩu không khớp")
        .required("Xác nhận mật khẩu là bắt buộc"),
    }),
    onSubmit: async (values) => {
      const { email, password, name } = values;
      try {
        const result = await register({ email, password, name });

        router.push(paths.dashboard);
      } catch (error) {
        console.error("Đăng ký thất bại:", error);
        showSnackbarError(error);
      }
    },
  });

  return (
    <Box display="flex" minHeight="100vh">
      {/* Bên trái - Form Đăng ký */}
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
          width={100}
          height={100}
        />

        <Box textAlign="center">
          <Typography variant="h5" fontWeight="bold">
            Tạo tài khoản mới
          </Typography>
          <Typography variant="body2" mt={1} color="text.secondary">
            Bằng cách đăng ký, bạn đồng ý với{" "}
            <MuiLink href="#" underline="hover">
              Điều khoản
            </MuiLink>{" "}
            và{" "}
            <MuiLink href="#" underline="hover">
              Chính sách quyền riêng tư
            </MuiLink>
            .
          </Typography>
        </Box>

        <Stack
          direction={isMobile ? "column-reverse" : "column"}
          width={"100%"}
          alignItems={"center"}
        >
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
              Đăng ký bằng Google
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
              Đăng ký bằng Facebook
            </Button>
          </Stack>

          <Box width="100%" maxWidth={320}>
            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">
                HOẶC ĐĂNG KÝ BẰNG EMAIL
              </Typography>
            </Divider>
          </Box>

          <Stack width={"100%"} alignItems={"center"}>
            <Stack spacing={2} width="100%" maxWidth={320}>
              <TextField
                {...formik.getFieldProps("name")}
                error={Boolean(formik.touched.name && formik.errors.name)}
                helperText={
                  formik.touched.name && formik.errors.name
                    ? formik.errors.name
                    : ""
                }
                label={"Họ và tên"}
                // placeholder={"example@gmail.com"}
                type={"email"}
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
              <TextField
                {...formik.getFieldProps("email")}
                error={Boolean(formik.touched.email && formik.errors.email)}
                helperText={
                  formik.touched.email && formik.errors.email
                    ? formik.errors.email
                    : ""
                }
                label={"Email"}
                placeholder={"example@gmail.com"}
                type={"email"}
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

              {/* Mật khẩu */}
              <TextField
                label="Mật khẩu"
                type={"password"}
                placeholder="Ít nhất 6 ký tự"
                {...formik.getFieldProps("password")}
                error={Boolean(
                  formik.touched.password && formik.errors.password,
                )}
                helperText={
                  formik.touched.password && formik.errors.password
                    ? formik.errors.password
                    : ""
                }
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

              {/* Xác nhận mật khẩu */}
              <TextField
                label="Xác nhận mật khẩu"
                type={"password"}
                placeholder="Nhập lại mật khẩu"
                fullWidth
                {...formik.getFieldProps("confirmPassword")}
                error={Boolean(
                  formik.touched.confirmPassword &&
                    formik.errors.confirmPassword,
                )}
                helperText={
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                    ? formik.errors.confirmPassword
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

              <Button
                variant="contained"
                fullWidth
                sx={{
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
                Đăng ký
              </Button>
            </Stack>

            <Typography variant="body2" mt={3}>
              Đã có tài khoản?{" "}
              <MuiLink
                component={Link}
                href={paths.auth.login}
                underline="hover"
              >
                Đăng nhập
              </MuiLink>
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      {/* Bên phải - Minh họa */}
      {!isMobile && (
        <Stack
          flex={1}
          bgcolor="#F9FAFB"
          alignItems="center"
          justifyContent="center"
          spacing={2}
        >
          <Typography variant="h5" fontWeight="bold">
            Chào mừng đến với CareerLens
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hãy bắt đầu hành trình nghề nghiệp của bạn 👋🏼
          </Typography>
          <Image
            src="/images/welcome-illustration.png"
            alt="Minh họa đăng ký"
            width={300}
            height={300}
            suppressHydrationWarning
          />
        </Stack>
      )}
    </Box>
  );
};

export default AuthRegisterContent;
