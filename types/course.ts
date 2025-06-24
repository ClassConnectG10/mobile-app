export enum SearchOption {
  ALL = "all",
  RELATED = "related",
  NOT_RELATED = "not_related",
  TAUGHT = "taught",
  ENROLLED = "enrolled",
}

export enum UserRole {
  OWNER = "OWNER",
  ASSISTANT = "INSTRUCTOR",
  STUDENT = "STUDENT",
  NON_PARTICIPANT = "NON_PARTICIPANT",
}

export enum CourseStatus {
  NEW = "NEW",
  STARTED = "STARTED",
  FINISHED = "FINISHED",
}

export enum FeedbackType {
  PASSED = "PASSED",
  FAILED = "FAILED",
  ALL = "ALL",
}

export class SearchFilters {
  constructor(
    public searchQuery: string,
    public startDate: Date | null,
    public endDate: Date | null,
    public level: string,
    public modality: string,
    public category: string,
    public favorites: boolean = false
  ) {}
}

export class Course {
  constructor(
    public courseId: string,
    public courseDetails: CourseDetails,
    public currentUserRole: UserRole,
    public courseStatus?: CourseStatus,
    public ownerId?: number,
    public numberOfStudens?: number,
    public isFavorite?: boolean
  ) {}
}

export class CourseDetails {
  constructor(
    public title: string,
    public description: string,
    public maxNumberOfStudents: number,
    public startDate: Date,
    public endDate: Date,
    public level: string,
    public modality: string,
    public category: string,
    public dependencies: string[] = []
  ) {}
}

export class CourseFeedback {
  constructor(
    public courseId: string,
    public mark: number,
    public feedback: string,
    public createdAt: Date,
    public userId?: number
  ) {}
}

export class CourseFeedbackSearchParams {
  constructor(
    public searchQuery: string = "",
    public startDate: Date | null = null,
    public endDate: Date | null = null,
    public feedbackType: FeedbackType = FeedbackType.ALL
  ) {}
}

export class CourseReview {
  constructor(
    public userId: number,
    public courseId: string,
    public mark: number,
    public comment: string,
    public createdAt: Date
  ) {}
}

export class CourseReviewSearchParams {
  constructor(
    public searchQuery: string = "",
    public startDate: Date | null = null,
    public endDate: Date | null = null,
    public mark: number | null = null
  ) {}
}
