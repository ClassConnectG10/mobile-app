export class File {
  constructor(
    public name: string,
    public type: string,
    public localUri?: string,
    public firebaseUrl?: string
  ) {}
}
