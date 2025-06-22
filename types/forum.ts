import { File } from "./file";

export enum ForumOrderBy {
  RECENT = "recent",
  POPULAR = "popular",
}

export class ForumSearchParams {
  constructor(
    public searchQuery: string,
    public startDate: Date | null,
    public endDate: Date | null,
    public tags: string[],
    public orderBy: ForumOrderBy
  ) {}
}

export class ForumQuestion {
  constructor(
    public id: number,
    public creatorId: number,
    public createdAt: Date,
    public answerCount: number,
    public information: ForumQuestionInformation,
    public acceptedAnswerId: number | null
  ) {}
}

export class ForumQuestionInformation {
  constructor(
    public title: string,
    public content: string,
    public tags: string[],
    public file: File | null
  ) {}
}

export class ForumAnswer {
  constructor(
    public id: number,
    public questionId: number,
    public parentId: number | null,
    public creatorId: number,
    public createdAt: Date,
    public answerCount: number,
    public upVotes: number,
    public downVotes: number,
    public vote: 0 | 1 | -1,
    public information: ForumAnswerInformation
  ) {}
}

export class ForumAnswerInformation {
  constructor(public content: string, public file: File | null) {}
}
