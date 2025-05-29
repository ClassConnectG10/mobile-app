import { File } from "./file";
import { Link } from "./link";

export enum AttachmentType {
  FILE = "FILE",
  LINK = "LINK",
}

export class Resource {
  constructor(
    public resourceId: number,
    public resourceDetails: ResourceDetails
  ) {}
}

export class ResourceDetails {
  constructor(
    public title: string,
    public moduleId: number,
    public description: string,
    public attachments: Attachment[]
  ) {}
}

export abstract class Attachment {
  constructor(
    public attachmentType: AttachmentType,
    public attachmentId?: number
  ) {}
}

export class FileAttachment extends Attachment {
  constructor(public file: File, attachmentId?: number) {
    super(AttachmentType.FILE, attachmentId);
  }
}

export class LinkAttachment extends Attachment {
  constructor(public link: Link, attachmentId?: number) {
    super(AttachmentType.LINK, attachmentId);
  }
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
