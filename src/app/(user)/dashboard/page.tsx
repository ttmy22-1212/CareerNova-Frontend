"use client";
import { MarketDashboard } from "@/components/career-lens/MarketDashboard";
import { useAuth } from "@/contexts/auth/auth-context";

export default function Page() {
  const { user, ready } = useAuth();
  return <MarketDashboard isLoggedIn={ready && !!user} />;
}
