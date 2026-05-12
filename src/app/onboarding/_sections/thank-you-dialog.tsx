"use client";

import { useState, useEffect, JSX, useCallback } from "react";
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
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ShareIcon from "@mui/icons-material/Share";
import HomeIcon from "@mui/icons-material/Home";
import { useRouter } from "next/navigation";
import { paths } from "@/paths";

// Hiệu ứng animation
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Component Confetti
const Confetti = () => {
  const theme = useTheme();
  const [pieces, setPieces] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
    ];

    const newPieces = [];

    // Tạo 50 mảnh confetti
    for (let i = 0; i < 50; i++) {
      const style = {
        position: "absolute" as const,
        width: `${Math.random() * 10 + 5}px`,
        height: `${Math.random() * 10 + 5}px`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        borderRadius: Math.random() > 0.5 ? "50%" : "0",
        top: "-20px",
        left: `${Math.random() * 100}%`,
        opacity: 0,
        animation: `
          ${fadeIn} 0.3s ease forwards ${Math.random() * 0.5}s,
          ${float} ${Math.random() * 2 + 2}s ease-in-out infinite ${
          Math.random() * 0.5
        }s
        `,
        transform: `rotate(${Math.random() * 360}deg)`,
      };

      newPieces.push(<div key={i} style={style} />);
    }

    setPieces(newPieces);

    // Cleanup
    return () => {
      setPieces([]);
    };
  }, [theme]);

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {pieces}
    </Box>
  );
};

interface ThankYouDialogProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
}

const ThankYouDialog = ({
  open,
  onClose,
  userName = "",
}: ThankYouDialogProps) => {
  const theme = useTheme();
  const router = useRouter();

  const handleGoHome = useCallback(() => {
    router.push(paths.dashboard);
    onClose();
  }, [router, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
        },
      }}
    >
      {/* Confetti effect */}
      <Confetti />

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
            0.2,
          )} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
        }}
      />

      <DialogContent sx={{ py: 5, px: 3, textAlign: "center" }}>
        {/* Success icon */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
            animation: `${pulse} 1.5s infinite ease-in-out`,
          }}
        >
          <CheckCircleIcon
            color="success"
            sx={{
              fontSize: 80,
              filter: `drop-shadow(0 4px 8px ${alpha(
                theme.palette.success.main,
                0.5,
              )})`,
            }}
          />
        </Box>

        {/* Thank you message */}
        <Typography
          variant="h4"
          gutterBottom
          fontWeight="bold"
          color="primary"
          sx={{ animation: `${fadeIn} 0.5s ease-out` }}
        >
          Cảm ơn{userName ? ` ${userName}` : ""}!
        </Typography>

        <Typography
          variant="h6"
          gutterBottom
          sx={{
            animation: `${fadeIn} 0.5s ease-out 0.1s`,
            animationFillMode: "both",
          }}
        >
          Bạn đã hoàn thành phân tích nghề nghiệp
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          paragraph
          sx={{
            animation: `${fadeIn} 0.5s ease-out 0.2s`,
            animationFillMode: "both",
            mb: 4,
          }}
        >
          Chúng tôi đã nhận được thông tin của bạn và sẽ phân tích để đưa ra
          những gợi ý nghề nghiệp phù hợp nhất. Chúc bạn có trải nghiệm tuyệt
          vời trên hành trình sự nghiệp của mình!
        </Typography>

        {/* Trophy icon */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 4,
            animation: `${float} 3s infinite ease-in-out`,
          }}
        >
          <EmojiEventsIcon
            color="warning"
            sx={{
              fontSize: 60,
              filter: `drop-shadow(0 4px 8px ${alpha(
                theme.palette.warning.main,
                0.5,
              )})`,
            }}
          />
        </Box>

        {/* Next steps */}
        <Typography
          variant="subtitle1"
          fontWeight="medium"
          gutterBottom
          sx={{
            animation: `${fadeIn} 0.5s ease-out 0.3s`,
            animationFillMode: "both",
          }}
        >
          Bước tiếp theo
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          paragraph
          sx={{
            animation: `${fadeIn} 0.5s ease-out 0.4s`,
            animationFillMode: "both",
            mb: 4,
          }}
        >
          Khám phá các cơ hội nghề nghiệp phù hợp và xây dựng hành trình phát
          triển của bạn ngay hôm nay!
        </Typography>

        {/* Action buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
            animation: `${fadeIn} 0.5s ease-out 0.5s`,
            animationFillMode: "both",
          }}
        >
          {/* <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={handleShare}
          >
            Chia sẻ
          </Button> */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
          >
            Về trang chủ
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ThankYouDialog;
