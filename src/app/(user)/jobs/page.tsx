import { Suspense } from "react";
import { JobSearch } from "@/components/career-lens/JobSearch";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <JobSearch />
    </Suspense>
  );
}
