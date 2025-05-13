import { ActivitiesOption } from "@/types/activity";
import { createRequest } from "./common";

export const createModuleRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/module`,
  });
};

export const createGetModuleRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/modules`,
  });
};

export const createTaskRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/task`,
  });
};

export const createExamRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/exam`,
  });
};

export const createActivitiesRequest = (
  courseId: string,
  activityType: ActivitiesOption
) => {
  if (activityType === ActivitiesOption.ALL) {
    return createRequest({
      uri: `courses/${courseId}/activity`,
    });
  } else {
    return createRequest({
      uri: `courses/${courseId}/activity`,
      params: {
        activity_type: activityType,
      },
    });
  }
};

export const createActivityRequest = (courseId: string, activityId: string) => {
  return createRequest({
    uri: `courses/${courseId}/activity/${activityId}`,
  });
};

export const createActivitySubmissionsRequest = (
  courseId: string,
  activityId: string
) => {
  return createRequest({
    uri: `courses/${courseId}/activity/${activityId}/submissions`,
  });
};

export const createActivitySubmissionRequest = (
  courseId: string,
  activityId: string,
  studentId: string
) => {
  return createRequest({
    uri: `courses/${courseId}/activity/${activityId}/submissions/${studentId}`,
  });
};
