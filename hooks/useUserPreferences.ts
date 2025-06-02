import { useState } from "react";
import { UserPreferences } from "@/types/user";

export interface UserPreferencesHook {
  userPreferences: UserPreferences;
  setUserPreferences: (preferences: UserPreferences) => void;
  setMailNotifications: (enabled: boolean) => void;
  setPushNotifications: (enabled: boolean) => void;
  setEventNotification: (event: string, enabled: boolean) => void;
}

export function useUserPreferences(): UserPreferencesHook {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  const setUserPreferences = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
  };

  const setMailNotifications = (enabled: boolean) => {
    setPreferences((prev) => {
      return { ...prev, mail_notifications: enabled };
    });
  };

  const setPushNotifications = (enabled: boolean) => {
    setPreferences((prev) => {
      return { ...prev, push_notifications: enabled };
    });
  };

  const setEventNotification = (event: string, enabled: boolean) => {
    setPreferences((prev) => {
      return {
        ...prev,
        notification_events_configuration: {
          ...prev.notification_events_configuration,
          [event]: enabled,
        },
      };
    });
  };

  return {
    userPreferences: preferences,
    setUserPreferences,
    setMailNotifications,
    setPushNotifications,
    setEventNotification,
  };
}
