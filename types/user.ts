export class User {
  constructor(public id: number, public userInformation: UserInformation) {}
}

export class UserInformation {
  constructor(
    public firstName: string,
    public lastName: string,
    public email: string,
    public country: string
  ) {}
}
