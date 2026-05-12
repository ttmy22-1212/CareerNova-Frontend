"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import UsersApi from "@/api/users";
import useFunction, {
  DEFAULT_FUNCTION_RETURN,
  type UseFunctionReturnType,
} from "@/hooks/use-function";
import type { User, UserTopicProgress } from "@/types/user";
import { UserTopicStatus } from "@/types/user";
import { useAuth } from "../auth/firebase-context";

interface ContextValue {

  getTopicProgressApi: UseFunctionReturnType<string, UserTopicProgress[]>;
  createTopicProgressApi: UseFunctionReturnType<
    {
      topicId: string;
      status: UserTopicStatus;
      notes?: string;
      rating?: number;
    },
    void
  >;
  deleteTopicProgressApi: UseFunctionReturnType<string, { message: string }>;

  // Helper functions
  getTopicProgress: (topicId: string) => UserTopicProgress | undefined;
  updateTopicProgress: (
    topicId: string,
    status: UserTopicStatus,
    notes?: string,
    rating?: number,
  ) => Promise<void>;
  removeTopicProgress: (topicId: string) => Promise<void>;

  // Cache management
  clearProgressCache: () => void;
  refreshTopicProgress: (topicId: string) => Promise<void>;
}

const UserContext = createContext<ContextValue>({
  getTopicProgressApi: DEFAULT_FUNCTION_RETURN,
  createTopicProgressApi: DEFAULT_FUNCTION_RETURN,
  deleteTopicProgressApi: DEFAULT_FUNCTION_RETURN,
  getTopicProgress: () => undefined,
  updateTopicProgress: async () => {},
  removeTopicProgress: async () => {},
  clearProgressCache: () => {},
  refreshTopicProgress: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [progressCache, setProgressCache] = useState<
    Record<string, UserTopicProgress>
  >({});
  const [progressFetchAttempts, setProgressFetchAttempts] = useState<
    Record<string, boolean>
  >({});

  const getTopicProgressApi = useFunction(UsersApi.getTopicProgressByTopicId);
  const createTopicProgressApi = useFunction(UsersApi.createTopicProgress);
  const deleteTopicProgressApi = useFunction(UsersApi.deleteTopicProgress);

  const getTopicProgress = useCallback(
    (topicId: string): UserTopicProgress | undefined => {
      if (progressCache[topicId]) {
        return progressCache[topicId];
      }

      if (user?.email && !progressFetchAttempts[topicId]) {
        setProgressFetchAttempts((prev) => ({
          ...prev,
          [topicId]: true,
        }));

        refreshTopicProgress(topicId);
      }

      return undefined;
    },
    [progressCache, user?.email, progressFetchAttempts],
  );

  const refreshTopicProgress = useCallback(
    async (topicId: string): Promise<void> => {
      if (!user?.email) return;

      try {
        const progressList = await getTopicProgressApi.call(topicId);

        setProgressCache((prev) => {
          const newCache = { ...prev };

          if (Array.isArray(progressList)) {
            progressList.forEach((progress) => {
              if (progress?.topic_id) {
                newCache[progress.topic_id] = progress;
              }
            });
          } else {
            console.warn("⚠️ progressList không phải mảng:", progressList);
          }

          return newCache;
        });
      } catch (error) {
        console.error("Error refreshing topic progress:", error);
      }
    },
    [user?.email, getTopicProgressApi],
  );

  const updateTopicProgress = useCallback(
    async (
      topicId: string,
      status: UserTopicStatus,
      notes?: string,
      rating?: number,
    ): Promise<void> => {
      try {
        if (user?.email) {
          await createTopicProgressApi.call({ topicId, status, notes, rating });
        }

        setProgressCache((prev) => ({
          ...prev,
          [topicId]: {
            user_id: user?.id || "",
            topic_id: topicId,
            status,
            notes,
            rating,
            ...(status === UserTopicStatus.IN_PROGRESS
              ? { started_at: new Date() }
              : {}),
            ...(status === UserTopicStatus.COMPLETED
              ? { completed_at: new Date() }
              : {}),
          },
        }));
      } catch (err) {
        console.error("Error updating topic progress:", err);
        throw err;
      }
    },
    [user?.email, createTopicProgressApi, user],
  );

  const removeTopicProgress = useCallback(
    async (topicId: string): Promise<void> => {
      try {
        if (user?.email) {
          await deleteTopicProgressApi.call(topicId);
        }

        // Update cache
        setProgressCache((prev) => {
          const newCache = { ...prev };
          delete newCache[topicId];
          return newCache;
        });
      } catch (err) {
        console.error("Error removing topic progress:", err);
        throw err;
      }
    },
    [user?.email, deleteTopicProgressApi],
  );

  // Clear progress cache
  const clearProgressCache = useCallback(() => {
    setProgressCache({});
    setProgressFetchAttempts({});
  }, []);

  return (
    <UserContext.Provider
      value={{
        getTopicProgressApi,
        createTopicProgressApi,
        deleteTopicProgressApi,
        getTopicProgress,
        updateTopicProgress,
        removeTopicProgress,
        clearProgressCache,
        refreshTopicProgress,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
