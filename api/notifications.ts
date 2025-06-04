import { createRequest } from "./common";

export const createUserNotificationsRequest = (userId: number) => {
  return createRequest({
    uri: `users/${userId}/notifications`,
  });
};

export const createDeleteNotificationRequest = (
  userId: number,
  notificationId: number
) => {
  return createRequest({
    uri: `users/${userId}/notifications/${notificationId}`,
  });
};

export const createMarkAllNotificationsAsReadRequest = (userId: number) => {
  return createRequest({
    uri: `users/${userId}/notifications/read-all`,
  });
};
