import { ForumSearchParams } from "@/types/forum";
import { createRequest, formatDate } from "./common";

export const createSearchForumQuestionsRequest = (
  courseId: string,
  forumSearchParams: ForumSearchParams
) => {
  const params: Record<string, string | string[]> = {};

  if (forumSearchParams.searchQuery && forumSearchParams.searchQuery !== "") {
    params.search = forumSearchParams.searchQuery;
  }

  if (forumSearchParams.startDate) {
    params.start_date = formatDate(forumSearchParams.startDate);
  }

  if (forumSearchParams.endDate) {
    params.end_date = formatDate(forumSearchParams.endDate);
  }

  if (forumSearchParams.orderBy) {
    params.order_by = forumSearchParams.orderBy;
  }

  if (forumSearchParams.tags.length > 0) {
    params.tags = forumSearchParams.tags;
  }

  return createRequest({
    uri: `courses/${courseId}/forum/questions`,
    params,
  });
};

export const createForumQuestionsRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/forum/questions`,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const createSearchForumQuestionRequest = (
  courseId: string,
  questionId: number,
  forumSearchParams: ForumSearchParams
) => {
  const params: Record<string, string | string[]> = {};

  if (forumSearchParams.searchQuery && forumSearchParams.searchQuery !== "") {
    params.search = forumSearchParams.searchQuery;
  }

  if (forumSearchParams.startDate) {
    params.start_date = formatDate(forumSearchParams.startDate);
  }

  if (forumSearchParams.endDate) {
    params.end_date = formatDate(forumSearchParams.endDate);
  }

  if (forumSearchParams.orderBy) {
    params.order_by = forumSearchParams.orderBy;
  }
  return createRequest({
    uri: `courses/${courseId}/forum/questions/${questionId}`,
    params,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const createForumQuestionRequest = (
  courseId: string,
  questionId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/forum/questions/${questionId}`,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const createForumAnswerRequest = (
  courseId: string,
  questionId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/forum/questions/${questionId}/answers`,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const createGetForumAnswersRequest = (
  courseId: string,
  answerId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/forum/answers/${answerId}/thread`,
  });
};

export const createEditForumAnswerRequest = (
  courseId: string,
  answerId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/forum/answers/${answerId}`,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const createRemoveForumQuestionFileRequest = (
  courseId: string,
  questionId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/forum/questions/${questionId}/file`,
  });
};

export const createRemoveForumAnswerFileRequest = (
  courseId: string,
  answerId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/forum/answers/${answerId}/file`,
  });
};

export const createForumVoteAnswerRequest = (
  courseId: string,
  answerId: number,
  vote: 0 | 1 | -1
) => {
  return createRequest({
    uri: `courses/${courseId}/forum/answers/${answerId}/vote`,
    params: {
      vote: String(vote),
    },
  });
};

export const createForumAcceptAnswerRequest = (
  courseId: string,
  questionId: number,
  answerId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/forum/questions/${questionId}/accept/${answerId}`,
  });
};
