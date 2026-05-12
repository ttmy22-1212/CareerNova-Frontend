import { CareerApi } from "@/api/career";
import { useMainContext } from "@/contexts/main/main-context";
import useFunction from "@/hooks/use-function";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getFilterConfig } from "./filter-config";
import usePagination from "@/hooks/use-pagination";
import { TopicApi } from "@/api/topic";

const useCareerSearch = () => {
  const getCareersApi = useFunction(CareerApi.getCareers, {
    disableResetOnCall: false,
  });
  const getTopicApi = useFunction(TopicApi.getTopics);
  const { getSkillsApi } = useMainContext();
  const [filter, setFilter] = useState({
    skills: [],
    salary: [undefined, undefined],
    major: "",
    experience: [undefined, undefined],
    key: "",
  });
  useEffect(() => {
    getTopicApi.call({ limit: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const topics = useMemo(
    () => getTopicApi.data?.data || [],
    [getTopicApi.data],
  );
  const skills = useMemo(() => getSkillsApi.data || [], [getSkillsApi.data]);

  const filterConfig = useMemo(
    () =>
      getFilterConfig({
        options: {
          skills: skills.map((skill) => ({
            value: skill.id,
            label: skill.name,
          })),
          experience: [
            { value: [0, 0], label: "Mới tốt nghiệp" },
            { value: [0, 1], label: "Dưới 1 năm" },
            { value: [1, 3], label: "1-3 năm" },
            { value: [3, 5], label: "3-5 năm" },
            { value: [5, 0], label: "> 5 năm" },
          ],
          salary: [
            { value: [undefined, undefined], label: "Tất cả" },
            { value: [undefined, 5_000_000], label: "Dưới 5 triệu" },
            { value: [5_000_000, 10_000_000], label: "5 triệu - 10 triệu" },
            { value: [10_000_000, 20_000_000], label: "10 triệu - 20 triệu" },
            { value: [20_000_000, 30_000_000], label: "20 triệu - 30 triệu" },
            { value: [30_000_000, undefined], label: "> 30 triệu" },
          ],
          major: topics.map((topic) => ({
            value: topic.id,
            label: topic.title,
          })),
        },
      }),
    [skills],
  );

  const careers = useMemo(
    () => getCareersApi.data?.data || [],
    [getCareersApi.data],
  );

  const handleSubmitFilter = useCallback((filter: any) => {
    setFilter(filter);
  }, []);

  const pagination = usePagination({
    count: getCareersApi.data?.total || 0,
    initialRowsPerPage: 4,
  });

  useEffect(() => {
    if (getCareersApi.callCount === 0) return;
    getCareersApi.call({
      salary_min: filter.salary[0],
      salary_max: filter.salary[1],
      experience_min: filter.experience[0],
      experience_max: filter.experience[1],
      skills: filter.skills.length > 0 ? filter.skills : undefined,
      major: filter.major,
      offset: pagination.page * pagination.rowsPerPage,
      limit: pagination.rowsPerPage,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.rowsPerPage]);

  return {
    getCareersApi,
    skills,
    filterConfig,
    filter,
    handleSubmitFilter,
    careers,
    pagination,
  };
};

export default useCareerSearch;
