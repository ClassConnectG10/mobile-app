import { createRequest } from "./common";

export const createRegisterUserRequest = () => {
  return createRequest({ uri: "users" });
};

export const createLoginUserRequest = (uid: string) => {
  return createRequest({ uri: `users/login/${uid}` });
};

export const createEditUserProfileRequest = (userId: number) => {
  return createRequest({
    uri: `users/${userId}`,
  });
};

export const createUserRequest = (userId: number) => {
  return createRequest({
    uri: `users/${userId}`,
  });
};

export const createBulkUserRequest = () => {
  return createRequest({
    uri: `users/bulk`,
  });
};

export const createUsersRequest = () => {
  return createRequest({
    uri: `users`,
  });
};
