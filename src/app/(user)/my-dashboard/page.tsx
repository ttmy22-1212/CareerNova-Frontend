"use client";
import { PersonalDashboard } from "@/components/career-lens/PersonalDashboard";
import AllowMatchingModal from "@/components/cv-matching/AllowMatchingModal";
import { useMatchingPermission } from "@/hooks/useMatchingPermission";

export default function Page() {
  const { showModal, activate, dismissModal } = useMatchingPermission();

  return (
    <>
      <PersonalDashboard />
      <AllowMatchingModal
        open={showModal}
        onClose={dismissModal}
        onActivated={activate}
      />
    </>
  );
}
