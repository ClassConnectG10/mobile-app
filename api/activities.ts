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

export const createPublishTaskRequest = (courseId: string, taskId: number) => {
  return createRequest({
    uri: `courses/${courseId}/activities/tasks/${taskId}/post`,
  });
};

export const createPublishExamRequest = (courseId: string, examId: number) => {
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

export const createSubmitTaskRequest = (courseId: string, taskId: number) => {
  return createRequest({
    uri: `courses/${courseId}/activities/tasks/${taskId}/submit`,
  });
};

export const createSubmitExamRequest = (
  courseId: string,
  activityId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/activities/exams/${activityId}/submit-answers`,
  });
};

export const createUploadTaskFileRequest = (
  courseId: string,
  taskId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/activities/tasks/${taskId}/upload`,
  });
};

export const createDeleteTaskFileRequest = (
  courseId: string,
  taskId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/activities/tasks/${taskId}/file`,
  });
};

export const createGradeSubmissionRequest = (
  courseId: string,
  activityId: number,
  studentId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/activities/${activityId}/grade/${studentId}`,
  });
};

export const createGetSubmissionsByStudentRequest = (
  courseId: string,
  studentId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/activities/submissions/${studentId}`,
  });
};

export const createAutocorrectExamRequest = (
  courseId: string,
  examId: number,
  studentId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/exams/${examId}/student/${studentId}/autocorrect`,
  });
};

export const createGetExamAutocorrectionRequest = (
  courseId: string,
  examId: number,
  studentId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/exams/${examId}/student/${studentId}/autocorrect/status`,
  });
};

export const createAutocorrectTaskRequest = (
  courseId: string,
  taskId: number,
  studentId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/tasks/${taskId}/student/${studentId}/autocorrect`,
  });
};

export const createGetTaskAutocorrectionRequest = (
  courseId: string,
  taskId: number,
  studentId: number
) => {
  return createRequest({
    uri: `courses/${courseId}/tasks/${taskId}/student/${studentId}/autocorrect/status`,
  });
};
