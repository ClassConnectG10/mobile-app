export enum ActivityType {
  TASK = "TASK",
  EXAM = "EXAM",
}

export const enum ActivitiesOption {
  ALL = "ALL",
  TASKS = "TASK",
  EXAMS = "EXAM",
}

export enum ActivityStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export class TeacherActivity {
  constructor(public activity: Activity, public visible: boolean) {}
}

export class StudentActivity {
  constructor(public activity: Activity, public status: ActivityStatus) {}
}

export class Activity {
  constructor(
    public resourceId: string,
    public type: ActivityType,
    public activityDetails: ActivityDetails
  ) {}
}

export class ActivityDetails {
  constructor(
    public title: string,
    public description: string,
    public instruction: string,
    public dueDate: Date
  ) {}
}
