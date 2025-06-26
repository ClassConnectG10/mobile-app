import { useNotification } from "@/services/notificationManagment";
import { useUserContext } from "@/utils/storage/userContext";
import { getMessaging } from "@react-native-firebase/messaging";
import axios from "axios";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Notification } from "@/types/notification";
import NotificationBanner from "@/components/banners/NotificationBanner";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CoursesLayout() {
  const router = useRouter();
  const userContextHook = useUserContext();
  const userContextId = userContextHook.user.id;

  // Simple notification state management
  const [currentNotification, setCurrentNotification] =
    useState<Notification | null>(null);

  useEffect(() => {
    const messaging = getMessaging();

    const unsubscribe = messaging.onMessage(async (remoteMessage) => {
      const receivedNotification = new Notification(
        remoteMessage.messageId || Math.random().toString(),
        remoteMessage.notification?.title || "New Notification",
        remoteMessage.notification?.body || "You have a new notification",
        new Date(remoteMessage.sentTime || Date.now()),
      );
      setCurrentNotification(receivedNotification);
    });

    return unsubscribe;
  }, []);

  useNotification();

  useEffect(() => {
    axios.defaults.headers.common["X-Caller-Id"] = userContextId.toString();
  }, [userContextId]);

  const handleNavigateToNotifications = () => {
    router.push("/notifications");
    setCurrentNotification(null);
  };

  const handleDismissNotification = () => {
    setCurrentNotification(null);
  };

  return (
    <>
      {currentNotification && (
        <SafeAreaView
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: 16,
            zIndex: 1000,
          }}
        >
          <NotificationBanner
            notification={currentNotification}
            onPress={handleNavigateToNotifications}
            onDismiss={handleDismissNotification}
          />
        </SafeAreaView>
      )}
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
