import { File } from "./file";

export enum ResourceType {
  DOCUMENT = "DOCUMENT",
  VIDEO = "VIDEO",
  IMAGES = "IMAGES",
  LINK = "LINK",
  TEXT = "TEXT",
}

export class Resource {
  constructor(
    public resourceId: number,
    public ResourceDetails: ResourceDetails,
  ) {}
}

export class ResourceDetails {
  constructor(
    public type: ResourceType,
    public title: string,
    public moduleId: number,
    public description: string,
    public resourceFile: File, // | DocuemntData // | VideoData // | ImagesData // | LinkData
  ) // | TextData,
  {}
}

// export class DocuemntData {
//   constructor(public files: File) {}
// }

// export class VideoData {
//   constructor(public video: File) {}
// }

// export class ImagesData {
//   constructor(public images: File[]) {}
// }

// export class LinkData {
//   constructor(public link: string) {}
// }

// export class TextData {
//   constructor(public text: string) {}
// }

export class Module {
  constructor(
    public moduleId: number,
    public courseId: string,
    public courseModuleDetails: ModuleDetails,
  ) {}
}

export class ModuleDetails {
  constructor(public title: string, public description: string) {}
}
