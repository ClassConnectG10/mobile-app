import { createRequest } from "./common";

export const createResourcesRequest = (courseId: string, moduleId: number) => {
  return createRequest({
    uri: `courses/${courseId}/modules/${moduleId}/resources`,
  });
};
