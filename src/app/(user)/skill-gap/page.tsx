"use client";
import { SkillGapAnalysis } from "@/components/career-lens/SkillGapAnalysis";
import AllowMatchingModal from "@/components/cv-matching/AllowMatchingModal";
import { useMatchingPermission } from "@/hooks/useMatchingPermission";

export default function Page() {
  const { showModal, activate, dismissModal } = useMatchingPermission();

  return (
    <>
      <SkillGapAnalysis />
      <AllowMatchingModal
        open={showModal}
        onClose={dismissModal}
        onActivated={activate}
      />
    </>
  );
}
