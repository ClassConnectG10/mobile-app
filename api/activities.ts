import { ActivitiesOption } from "@/types/activity";
import { createRequest } from "./common";

export const createTasksRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/activities/tasks`,
  });
};

export const createExamsRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/activities/exams`,
  });
};

export const createTaskRequest = (courseId: string, taskId: number) => {
  return createRequest({
    uri: `courses/${courseId}/activities/tasks/${taskId}`,
  });
};

export const createExamRequest = (courseId: string, examId: number) => {
  return createRequest({
    uri: `courses/${courseId}/activities/exams/${examId}`,
  });
};

export const createTaskPostRequest = (courseId: string, taskId: number) => {
  return createRequest({
    uri: `courses/${courseId}/activities/tasks/${taskId}/post`,
  });
};

export const createExamPostRequest = (courseId: string, examId: number) => {
  return createRequest({
    uri: `courses/${courseId}/activities/exams/${examId}/post`,
  });
};

export const createActivitiesRequest = (
  courseId: string,
  activityType: ActivitiesOption
) => {
  if (activityType === ActivitiesOption.ALL) {
    return createRequest({
      uri: `courses/${courseId}/activities`,
    });
  } else {
    return createRequest({
      uri: `courses/${courseId}/activities`,
      params: {
        activity_type: activityType,
      },
    });
  }
};

export const createActivityRequest = (courseId: string, activityId: number) => {
  return createRequest({
    uri: `courses/${courseId}/activities/${activityId}`,
  });
};

export const createActivitySubmissionsRequest = (
  courseId: string,
  activityId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/activities/${activityId}/submissions`,
  });
};

export const createActivitySubmissionRequest = (
  courseId: string,
  activityId: number,
  studentId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/activities/${activityId}/submissions/${studentId}`,
  });
};

export const createTaskSubmissionPostRequest = (
  courseId: string,
  activityId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/activities/tasks/${activityId}/submit`,
  });
};

export const createExamSubmissionPostRequest = (
  courseId: string,
  activityId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/activities/exams/${activityId}/submit`,
  });
};
