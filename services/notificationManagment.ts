import { useEffect } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { getMessaging } from "@react-native-firebase/messaging";
import { Notification } from "@/types/notification";
import {
  createDeleteNotificationRequest,
  createUserNotificationsRequest,
} from "@/api/notifications";
import { handleError } from "./common";

const requestUserPermission = async () => {
  if (Platform.OS === "android") {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Notification permission denied");
    }
  }
};

export const getToken = async () => {
  try {
    const messaging = getMessaging();
    const token = await messaging.getToken();
    console.log("FCM Token:", token);
    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

// Función para obtener notificaciones del usuario
export const getUserNotifications = async (): Promise<Notification[]> => {
  try {
    const request = await createUserNotificationsRequest();
    const notifications = await request.get("");
    const notificationsData = notifications.data.data;

    return notificationsData.map(
      (notification: any) =>
        new Notification(
          notification.id,
          notification.title,
          notification.message,
          notification.date_created
        )
    );
  } catch (error) {
    handleError(error, "obtener las notificaciones del usuario");
  }
};

export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  try {
    const request = await createDeleteNotificationRequest(notificationId);
    await request.delete("");
  } catch (error) {
    handleError(error, "eliminar la notificación");
  }
};

export const deleteAllNotifications = async (): Promise<void> => {
  try {
    const request = await createUserNotificationsRequest();
    await request.delete("");
  } catch (error) {
    handleError(error, "eliminar todas las notificaciones");
  }
};

export const useNotification = () => {
  useEffect(() => {
    requestUserPermission();
  }, []);
};
