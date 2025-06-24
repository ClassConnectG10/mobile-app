import {
  CourseFeedbackSearchParams,
  CourseReview,
  CourseReviewSearchParams,
  FeedbackType,
  SearchFilters,
  SearchOption,
} from "@/types/course";
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
  searchOption: SearchOption
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

export const createFinishCourseRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/finish`,
  });
};

export const createAssistantsRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/instructors`,
  });
};

export const createAddAssistantRequest = (
  courseId: string,
  assistantId: number
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
  assistantId: number
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
  studentId: number
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
  assistantId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/instructors/${assistantId}/logs`,
  });
};

export const createFeedbacksRequest = (
  searchParams: CourseFeedbackSearchParams | null
) => {
  const params: Record<string, string | string[]> = {};

  params.limit = "100";

  if (searchParams?.searchQuery && searchParams.searchQuery !== "") {
    params.feedback_search = searchParams.searchQuery;
  }

  if (searchParams.startDate) {
    params.from_date = formatDate(searchParams.startDate);
  }

  if (searchParams.endDate) {
    params.to_date = formatDate(searchParams.endDate);
  }

  switch (searchParams?.feedbackType) {
    case FeedbackType.PASSED:
      params.mark_min = "4";
      break;
    case FeedbackType.FAILED:
      params.mark_max = "3";
      break;
  }

  return createRequest({
    uri: `courses/my-feedbacks`,
    params,
  });
};

export const createCourseFeedbackRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/feedback`,
  });
};

export const createCourseFeedbacksRequest = (
  courseId: string,
  searchParams: CourseReviewSearchParams | null
) => {
  const params: Record<string, string | string[]> = {};

  params.limit = "100";

  if (searchParams?.searchQuery && searchParams.searchQuery !== "") {
    params.feedback_search = searchParams.searchQuery;
  }

  if (searchParams?.startDate) {
    params.from_date = formatDate(searchParams.startDate);
  }

  if (searchParams?.endDate) {
    params.to_date = formatDate(searchParams.endDate);
  }

  if (searchParams?.mark !== undefined && searchParams?.mark !== null) {
    params.mark = searchParams.mark.toString();
  }

  return createRequest({
    uri: `courses/${courseId}/feedbacks`,
    params,
  });
};
