import { createRequest } from "./common";

export const createModulesRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/modules`,
  });
};

export const createModuleRequest = (courseId: string, moduleId: number) => {
  return createRequest({
    uri: `courses/${courseId}/modules/${moduleId}`,
  });
};
