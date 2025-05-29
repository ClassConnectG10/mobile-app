import { SearchFilters, SearchOption } from "@/types/course";
import { createRequest, formatDate } from "./common";

export const createCoursesRequest = () => {
  return createRequest({
    uri: `courses/`,
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
  searchOption: SearchOption,
) => {
  const params: Record<string, string> = {
    search_option: searchOption,
  };

  if (searchFilters.searchQuery && searchFilters.searchQuery !== "") {
    params.search = searchFilters.searchQuery;
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

  if (searchFilters.favorites) {
    params.favorite = "true";
  }

  return createRequest({
    uri: `courses`,
    params,
  });
};

export const createFavoriteCourseRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/favorite`,
  });
};

export const createStartCourseRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/start`,
  });
};

export const createAssistantsRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/instructors`,
  });
};

export const createAddAssistantRequest = (
  courseId: string,
  assistantId: number,
) => {
  return createRequest({
    uri: `courses/${courseId}/instructors`,
    params: {
      user_id: assistantId.toString(),
    },
  });
};

export const createAssistantRequest = (
  courseId: string,
  assistantId: number,
) => {
  return createRequest({
    uri: `courses/${courseId}/instructors/${assistantId}`,
  });
};

export const createStudentsRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/students`,
  });
};

export const createStudentRequest = (courseId: string, studentId: number) => {
  return createRequest({
    uri: `courses/${courseId}/students/${studentId}`,
  });
};

export const createStudentMarkRequest = (
  courseId: string,
  studentId: number,
) => {
  return createRequest({
    uri: `courses/${courseId}/marks/students/${studentId}`,
  });
};

export const createMarksRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/marks`,
  });
};

export const createAssistantLogsRequest = (
  courseId: string,
  assistantId: number,
) => {
  return createRequest({
    uri: `courses/${courseId}/instructors/${assistantId}/logs`,
  });
};
