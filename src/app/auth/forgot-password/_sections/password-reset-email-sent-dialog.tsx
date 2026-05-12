"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  useTheme,
  alpha,
  keyframes,
  IconButton,
  DialogActions,
  Stack,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ReplayIcon from "@mui/icons-material/Replay";

// Hiệu ứng animation
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

interface PasswordResetEmailSentDialogProps {
  open: boolean;
  onClose: () => void;
  email: string;
  onResendEmail?: () => void;
}

const PasswordResetEmailSentDialog = ({
  open,
  onClose,
  email,
  onResendEmail,
}: PasswordResetEmailSentDialogProps) => {
  const theme = useTheme();
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Đếm ngược thời gian cho phép gửi lại email
  useEffect(() => {
    if (!open) return;

    setTimeLeft(60);
    setCanResend(false);

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  // Xử lý gửi lại email
  const handleResendEmail = useCallback(() => {
    if (canResend && onResendEmail) {
      onResendEmail();
      setTimeLeft(60);
      setCanResend(false);
    }
  }, [canResend, onResendEmail]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
        },
      }}
    >
      {/* Close button */}
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Background gradient */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "30%",
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.1,
          )} 0%, ${alpha(theme.palette.info.main, 0.1)} 100%)`,
        }}
      />

      <DialogContent sx={{ pt: 5, px: 3, pb: 2 }}>
        {/* Email icon */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
            animation: `${float} 3s infinite ease-in-out`,
          }}
        >
          <MarkEmailReadIcon
            color="primary"
            sx={{
              fontSize: 80,
              filter: `drop-shadow(0 4px 8px ${alpha(
                theme.palette.primary.main,
                0.5,
              )})`,
            }}
          />
        </Box>

        {/* Title and message */}
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          fontWeight="bold"
          color="primary"
          sx={{ animation: `${fadeIn} 0.5s ease-out` }}
        >
          Đã gửi link đặt lại mật khẩu!
        </Typography>

        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          paragraph
          sx={{
            animation: `${fadeIn} 0.5s ease-out 0.1s`,
            animationFillMode: "both",
          }}
        >
          Chúng tôi đã gửi một email đến <strong>{email}</strong> với hướng dẫn
          để đặt lại mật khẩu của bạn.
        </Typography>

        <Typography
          variant="body1"
          align="center"
          paragraph
          sx={{
            animation: `${fadeIn} 0.5s ease-out 0.2s`,
            animationFillMode: "both",
          }}
        >
          Vui lòng kiểm tra hộp thư đến và thư rác của bạn. Link sẽ hết hạn sau
          30 phút.
        </Typography>

        {/* Instructions */}
        <Box
          sx={{
            mt: 3,
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.1),
            animation: `${fadeIn} 0.5s ease-out 0.3s`,
            animationFillMode: "both",
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <EmailIcon color="info" fontSize="small" />
              <Typography variant="body2">
                Kiểm tra email của bạn và nhấp vào liên kết để đặt lại mật khẩu
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTimeIcon color="info" fontSize="small" />
              <Typography variant="body2">
                Link sẽ hết hạn sau 30 phút vì lý do bảo mật
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <HelpOutlineIcon color="info" fontSize="small" />
              <Typography variant="body2">
                Nếu bạn không nhận được email, hãy kiểm tra thư mục spam hoặc
                gửi lại
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Resend email section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 2,
            animation: `${fadeIn} 0.5s ease-out 0.4s`,
            animationFillMode: "both",
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Không nhận được email?
          </Typography>
          <Button
            startIcon={<ReplayIcon />}
            onClick={handleResendEmail}
            disabled={!canResend}
            variant="text"
            color="primary"
          >
            {canResend ? "Gửi lại email" : `Gửi lại sau (${timeLeft}s)`}
          </Button>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained">
          Đã hiểu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordResetEmailSentDialog;
