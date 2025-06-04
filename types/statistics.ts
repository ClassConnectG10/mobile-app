import { ActivitiesOption, ActivityType } from "./activity";

export class Statistics {
  constructor(
    public studentsCount: number,
    public publishedActivitiesCount: number,
    public completedSubmissionsCount: number,
    public unpublishedActivitiesCount: number,
    public overallAvgGrade: number,
    public avgGradesPerActivity: GradePerActivity[],
    public onTimeSubmissions: number,
    public lateSubmissions: number,
    public avgTimeDifferenceHours: number,
    public completionRate: number
  ) {}
}

export class GradePerActivity {
  constructor(public activityId: number, public avgGrade: number) {}
}

export class SubmissionStatisticsParams {
  constructor(
    public startDate: Date,
    public endDate: Date,
    public activityType?: ActivitiesOption,
    public activityId?: number,
    public studentId?: number
  ) {}
}

export class SubmissionStatistic {
  constructor(public date: Date, public count: number) {}
}

export class StudentActivityStatistics {
  constructor(
    public activityId: number,
    public type: ActivityType,
    public title: string,
    public dueDate: Date,
    public published: boolean,
    public submited: boolean,
    public grade?: number,
    public submissionDate?: Date
  ) {}
}

export class StudentStatistics {
  constructor(
    public publishedActivitiesCount: number,
    public completedSubmissionsCount: number,
    public onTimeSubmissions: number,
    public lateSubmissions: number,
    public avgTimeDifferenceHours: number,
    public overallAvgGrade: number,
    public avgTaskGrade: number,
    public avgExamGrade: number,
    public completionRate: number,
    public activities: StudentActivityStatistics[]
  ) {}
}
