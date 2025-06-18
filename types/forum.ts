import { File } from "./file";

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
    public information: ForumAnswerInformation,
  ) {}
}

export class ForumAnswerInformation {
  constructor(public content: string, public file: File | null) {}
}
