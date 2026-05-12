"use client";

import {
  Box,
  Button,
  TextField,
  Typography,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { paths } from "@/paths";

const AuthResetPasswordContent = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Box display='flex' minHeight='100vh'>
      {/* Bên trái - Form Đặt lại mật khẩu */}
      <Stack
        flex={1}
        px={6}
        py={8}
        spacing={3}
        alignItems='center'
        justifyContent='center'
        bgcolor='white'
      >
        <Image
          src='/images/logo.png'
          alt='Logo CareerLens'
          width={140}
          height={40}
        />

        <Box textAlign='center'>
          <Typography variant='h5' fontWeight='bold'>
            Tạo mật khẩu mới
          </Typography>
          <Typography variant='body2' color='text.secondary' mt={1}>
            Nhập mật khẩu mới cho tài khoản của bạn
          </Typography>
        </Box>

        <Stack spacing={2} width='100%' maxWidth={320}>
          {/* Mật khẩu mới */}
          <TextField
            type={showPassword ? "text" : "password"}
            label='Mật khẩu mới'
            placeholder='Ít nhất 8 ký tự'
            fullWidth
            variant='outlined'
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
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge='end'
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Xác nhận mật khẩu */}
          <TextField
            type={showConfirmPassword ? "text" : "password"}
            label='Xác nhận mật khẩu'
            placeholder='Nhập lại mật khẩu'
            fullWidth
            variant='outlined'
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
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge='end'
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant='contained'
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
          >
            Đặt lại mật khẩu
          </Button>
        </Stack>

        <Typography variant='body2' mt={2}>
          Quay về{" "}
          <MuiLink component={Link} href={paths.auth.login} underline='hover'>
            Đăng nhập
          </MuiLink>
        </Typography>
      </Stack>

      {/* Bên phải - Minh họa */}
      <Stack
        flex={1}
        bgcolor='#F9FAFB'
        spacing={1}
        alignItems='center'
        justifyContent='center'
        textAlign='center'
        px={4}
      >
        <Typography variant='h5' fontWeight='bold'>
          Bảo mật là ưu tiên hàng đầu
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Hãy chắc chắn rằng bạn chọn một mật khẩu mạnh và dễ nhớ 💡
        </Typography>
        <Image
          src='/images/login-illustration.png'
          alt='Reset Password Illustration'
          width={300}
          height={300}
          suppressHydrationWarning
        />
      </Stack>
    </Box>
  );
};

export default AuthResetPasswordContent;
