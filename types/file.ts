export class File {
  constructor(
    public fileName: string,
    public fileType: string,
    public localUrl?: string,
    public firebaseUrl?: string,
  ) {}
}
