import { useAuth } from "@/contexts/auth/firebase-context";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { AlertCircle, Clock } from "lucide-react";
import { paths } from "@/paths";
import LazyLottie from "@/components/lazy-lottie";

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const router = useRouter();

  const [countdown, setCountdown] = useState(5);

  const handleRedirect = useCallback(() => {
    if (!user || user?.role === "admin") {
      return () => {};
    }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(paths.dashboard);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router, user]);

  useEffect(() => {
    const cleanup = handleRedirect();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user?.email) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            border: "1px solid #f44336",
            bgcolor: "error.light",
            color: "error.contrastText",
          }}
        >
          <Stack spacing={3} alignItems="center">
            <AlertCircle size={64} />
            <LazyLottie
              path="/assets/lottie/forbidden.json"
              width={300}
              height={300}
            />
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              textAlign="center"
            >
              Access Forbidden
            </Typography>
            <Typography variant="body1" textAlign="center">
              This page is restricted to administrators only. You do not have
              the required permissions to access this content.
            </Typography>
            <Alert severity="info" icon={<Clock />} sx={{ width: "100%" }}>
              You will be redirected to the home page in{" "}
              <strong>{countdown}</strong> seconds.
            </Alert>

            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push(paths.dashboard)}
              sx={{ mt: 2 }}
            >
              Return to Home Page
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }
  return <>{children}</>;
};

export default AdminGuard;
