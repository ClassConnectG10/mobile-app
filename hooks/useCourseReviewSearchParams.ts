import {
  CourseReviewSearchParams,
} from "@/types/course";
import { useState } from "react";

export interface courseReviewSearchParamsHook {
  courseReviewSearchParams: CourseReviewSearchParams;
  setCourseReviewSearchParams: (
    courseReviewSearchParams: CourseReviewSearchParams
  ) => void;
  setSearchQuery: (searchQuery: string) => void;
  setStartDate: (startDate: Date | null) => void;
  setEndDate: (endDate: Date | null) => void;
  setMark: (mark: number | null) => void;
  resetFilters: () => void;
}

export function useCourseReviewSearchParams(): courseReviewSearchParamsHook {
  const [courseReviewSearchParams, setCourseReviewSearchParams] = useState(
    new CourseReviewSearchParams("", null, null, null)
  );

  const setSearchQuery = (searchQuery: string) => {
    setCourseReviewSearchParams((prev) => ({ ...prev, searchQuery }));
  };
  const setStartDate = (startDate: Date | null) => {
    setCourseReviewSearchParams((prev) => ({ ...prev, startDate }));
  };
  const setEndDate = (endDate: Date | null) => {
    setCourseReviewSearchParams((prev) => ({ ...prev, endDate }));
  };
  const setMark = (mark: number | null) => {
    setCourseReviewSearchParams((prev) => ({ ...prev, mark }));
  };
  const resetFilters = () => {
    setCourseReviewSearchParams(
      new CourseReviewSearchParams("", null, null, null)
    );
  };

  return {
    courseReviewSearchParams,
    setCourseReviewSearchParams,
    setSearchQuery,
    setStartDate,
    setEndDate,
    setMark,
    resetFilters,
  };
}
