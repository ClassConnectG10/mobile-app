import { createRequest } from "./common";

export const createForumQuestionsRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/forum/questions`,
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
