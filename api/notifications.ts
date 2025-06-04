import { createRequest } from "./common";

export const createUserNotificationsRequest = () => {
  return createRequest({
    uri: `notifications`,
  });
};

export const createDeleteNotificationRequest = (
  notificationId: string
) => {
  return createRequest({
    uri: `notifications/${notificationId}`,
  });
};