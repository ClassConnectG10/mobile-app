import { SearchFilters, SearchOption } from "@/types/course";
import { createRequest, formatDate } from "./common";

export const createCoursesRequest = () => {
  return createRequest({
    uri: `courses`,
  });
};

export const createCourseRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}`,
  });
};

export const createEnrollCourseRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/regist`,
  });
};

export const createSearchCoursesRequest = (
  searchFilters: SearchFilters,
  searchOption: SearchOption
) => {
  const params: Record<string, string> = {
    search_option: searchOption,
  };

  if (searchFilters.searchQuery && searchFilters.searchQuery !== "") {
    params.search_query = searchFilters.searchQuery;
  }

  if (searchFilters.startDate) {
    params.start_date = formatDate(searchFilters.startDate);
  }

  if (searchFilters.endDate) {
    params.end_date = formatDate(searchFilters.endDate);
  }

  if (searchFilters.modality && searchFilters.modality !== "") {
    params.modality = searchFilters.modality;
  }

  if (searchFilters.level && searchFilters.level !== "") {
    params.level = searchFilters.level;
  }

  if (searchFilters.category && searchFilters.category !== "") {
    params.category = searchFilters.category;
  }

  return createRequest({
    uri: `courses`,
    params,
  });
};
