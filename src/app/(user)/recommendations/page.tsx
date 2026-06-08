"use client";
import { Recommendations } from "@/components/career-lens/Recommendations";
import AllowMatchingModal from "@/components/cv-matching/AllowMatchingModal";
import { useMatchingPermission } from "@/hooks/useMatchingPermission";

export default function Page() {
  const { showModal, activate, dismissModal } = useMatchingPermission();

  return (
    <>
      <Recommendations />
      <AllowMatchingModal
        open={showModal}
        onClose={dismissModal}
        onActivated={activate}
      />
    </>
  );
}
