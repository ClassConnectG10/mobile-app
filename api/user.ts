import { createRequest } from "./common";

export const createRegisterUserRequest = () => {
  return createRequest({ uri: "users" });
};

export const createLoginUserRequest = (
  uid: string,
  notification_token: string
) => {
  return createRequest({
    uri: `users/login/${uid}`,
    headers: {
      r_token: notification_token,
    },
    params: {
      platform: "app",
    },
  });
};

export const createLogoutUserRequest = () => {
  return createRequest({
    uri: `users/logout`,
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

export const createProfilePictureRequest = (userId: number) => {
  return createRequest({
    uri: `users/${userId}/profile-picture`,
    headers: {
      "X-Caller-Id": `${userId}`,
    },
  });
};
