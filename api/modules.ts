import { createRequest } from "./common";

export const createModuleRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/modules`,
  });
};

export const createGetModuleRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/modules`,
  });
};
