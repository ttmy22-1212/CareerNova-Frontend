"use client";

import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  useTheme,
  alpha,
  Stack,
  Divider,
  Paper,
} from "@mui/material";
import { useRouter } from "next/navigation";
import LockIcon from "@mui/icons-material/Lock";
import LoginIcon from "@mui/icons-material/Login";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { keyframes } from "@mui/system";
import { useCallback, useMemo } from "react";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { paths } from "@/paths";
import {
  CAREERS_LOGIN,
  EXPIRED_LOGIN,
  setLocalStorage,
} from "@/utils/local-storage";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
`;

interface RequiredLoginDialogProps {
  open: boolean;
  onClose?: () => void;
  message?: string;
  title?: string;
  allowBack?: boolean;
}

const RequiredLoginDialog = ({
  open,
  onClose,
  message = "Vui lòng đăng nhập để chúng tôi có thể mang lại trải nghiệm tuyệt vời cho bạn.",
  title = "Yêu cầu đăng nhập",
  allowBack = true,
}: RequiredLoginDialogProps) => {
  const theme = useTheme();
  const router = useRouter();

  const handleLogin = useCallback(() => {
    router.push(paths.auth.login);
    onClose?.();
  }, [onClose, router]);

  const benefits = useMemo(
    () => [
      "Lưu trữ và theo dõi tiến trình học tập",
      "Truy cập đầy đủ các khóa học và tài liệu",
      "Nhận thông báo về các cập nhật mới",
      "Tham gia thảo luận với cộng đồng",
    ],
    [],
  );

  const handleSkip = useCallback(() => {
    const now = new Date();

    onClose?.();
    setLocalStorage(CAREERS_LOGIN, {
      expired_at: now.setDate(now.getDate() + EXPIRED_LOGIN),
    });
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={allowBack ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.1,
          )} 0%, ${alpha(theme.palette.primary.light, 0.3)} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
            animation: `${pulse} 2s infinite`,
          }}
        >
          <LockIcon
            sx={{
              fontSize: 40,
              color: theme.palette.primary.main,
            }}
          />
        </Box>

        <Typography
          variant="h5"
          fontWeight="bold"
          color="primary.main"
          gutterBottom
        >
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3, animation: `${fadeIn} 0.5s ease-out` }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Lợi ích khi đăng nhập:
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {benefits.map((benefit, index) => (
              <Paper
                key={index}
                variant="outlined"
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 1,
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  animation: `${fadeIn} 0.5s ease-out ${0.1 * index}s`,
                  animationFillMode: "both",
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                    color: theme.palette.primary.main,
                    fontWeight: "bold",
                    fontSize: 14,
                  }}
                >
                  {index + 1}
                </Box>
                <Typography variant="body2">{benefit}</Typography>
              </Paper>
            ))}
          </Stack>
        </Box>

        {/* Đã có tài khoản? */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            animation: `${fadeIn} 0.5s ease-out 0.5s`,
            animationFillMode: "both",
          }}
        >
          <Typography variant="body2" align="center">
            Đã có tài khoản? Đăng nhập để tiếp tục.
            <br />
            Chưa có tài khoản? Đăng ký ngay để trải nghiệm đầy đủ tính năng.
          </Typography>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
        {allowBack ? (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleSkip}
            color="inherit"
          >
            Để sau
          </Button>
        ) : (
          <Box />
        )}
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={() => router.push(paths.auth.register)}
            sx={{ minWidth: 120 }}
          >
            Đăng ký
          </Button>
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={handleLogin}
            sx={{ minWidth: 120 }}
          >
            Đăng nhập
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default RequiredLoginDialog;
