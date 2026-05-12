"use client";

import { PostApi, PostResponse } from "@/api/forum/post";
import useFunction, {
  DEFAULT_FUNCTION_RETURN,
  UseFunctionReturnType,
} from "@/hooks/use-function";
import { Post } from "@/types/post";
import { createContext, useContext } from "react";

interface PostContextValue {
  getPostsApi: UseFunctionReturnType<
    {
      offset?: number;
      limit?: number;
      key?: string;
      user_id?: string;
    },
    PostResponse
  >;
  getFollowedPostsApi: UseFunctionReturnType<
    {
      offset?: number;
      limit?: number;
      key?: string;
    },
    PostResponse
  >;
  getPostByIdApi: UseFunctionReturnType<string, Post>;
  createPostApi: UseFunctionReturnType<
    { content: string; image_url?: string[] },
    Post
  >;
  // updatePostApi: UseFunctionReturnType<
  //   string,
  //   { content: string; image_url?: string[] },
  //   Post
  // >;
  removePostApi: UseFunctionReturnType<string, void>;
  likePostApi: UseFunctionReturnType<string, void>;
  unlikePostApi: UseFunctionReturnType<string, void>;
  savePostApi: UseFunctionReturnType<string, void>;
  unsavePostApi: UseFunctionReturnType<string, void>;
  checkSavedApi: UseFunctionReturnType<string, { isSaved: boolean }>;
}

const PostContext = createContext<PostContextValue>({
  getPostsApi: DEFAULT_FUNCTION_RETURN,
  getFollowedPostsApi: DEFAULT_FUNCTION_RETURN,
  getPostByIdApi: DEFAULT_FUNCTION_RETURN,
  createPostApi: DEFAULT_FUNCTION_RETURN,
  // updatePostApi: DEFAULT_FUNCTION_RETURN,
  removePostApi: DEFAULT_FUNCTION_RETURN,
  likePostApi: DEFAULT_FUNCTION_RETURN,
  unlikePostApi: DEFAULT_FUNCTION_RETURN,
  savePostApi: DEFAULT_FUNCTION_RETURN,
  unsavePostApi: DEFAULT_FUNCTION_RETURN,
  checkSavedApi: DEFAULT_FUNCTION_RETURN,
});

export const PostProvider = ({ children }: { children: React.ReactNode }) => {
  const getPostsApi = useFunction(PostApi.getPosts, { disableResetOnCall: true });
  const getFollowedPostsApi = useFunction(PostApi.getFollowedPosts, {
    disableResetOnCall: true,
  });
  const getPostByIdApi = useFunction(PostApi.getPostById);
  const createPostApi = useFunction(PostApi.createPost);
  // const updatePostApi = useFunction(PostApi.updatePost);
  const removePostApi = useFunction(PostApi.removePost);
  const likePostApi = useFunction(PostApi.likePost);
  const unlikePostApi = useFunction(PostApi.unlikePost);
  const savePostApi = useFunction(PostApi.savePost);
  const unsavePostApi = useFunction(PostApi.unsavePost);
  const checkSavedApi = useFunction(PostApi.checkSaved);

  return (
    <PostContext.Provider
      value={{
        getPostsApi,
        getFollowedPostsApi,
        getPostByIdApi,
        createPostApi,
        // updatePostApi,
        removePostApi,
        likePostApi,
        unlikePostApi,
        savePostApi,
        unsavePostApi,
        checkSavedApi,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = () => useContext(PostContext);