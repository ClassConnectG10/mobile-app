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
