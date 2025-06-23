import { CourseFeedbackSearchParams, FeedbackType } from "@/types/course";
import { useState } from "react";

export interface courseFeedbackSearchParamsHook {
  courseFeedbackSearchParams: CourseFeedbackSearchParams;
  setCourseFeedbackSearchParams: (
    courseFeedbackSearchParams: CourseFeedbackSearchParams
  ) => void;
  setSearchQuery: (searchQuery: string) => void;
  setStartDate: (startDate: Date | null) => void;
  setEndDate: (endDate: Date | null) => void;
  setFeedbackType: (feedbackType: FeedbackType) => void;
  resetFilters: () => void;
}

export function useCourseFeedbackSearchParams(): courseFeedbackSearchParamsHook {
  const [courseFeedbackSearchParams, setCourseFeedbackSearchParams] = useState(
    new CourseFeedbackSearchParams("", null, null, FeedbackType.ALL)
  );

  const setSearchQuery = (searchQuery: string) => {
    setCourseFeedbackSearchParams((prev) => ({ ...prev, searchQuery }));
  };
  const setStartDate = (startDate: Date | null) => {
    setCourseFeedbackSearchParams((prev) => ({ ...prev, startDate }));
  };
  const setEndDate = (endDate: Date | null) => {
    setCourseFeedbackSearchParams((prev) => ({ ...prev, endDate }));
  };
  const setFeedbackType = (feedbackType: FeedbackType) => {
    setCourseFeedbackSearchParams((prev) => ({ ...prev, feedbackType }));
  };
  const resetFilters = () => {
    setCourseFeedbackSearchParams(
      new CourseFeedbackSearchParams("", null, null, FeedbackType.ALL)
    );
  };

  return {
    courseFeedbackSearchParams,
    setCourseFeedbackSearchParams,
    setSearchQuery,
    setStartDate,
    setEndDate,
    setFeedbackType,
    resetFilters,
  };
}
