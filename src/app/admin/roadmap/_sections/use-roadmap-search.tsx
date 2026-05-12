import { TopicApi } from "@/api/topic";
import { useTopicContext } from "@/contexts/topic/topic-context";
import useFunction from "@/hooks/use-function";
import usePagination from "@/hooks/use-pagination";
import { Topic } from "@/types/topic";
import { useEffect, useMemo, useState } from "react";

const useRoadmapSearch = () => {
  const { getTopicsApi } = useTopicContext();

  const deleteTopicApi = useFunction(TopicApi.deleteTopic, {
    successMessage: "Xóa topic thành công",
    onSuccess: ({ payload }: { payload: string }) => {
      if (getTopicsApi.data)
        getTopicsApi.setData({
          ...getTopicsApi.data,
          data: getTopicsApi.data?.data.filter((topic) => topic.id !== payload),
        });
    },
  });
  const pagination = usePagination({
    count: getTopicsApi.data?.total || 0,
    initialRowsPerPage: 10,
  });
  const [filter, setFilter] = useState<Partial<Topic>>({
    title: "",
  });

  const topics = useMemo(
    () => getTopicsApi.data?.data || [],
    [getTopicsApi.data],
  );

  useEffect(() => {
    getTopicsApi.call({
      page: pagination.page,
      limit: pagination.rowsPerPage,
      key: filter.title,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.rowsPerPage]);

  return {
    topics,
    pagination,
    getTopicsApi,
    filter,
    setFilter,
    deleteTopicApi,
  };
};

export default useRoadmapSearch;
