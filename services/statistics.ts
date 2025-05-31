import {
  createStatisticsRequest,
  createSubmissionStatisticsRequest,
} from "@/api/statistics";
import {
  GradePerActivity,
  Statistics,
  SubmissionStatistic,
  SubmissionStatisticsParams,
} from "@/types/statistics";

export async function getStatistics(courseId: string): Promise<Statistics> {
  const request = await createStatisticsRequest(courseId);
  const response = await request.get("");
  const responseData = response.data.data;

  return new Statistics(
    responseData.students_count,
    responseData.published_activities_count,
    responseData.completed_submissions_count,
    responseData.unpublished_activities_count,
    responseData.overall_avg_grade,
    Object.entries(responseData.avg_grades_per_activity).map(
      ([activityId, avgGrade]: [string, number]) =>
        new GradePerActivity(Number(activityId), avgGrade),
    ),
    responseData.on_time_submissions,
    responseData.late_submissions,
    responseData.avg_time_difference_hours,
    responseData.completion_rate / 100,
  );
}

export async function getSubmissionStatistics(
  courseId: string,
  submissionStatisticsParams: SubmissionStatisticsParams,
): Promise<SubmissionStatistic[]> {
  const request = await createSubmissionStatisticsRequest(
    courseId,
    submissionStatisticsParams,
  );
  const response = await request.get("");
  const responseData = response.data.data;

  return responseData.map(
    (stat: { date: string; count: number }) =>
      new SubmissionStatistic(new Date(stat.date), stat.count),
  );
}
