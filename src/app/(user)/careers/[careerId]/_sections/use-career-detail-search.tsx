"use client";

import { CareerApi } from "@/api/career";
import useFunction from "@/hooks/use-function";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";

const useCareerDetailSearch = () => {
  const params = useParams();
  const getCareersByIdApi = useFunction(CareerApi.getCareerById, {
    disableResetOnCall: true,
  });
  const getCareerAnalyticsApi = useFunction(CareerApi.getCareerAnalytics, {
    disableResetOnCall: true,
  });
  const getCareerDetailByIdApi = useFunction(CareerApi.getCareerDetailById, {
    disableResetOnCall: true,
  });

  const career = useMemo(
    () => getCareersByIdApi.data,
    [getCareersByIdApi.data],
  );
  const careerAnalytics = useMemo(
    () => getCareerAnalyticsApi.data || [],
    [getCareerAnalyticsApi.data],
  );
  const careerDetail = useMemo(
    () => getCareerDetailByIdApi.data,
    [getCareerDetailByIdApi.data],
  );
  useEffect(() => {
    if (params.careerId) {
      getCareersByIdApi.call(params.careerId as string);
      getCareerAnalyticsApi.call(params.careerId as string);
      getCareerDetailByIdApi.call(params.careerId as string);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.careerId]);

  return {
    getCareersByIdApi,
    careerAnalytics,
    getCareerAnalyticsApi,
    career,
    careerDetail,
    getCareerDetailByIdApi,
  };
};

export default useCareerDetailSearch;
