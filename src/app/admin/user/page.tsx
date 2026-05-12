"use client";

import OnDevelopmentPage from "@/components/development-page";
import UserContent from "./_sections/content";

const onDevelopment = true;
const User = () => {
  if (onDevelopment) {
    return <OnDevelopmentPage />;
  }
  return <UserContent />;
};

export default User;
