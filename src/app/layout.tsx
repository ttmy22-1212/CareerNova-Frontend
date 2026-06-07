import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { Metadata } from "next";
import { theme } from "@/theme";
import "@/theme/global.css";
import "./globals.css";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { SnackbarProvider } from "./_components/snackbar-provider";
import Layout from "./_layout";
import { MainProvider } from "@/contexts/main/main-context";
import { OnboardingProvider } from "@/contexts/onboarding/onboarding-context";
import { ThemeProvider as DarkModeProvider } from "@/contexts/theme/theme-context";
import { AuthProvider } from "@/contexts/auth/auth-context";

// NOTE: next/font/google was removed because the corp network blocks
// fonts.googleapis.com, which made every request retry the font fetch and
// caused noisy reload behavior in dev. We use the system font stack instead.

export const metadata: Metadata = {
  title: "Career Nova",
  description:
    "Nền tảng hỗ trợ định hướng nghề nghiệp và cá nhân hoá lộ trình học tập",
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        suppressHydrationWarning
        style={{
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <AppRouterCacheProvider options={{ key: "css" }}>
          <CssBaseline />
          <SnackbarProvider>
            <ThemeProvider theme={theme}>
              <Layout>
                <DarkModeProvider>
                  <AuthProvider>
                    <OnboardingProvider>
                      <MainProvider>{children}</MainProvider>
                    </OnboardingProvider>
                  </AuthProvider>
                </DarkModeProvider>
              </Layout>
            </ThemeProvider>
          </SnackbarProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
