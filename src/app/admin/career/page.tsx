"use client";

import OnDevelopmentPage from "@/components/development-page";
import CareerContent from "./_sections/content";

const onDevelopment = true;

const Career = () => {
  if (onDevelopment) {
    return <OnDevelopmentPage />;
  }
  return <CareerContent />;
};

export default Career;
