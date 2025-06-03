import { useState } from "react";
import { UserPreferences } from "@/types/user";

export interface UserPreferencesHook {
  userPreferences: UserPreferences;
  setUserPreferences: (preferences: UserPreferences) => void;
  setAllMailEventNotifications: (events: string[], enabled: boolean) => void;
  setAllPushEventNotifications: (events: string[], enabled: boolean) => void;
  setMailEventNotification: (event: string, enabled: boolean) => void;
  setPushEventNotification: (event: string, enabled: boolean) => void;
}

export function useUserPreferences(): UserPreferencesHook {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  const setUserPreferences = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
  };

  const setAllMailEventNotifications = (events: string[], enabled: boolean) => {
    setPreferences((prev) => {
      if (!prev) return prev;
      const updatedEvents = Object.keys(
        prev.notification_events_configuration,
      ).reduce((acc, event) => {
        if (events.includes(event)) {
          acc[event] = {
            ...prev.notification_events_configuration[event],
            mail: enabled,
          };
        } else {
          acc[event] = prev.notification_events_configuration[event];
        }
        return acc;
      }, {} as Record<string, { mail: boolean; push: boolean }>);
      return {
        ...prev,
        notification_events_configuration: updatedEvents,
      };
    });
  };

  const setAllPushEventNotifications = (events: string[], enabled: boolean) => {
    setPreferences((prev) => {
      if (!prev) return prev;
      const updatedEvents = Object.keys(
        prev.notification_events_configuration,
      ).reduce((acc, event) => {
        if (events.includes(event)) {
          acc[event] = {
            ...prev.notification_events_configuration[event],
            push: enabled,
          };
        } else {
          acc[event] = prev.notification_events_configuration[event];
        }
        return acc;
      }, {} as Record<string, { mail: boolean; push: boolean }>);
      return {
        ...prev,
        notification_events_configuration: updatedEvents,
      };
    });
  };

  // const setMailNotifications = (enabled: boolean) => {
  //   setPreferences((prev) => {
  //     return { ...prev, mail_notifications: enabled };
  //   });
  // };

  // const setPushNotifications = (enabled: boolean) => {
  //   setPreferences((prev) => {
  //     return { ...prev, push_notifications: enabled };
  //   });
  // };

  const setMailEventNotification = (event: string, enabled: boolean) => {
    setPreferences((prev) => {
      return {
        ...prev,
        notification_events_configuration: {
          ...prev.notification_events_configuration,
          [event]: {
            ...prev.notification_events_configuration[event],
            mail: enabled,
          },
        },
      };
    });
  };

  const setPushEventNotification = (event: string, enabled: boolean) => {
    setPreferences((prev) => {
      return {
        ...prev,
        notification_events_configuration: {
          ...prev.notification_events_configuration,
          [event]: {
            ...prev.notification_events_configuration[event],
            push: enabled,
          },
        },
      };
    });
  };

  return {
    userPreferences: preferences,
    setUserPreferences,
    setAllMailEventNotifications,
    setAllPushEventNotifications,
    setMailEventNotification,
    setPushEventNotification,
  };
}
