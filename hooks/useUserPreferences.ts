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
      const updatedEvents = prev.notification_events_configuration.map(eventConfig => {
        if (events.includes(eventConfig.event)) {
          return {
            ...eventConfig,
            mail: enabled,
          };
        }
        return eventConfig;
      });
      return {
        ...prev,
        notification_events_configuration: updatedEvents,
      };
    });
  };

  const setAllPushEventNotifications = (events: string[], enabled: boolean) => {
    setPreferences((prev) => {
      if (!prev) return prev;
      const updatedEvents = prev.notification_events_configuration.map(eventConfig => {
        if (events.includes(eventConfig.event)) {
          return {
            ...eventConfig,
            push: enabled,
          };
        }
        return eventConfig;
      });
      return {
        ...prev,
        notification_events_configuration: updatedEvents,
      };
    });
  };

  const setMailEventNotification = (event: string, enabled: boolean) => {
    setPreferences((prev) => {
      if (!prev) return prev;
      const updatedEvents = prev.notification_events_configuration.map(eventConfig => {
        if (eventConfig.event === event) {
          return {
            ...eventConfig,
            mail: enabled,
          };
        }
        return eventConfig;
      });
      return {
        ...prev,
        notification_events_configuration: updatedEvents,
      };
    });
  };

  const setPushEventNotification = (event: string, enabled: boolean) => {
    setPreferences((prev) => {
      if (!prev) return prev;
      const updatedEvents = prev.notification_events_configuration.map(eventConfig => {
        if (eventConfig.event === event) {
          return {
            ...eventConfig,
            push: enabled,
          };
        }
        return eventConfig;
      });
      return {
        ...prev,
        notification_events_configuration: updatedEvents,
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
