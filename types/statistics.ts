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
    public completionRate: number,
  ) {}
}

export class GradePerActivity {
  constructor(public activityId: number, public avgGrade: number) {}
}
