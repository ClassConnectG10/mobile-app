export enum ActivityType {
  TASK = "TASK",
  EXAM = "EXAM",
}

export const enum ActivitiesOption {
  ALL = "ALL",
  TASKS = "TASK",
  EXAMS = "EXAM",
}

export enum StudentActivityFilter {
  ALL = "ALL",
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
}

export enum TeacherActivityFilter {
  ALL = "ALL",
  PUBLISHED = "PUBLISHED",
  UNPUBLISHED = "UNPUBLISHED",
}

export class TeacherActivity {
  constructor(public activity: Activity, public visible: boolean) {}
}

export class StudentActivity {
  constructor(
    public activity: Activity,
    public submited: boolean,
    public submitedDate?: Date,
  ) {}
}

export class Activity {
  constructor(
    public resourceId: number,
    public type: ActivityType,
    public activityDetails: ActivityDetails,
  ) {}
}

export class ActivityDetails {
  constructor(
    public title: string,
    public description: string,
    public instruction: string,
    public dueDate: Date,
  ) {}
}

export class ActivitySubmission {
  constructor(
    public resourceId: number,
    public type: ActivityType,
    public studentId: number,
    public response: string,
    public submited: boolean,
    public submissionDate?: Date,
  ) {}
}
