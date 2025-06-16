import { NotificationEvent } from "./notification";
import { File } from "@/types/file";

export class User {
  constructor(
    public id: number,
    public userInformation: UserInformation,
    public isBlocked: boolean = false,
    public userPreferences?: UserPreferences
  ) {}
}

export class UserInformation {
  constructor(
    public firstName: string,
    public lastName: string,
    public email: string,
    public profilePicture?: File,
    public country?: string
  ) {}
}

export class NotificationEventPreferences {
  constructor(
    public event: NotificationEvent,
    public mail: boolean,
    public push: boolean
  ) {}
}

export class UserPreferences {
  constructor(
    public notification_events_configuration: NotificationEventPreferences[]
  ) {}
}
