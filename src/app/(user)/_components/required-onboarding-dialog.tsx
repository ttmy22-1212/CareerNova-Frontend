"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Typography,
  Button,
  Box,
  useTheme,
  alpha,
  Paper,
} from "@mui/material";
import { useRouter } from "next/navigation";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { paths } from "@/paths";
import { useCallback, useMemo } from "react";

interface RequiredOnboardingDialogProps {
  open: boolean;
  onClose?: () => void;
  allowSkip?: boolean;
}

const RequiredOnboardingDialog = ({
  open,
  onClose,
  allowSkip = false,
}: RequiredOnboardingDialogProps) => {
  const theme = useTheme();
  const router = useRouter();

  const handleConfirm = useCallback(() => {
    router.push(paths.onboarding);

    if (onClose) {
      onClose();
    }
  }, [onClose, router]);

  const handleSkip = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const benefits = useMemo(
    () => [
      {
        icon: <PersonIcon fontSize="medium" color="primary" />,
        title: "Cá nhân hóa trải nghiệm",
        description:
          "Giúp chúng tôi hiểu bạn hơn để cung cấp nội dung phù hợp với nhu cầu của bạn",
      },
      {
        icon: <SettingsIcon fontSize="medium" color="primary" />,
        title: "Tùy chỉnh tài khoản",
        description:
          "Thiết lập các tùy chọn và sở thích để tối ưu hóa trải nghiệm của bạn",
      },
      {
        icon: <NotificationsIcon fontSize="medium" color="primary" />,
        title: "Cập nhật thông tin",
        description:
          "Nhận thông báo về các tính năng mới và nội dung phù hợp với sở thích của bạn",
      },
    ],
    [],
  );

  return (
    <Dialog
      open={open}
      onClose={allowSkip ? onClose : undefined}
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
        }}
      >
        <DialogTitle
          sx={{
            p: 0,
            mb: 1,
            fontWeight: "bold",
            color: "primary.main",
            fontSize: (theme) => theme.typography.h5.fontSize,
          }}
        >
          Hoàn thành thiết lập tài khoản
        </DialogTitle>
        <Typography variant="body1" color="text.secondary">
          Vui lòng hoàn thành quá trình thiết lập tài khoản để có thể sử dụng
          đầy đủ các tính năng của ứng dụng.
        </Typography>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
          Lợi ích khi hoàn thành thiết lập:
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          {benefits.map((benefit, index) => (
            <Paper
              key={index}
              variant="outlined"
              sx={{
                p: 2,
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                borderRadius: 1,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 1,
                },
              }}
            >
              <Box sx={{ pt: 0.5 }}>{benefit.icon}</Box>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {benefit.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {benefit.description}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, fontStyle: "italic" }}
        >
          Quá trình thiết lập chỉ mất khoảng 2 phút và bạn có thể thay đổi các
          tùy chọn này sau.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        {allowSkip && (
          <Button onClick={handleSkip} color="inherit">
            Để sau
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          endIcon={<ArrowForwardIcon />}
          sx={{ ml: 1 }}
        >
          Bắt đầu thiết lập
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequiredOnboardingDialog;
