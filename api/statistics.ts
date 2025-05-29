import { createRequest } from "./common";

export const createStatisticsRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/statistics`,
  });
};
