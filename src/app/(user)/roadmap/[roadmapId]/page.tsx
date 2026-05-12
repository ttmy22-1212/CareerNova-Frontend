"use client";
import ContentLoading from "@/components/content-loading";
import dynamic from "next/dynamic";

const RoadmapDetailContent = dynamic(() => import("./_sections/content"), {
  ssr: false,
  loading: () => <ContentLoading />,
});

export default function RoadmapDetailPage() {
  return <RoadmapDetailContent />;
}
