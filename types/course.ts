export enum SearchOption {
  ALL = "all",
  RELATED = "related",
  NOT_RELATED = "not_related",
  TAUGHT = "taught",
  ENROLLED = "enrolled",
}

export enum UserRole {
  OWNER = "OWNER",
  ASSISTANT = "ASSISTANT",
  STUDENT = "STUDENT",
  NON_PARTICIPANT = "NON_PARTICIPANT",
}

export enum CourseStatus {
  NEW = "NEW",
  STARTED = "STARTED",
  FINISHED = "FINISHED",
}

export class SearchFilters {
  constructor(
    public searchQuery: string,
    public startDate: Date | null,
    public endDate: Date | null,
    public level: string,
    public modality: string,
    public category: string,
    public favorites: boolean = false,
  ) {}
}

export class Course {
  constructor(
    public courseId: string,
    public ownerId: number,
    public courseDetails: CourseDetails,
    public currentUserRole: UserRole,
    public courseStatus: CourseStatus,
    public numberOfStudens?: number,
    public isFavorite?: boolean,
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
    public dependencies: string[] = [],
  ) {}
}
