"use client";

import { useTopicContext } from "@/contexts/topic/topic-context";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";

const useRoadmapDetail = () => {
  const params = useParams();
  const { getTopicByIdApi } = useTopicContext();

  const topic = useMemo(
    () => getTopicByIdApi.data?.topic || null,
    [getTopicByIdApi.data],
  );
  const childTopics = useMemo(
    () => getTopicByIdApi.data?.childs || [],
    [getTopicByIdApi.data],
  );
  const parentTopic = useMemo(
    () => getTopicByIdApi.data?.parent || null,
    [getTopicByIdApi.data],
  );

  useEffect(() => {
    if (params.roadmapId) {
      getTopicByIdApi.call(params.roadmapId as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.roadmapId]);

  return {
    topic,
    childTopics,
    parentTopic,
    loading: getTopicByIdApi.loading,
    error: getTopicByIdApi.error,
  };
};

export default useRoadmapDetail;
