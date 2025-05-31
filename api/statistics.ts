import { SubmissionStatisticsParams } from "@/types/statistics";
import { createRequest, formatDate } from "./common";

export const createStatisticsRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/statistics`,
  });
};

export const createSubmissionStatisticsRequest = (
  courseId: string,
  submissionStatisticsParams: SubmissionStatisticsParams,
) => {
  const params: Record<string, string> = {};

  if (submissionStatisticsParams.activityType) {
    params.ActivityType = submissionStatisticsParams.activityType;
  }

  if (submissionStatisticsParams.activityId) {
    params.resource_id = submissionStatisticsParams.activityId.toString();
  }

  if (submissionStatisticsParams.studentId) {
    params.student_id = submissionStatisticsParams.studentId.toString();
  }

  if (submissionStatisticsParams.startDate) {
    params.start_date = formatDate(submissionStatisticsParams.startDate);
  }

  if (submissionStatisticsParams.endDate) {
    params.end_date = formatDate(submissionStatisticsParams.endDate);
  }

  return createRequest({
    uri: `courses/${courseId}/statistics/submissions`,
    params,
  });
};
