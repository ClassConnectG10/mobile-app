export enum ActivityType {
  TASK = "TASK",
  EXAM = "EXAM",
}

export const enum ActivitiesOption {
  ALL = "ALL",
  TASKS = "TASK",
  EXAMS = "EXAM",
}

export enum ActivityStatusOption {
  ALL = "ALL",
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
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
    public submitedDate?: Date
  ) {}
}

export class Activity {
  constructor(
    public resourceId: number,
    public moduleId: number,
    public type: ActivityType,
    public activityDetails: TaskDetails | ExamDetails
  ) {}
}

export class TaskDetails {
  constructor(
    public title: string,
    public instructions: string,
    public dueDate: Date
  ) {}
}

export class ExamDetails {
  constructor(
    public moduleId: number,
    public title: string,
    public instructions: string,
    public examItems: ExamItem[],
    public dueDate: Date
  ) {}
}

export enum ExamItemType {
  OPEN = "OPEN",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
  MULTIPLE_SELECT = "MULTIPLE_SELECT",
}
export interface ExamItem {
  question: string;
  type: ExamItemType;
}

export class OpenQuestion implements ExamItem {
  type: ExamItemType;
  constructor(public question: string, public suggestedAnswer: string) {
    this.type = ExamItemType.OPEN;
  }
}

export class MultipleChoiceQuestion implements ExamItem {
  type: ExamItemType;
  constructor(
    public question: string,
    public options: string[],
    public correctAnswer?: number
  ) {
    this.type = ExamItemType.MULTIPLE_CHOICE;
  }
}

export class TrueFalseQuestion implements ExamItem {
  type: ExamItemType;
  constructor(public question: string, public correctAnswer?: boolean) {
    this.type = ExamItemType.TRUE_FALSE;
  }
}
export class MultipleSelectQuestion implements ExamItem {
  type: ExamItemType;
  constructor(
    public question: string,
    public options: string[],
    public correctAnswers: number[]
  ) {
    this.type = ExamItemType.MULTIPLE_SELECT;
  }
}

export class ActivitySubmission {
  constructor(
    public resourceId: number,
    public type: ActivityType,
    public studentId: number,
    public response: string,
    public submited: boolean,
    public dueDate: Date,
    public submissionDate?: Date
  ) {}
}
