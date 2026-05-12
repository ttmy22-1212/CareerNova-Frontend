"use client";

import { TopicApi, TopicResponse } from "@/api/topic";
import useFunction, {
  DEFAULT_FUNCTION_RETURN,
  UseFunctionReturnType,
} from "@/hooks/use-function";
import { Topic } from "@/types/topic";
import { createContext, useContext } from "react";

interface ContextValue {
  getTopicsApi: UseFunctionReturnType<
    {
      page?: number;
      limit?: number;
      key?: string;
    },
    TopicResponse
  >;
  getTopicByIdApi: UseFunctionReturnType<
    string,
    {
      topic: Topic;
      childs: Topic[];
      parent: Topic | null;
    }
  >;
}

const TopicContext = createContext<ContextValue>({
  getTopicsApi: DEFAULT_FUNCTION_RETURN,
  getTopicByIdApi: DEFAULT_FUNCTION_RETURN,
});

export const TopicProvider = ({ children }: { children: React.ReactNode }) => {
  const getTopicsApi = useFunction(TopicApi.getTopics, {
    disableResetOnCall: true,
  });
  const getTopicByIdApi = useFunction(TopicApi.getTopicById);

  return (
    <TopicContext.Provider
      value={{
        getTopicByIdApi,
        getTopicsApi,
      }}
    >
      {children}
    </TopicContext.Provider>
  );
};

export const useTopicContext = () => useContext(TopicContext);
