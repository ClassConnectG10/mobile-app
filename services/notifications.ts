import { useEffect } from "react";
import { PermissionsAndroid } from "react-native";
import { getMessaging } from "@react-native-firebase/messaging";

const requestUserPermission = async () => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  );
  if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    console.log("You can use the notifications");
  } else {
    console.error("Notification permission denied");
  }
};

const getToken = async () => {
  try {
    const messaging = getMessaging();
    const token = await messaging.getToken();
    console.log("Notification token:", token);

    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

export const useNotification = () => {
  useEffect(() => {
    requestUserPermission();
    getToken();
  }, []);
};
