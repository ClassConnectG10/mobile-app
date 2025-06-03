// Categorías y metadatos para notificaciones

import { NotificationEvent } from "./notification";

export class User {
  constructor(public id: number, public userInformation: UserInformation) {}
}

export class UserInformation {
  constructor(
    public firstName: string,
    public lastName: string,
    public email: string,
    public country?: string,
  ) {}
}

export class NotificationEventPreferences {
  constructor(public mail: boolean, public push: boolean) {}
}

// TODO: rellenar esto cuando fetcheemos el usuario
export class UserPreferences {
  constructor(
    public notification_events_configuration: Record<
      NotificationEvent,
      NotificationEventPreferences
    >,
  ) {}
}
