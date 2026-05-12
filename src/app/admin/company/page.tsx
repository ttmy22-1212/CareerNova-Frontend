"use client";

import OnDevelopmentPage from "@/components/development-page";
import CampanyContent from "./_sections/content";

const onDevelopment = true;

const Company = () => {
  if (onDevelopment) {
    return <OnDevelopmentPage />;
  }
  return <CampanyContent />;
};

export default Company;
