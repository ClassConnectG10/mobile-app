import { createRequest } from "./common";

export const createResourcesRequest = (courseId: string, moduleId: number) => {
  return createRequest({
    uri: `courses/${courseId}/modules/${moduleId}/resources`,
  });
};

export const createResourceRequest = (
  courseId: string,
  moduleId: number,
  resourceId: number,
) => {
  return createRequest({
    uri: `courses/${courseId}/modules/${moduleId}/resources/${resourceId}`,
  });
};

export const createResourceFileUploadRequest = (
  courseId: string,
  moduleId: number,
  resourceId: number,
) => {
  return createRequest({
    uri: `courses/${courseId}/modules/${moduleId}/resources/${resourceId}/file`,
  });
};

export const createResourceLinkUploadRequest = (
  courseId: string,
  moduleId: number,
  resourceId: number,
) => {
  return createRequest({
    uri: `courses/${courseId}/modules/${moduleId}/resources/${resourceId}/link`,
  });
};

export const createAttachmentRequest = (
  courseId: string,
  moduleId: number,
  resourceId: number,
  attachmentId: number,
) => {
  return createRequest({
    uri: `courses/${courseId}/modules/${moduleId}/resources/${resourceId}/attachments/${attachmentId}`,
  });
};

export const createOrderResourcesRequest = (
  courseId: string,
  moduleId: number,
) => {
  return createRequest({
    uri: `courses/${courseId}/modules/${moduleId}/resources/order`,
  });
};
