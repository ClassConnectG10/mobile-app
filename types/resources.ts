export enum ResourceType {
  DOCUMENT = "DOCUMENT",
  VIDEO = "VIDEO",
  IMAGES = "IMAGES",
  LINK = "LINK",
  TEXT = "TEXT",
}

export enum FileType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
  TEXT = "TEXT",
}

export class File {
  constructor(public fileId?: number, public fileDetails?: FileDetails) {}
}

export class FileDetails {
  constructor(
    public fileName: string,
    public fileType: FileType,
    public fileContent: string
  ) {}
}

export class Resource {
  constructor(
    public resourceId: number,
    public ResourceDetails: ResourceDetails
  ) {}
}

export class ResourceDetails {
  constructor(
    public type: ResourceType,
    public title: string,
    public moduleId: number,
    public description: string,
    public resourceDetails:
      | DocuemntDetails
      | VideoDetails
      | ImagesDetails
      | LinkDetails
      | TextDetails
  ) {}
}

export class DocuemntDetails {
  constructor(public files: File[]) {}
}

export class VideoDetails {
  constructor(public video: File) {}
}

export class ImagesDetails {
  constructor(public images: File[]) {}
}

export class LinkDetails {
  constructor(public link: string) {}
}

export class TextDetails {
  constructor(public text: string) {}
}

export class Module {
  constructor(
    public moduleId: number,
    public courseId: string,
    public courseModuleDetails: ModuleDetails
  ) {}
}

export class ModuleDetails {
  constructor(public title: string, public description: string) {}
}
