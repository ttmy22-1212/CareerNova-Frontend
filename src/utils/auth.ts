import { errorMap } from "@/libs/firebase";
import { User } from "@/types/user";
import CookieHelper, { CookieKeys } from "./cookie-helper";

export enum Issuer {
  Auth0 = "Auth0",
  Firebase = "Firebase",
  JWT = "JWT",
  Amplify = "Amplify",
}

/**
 * Store authentication data in cookies and local storage
 */
export const storeAuthData = (token: string, userData: User) => {
  CookieHelper.setItem(CookieKeys.TOKEN, token, {
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
  });
  localStorage.setItem("user_data", JSON.stringify(userData));
  if (userData?.email) {
    localStorage.setItem("zenith_user", "1");
  }
};

/**
 * Clear authentication data from cookies and local storage
 */
export const clearAuthData = () => {
  CookieHelper.removeItem(CookieKeys.TOKEN, {
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
  });
  localStorage.removeItem("user_data");
};

/**
 * Handle authentication errors with Firebase error messages
 */
export const handleAuthError = (error: any) => {
  if (errorMap[error.code]) {
    throw new Error(errorMap[error.code]);
  }
  throw error;
};

// Get user from localStorage to reduce initial loading time
export const getAuthData = (): User | null => {
  const userDataString = localStorage.getItem("user_data");
  const user: User | null = userDataString ? JSON.parse(userDataString) : null;
  return user;
};
