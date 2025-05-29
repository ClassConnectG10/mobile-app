export class AssistantLog {
  constructor(
    public logId: number,
    public userId: number,
    public timestamp: Date,
    public log: string,
  ) {}
}
