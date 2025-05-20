export class File {
  constructor(
    public name: string,
    public fileType: string,
    public localUri?: string,
    public firebaseUrl?: string
  ) {}
}
