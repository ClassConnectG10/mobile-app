import { File } from "./file";
import { Link } from "./link";

export enum AttachmentType {
  FILE = "FILE",
  LINK = "LINK",
}

export class Resource {
  constructor(
    public resourceId: number,
    public ResourceDetails: ResourceDetails,
  ) {}
}

export class ResourceDetails {
  constructor(
    public title: string,
    public moduleId: number,
    public description: string,
    public resourceFiles: File[],
    public resourceLinks: Link[],
  ) {}
}

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
