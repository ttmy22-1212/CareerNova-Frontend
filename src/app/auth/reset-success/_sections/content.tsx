'use client';

import {
  Stack,
  Button,
  TextField,
  Typography,
  Link as MuiLink,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { paths } from '@/paths';

const ResetSuccessPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      spacing={3}
      bgcolor="#F9FAFB"
      textAlign="center"
      px={2}
    >
      <Image
        src="/success-illustration.png"
        alt="Đặt lại mật khẩu thành công"
        width={280}
        height={280}
        suppressHydrationWarning
      />

      <Typography variant="h5" fontWeight="bold">
        Mật khẩu đã được đặt lại thành công
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Bạn có thể sử dụng mật khẩu mới để đăng nhập vào tài khoản của mình.
      </Typography>

      <Button
        variant="contained"
        href={paths.auth.login}
        component={Link}
        sx={{
          px: 5,
          py: 1.5,
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          backgroundColor: '#6366F1',
          '&:hover': {
            backgroundColor: '#4F46E5',
          },
        }}
      >
        Đăng nhập
      </Button>
    </Stack>
  );
};

export default ResetSuccessPage;
