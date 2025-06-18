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
  questionId: string
) => {
  return createRequest({
    uri: `courses/${courseId}/forum/questions/${questionId}`,
  });
};
