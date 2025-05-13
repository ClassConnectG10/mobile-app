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

export const createTasksRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/task`,
  });
};

export const createExamsRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/exam`,
  });
};

export const createTaskRequest = (courseId: string, taskId: number) => {
  return createRequest({
    uri: `courses/${courseId}/task/${taskId}`,
  });
};

export const createExamRequest = (courseId: string, examId: number) => {
  return createRequest({
    uri: `courses/${courseId}/exam/${examId}`,
  });
};

export const createTaskPostRequest = (courseId: string, taskId: number) => {
  return createRequest({
    uri: `courses/${courseId}/task/${taskId}/post`,
  });
};

export const createExamPostRequest = (courseId: string, examId: number) => {
  return createRequest({
    uri: `courses/${courseId}/exam/${examId}/post`,
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

export const createActivityRequest = (courseId: string, activityId: number) => {
  return createRequest({
    uri: `courses/${courseId}/activity/${activityId}`,
  });
};

export const createActivitySubmissionsRequest = (
  courseId: string,
  activityId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/activity/${activityId}/submissions`,
  });
};

export const createActivitySubmissionRequest = (
  courseId: string,
  activityId: number,
  studentId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/activity/${activityId}/submissions/${studentId}`,
  });
};
