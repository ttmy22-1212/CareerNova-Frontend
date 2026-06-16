"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LearningRoadmap } from "@/components/career-lens/LearningRoadmap";

function RoadmapWithParams() {
  const searchParams = useSearchParams();
  const skill = searchParams.get("skill") || undefined;
  return <LearningRoadmap selectedSkillFromDB={skill} />;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RoadmapWithParams />
    </Suspense>
  );
}
