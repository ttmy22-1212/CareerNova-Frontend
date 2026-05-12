"use client";

import { CommentApi, CommentResponse } from "@/api/forum/comment";
import useFunction, {
  DEFAULT_FUNCTION_RETURN,
  UseFunctionReturnType,
} from "@/hooks/use-function";
import { Comment } from "@/types/comment";
import { createContext, useContext } from "react";

interface CommentContextValue {
  getCommentsApi: UseFunctionReturnType<
    {
      offset?: number;
      limit?: number;
      key?: string;
      post_id?: string;
    },
    CommentResponse
  >;
  createCommentApi: UseFunctionReturnType<
    { content: string; post_id: string; image_url?: string[] },
    Comment
  >;
}

const CommentContext = createContext<CommentContextValue>({
  getCommentsApi: DEFAULT_FUNCTION_RETURN,
  createCommentApi: DEFAULT_FUNCTION_RETURN,
});

export const CommentProvider = ({ children }: { children: React.ReactNode }) => {
  const getCommentsApi = useFunction(CommentApi.getComments, { disableResetOnCall: true });
  const createCommentApi = useFunction(CommentApi.createComment);

  return (
    <CommentContext.Provider
      value={{
        getCommentsApi,
        createCommentApi,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
};

export const useCommentContext = () => useContext(CommentContext);