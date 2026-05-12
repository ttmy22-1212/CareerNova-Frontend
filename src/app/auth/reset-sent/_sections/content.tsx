"use client";

import { Box, Button, Typography, Stack } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { paths } from "@/paths";

const AuthResetSentContent = () => {
  return (
    <Box display='flex' minHeight='100vh'>
      {/* Bên trái - Thông báo đã gửi email */}
      <Stack
        flex={1}
        px={6}
        py={8}
        spacing={2}
        alignItems='center'
        justifyContent='center'
        bgcolor='white'
        textAlign='center'
      >
        <Image
          src='/images/logo.png'
          alt='CareerLens Logo'
          width={140}
          height={40}
        />

        <Typography variant='h5' fontWeight='bold' mt={2}>
          Liên kết đặt lại mật khẩu đã được gửi
        </Typography>

        <Typography variant='body2' color='text.secondary'>
          Vui lòng kiểm tra email của bạn để đặt lại mật khẩu. Nếu không thấy,
          hãy kiểm tra thư mục spam.
        </Typography>

        <Button
          component={Link}
          href={paths.auth.login}
          variant='contained'
          sx={{
            mt: 2,
            py: 1.5,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            backgroundColor: "#6366F1",
            "&:hover": { backgroundColor: "#4F46E5" },
          }}
        >
          Quay lại trang đăng nhập
        </Button>
      </Stack>

      {/* Bên phải - Minh họa */}
      <Stack
        flex={1}
        bgcolor='#F9FAFB'
        spacing={1}
        alignItems='center'
        justifyContent='center'
        textAlign='center'
      >
        <Typography variant='h5' fontWeight='bold'>
          Kiểm tra hộp thư của bạn
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Chúng tôi vừa gửi liên kết để bạn tạo mật khẩu mới 📩
        </Typography>
        <Image
          src='/images/email-sent-illustration.png'
          alt='Email Sent Illustration'
          width={300}
          height={300}
          suppressHydrationWarning
        />
      </Stack>
    </Box>
  );
};

export default AuthResetSentContent;
