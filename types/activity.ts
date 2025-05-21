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
  OPEN = "QUESTION",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_OR_FALSE",
  MULTIPLE_SELECT = "MULTISELECTION",
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

export interface ActivitySubmission {
  resourceId: number;
  type: ActivityType;
  studentId: number;
  submited: boolean;
  dueDate: Date;
  submissionDate?: Date;
}

// export class TaskSubmission {

// }

export class ExamSubmission implements ActivitySubmission {
  type: ActivityType;
  constructor(
    public resourceId: number,
    public studentId: number,
    public submittedExamItems: SubmittedExamItem[],
    public submited: boolean,
    public dueDate: Date,
    public submissionDate?: Date
  ) {
    this.type = ActivityType.EXAM;
  }
}

export class SubmittedExamItem {
  constructor(
    public questionIndex: number,
    public type: ExamItemType,
    public answer: ExamItemAnswer,
    public correct?: boolean
  ) {}
}

export interface ExamItemAnswer {
  type: ExamItemType;
}

export class OpenAnswer implements ExamItemAnswer {
  type: ExamItemType;
  constructor(public answer: string) {
    this.type = ExamItemType.OPEN;
  }
}

export class MultipleChoiceAnswer implements ExamItemAnswer {
  type: ExamItemType;
  constructor(public answer: number) {
    this.type = ExamItemType.MULTIPLE_CHOICE;
  }
}

export class TrueFalseAnswer implements ExamItemAnswer {
  type: ExamItemType;
  constructor(public answer: boolean) {
    this.type = ExamItemType.TRUE_FALSE;
  }
}

export class MultipleSelectAnswer implements ExamItemAnswer {
  type: ExamItemType;
  constructor(public answers: number[]) {
    this.type = ExamItemType.MULTIPLE_SELECT;
  }
}
