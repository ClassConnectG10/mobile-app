import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Appbar, Text, useTheme } from "react-native-paper";
import { View, SectionList, StyleSheet } from "react-native";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useUserContext } from "@/utils/storage/userContext";
import { NotificationEventPreference } from "@/components/forms/NotificationEventPreference";
import {
  notificationEventMeta,
  NotificationConfig,
  NotificationEventMeta,
  notificationAudienceBiMap,
  notificationEventBiMap,
  notificationEventIconBiMap,
} from "@/types/notification";
import { updatePreferences } from "@/services/userManagement";

export default function NotificationsPreferencesPage() {
  const router = useRouter();
  const theme = useTheme();

  const userContextHook = useUserContext();
  const userContext = userContextHook.user;
  const userPreferencesContext = userContext.userPreferences;

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  const configurableEvents = notificationEventMeta.filter(
    (meta) => meta.configurable !== NotificationConfig.NO_CONFIGURABLE,
  ).map((meta) => (meta.event));

  const userPreferencesHook = useUserPreferences();
  const userPreferences = userPreferencesHook.userPreferences;

  const fetchPreferences = async () => {
    if (!userContext) return;
    setIsLoading(true);

    try {
      userPreferencesHook.setUserPreferences(userPreferencesContext);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPreferences();
    }, [userContext])
  );

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updatePreferences(userContext.id, userPreferencesHook.userPreferences);
      userContextHook.setUser({
        ...userContext,
        userPreferences: userPreferencesHook.userPreferences,
      });
      setIsEditing(false);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    userPreferencesHook.setUserPreferences(userPreferencesContext);
    setIsEditing(false);
  };

  const sections: { title: string; data: NotificationEventMeta[] }[] =
    notificationAudienceBiMap.values().map(({ front: audienceLabel, back: audienceKey }) => ({
      title: audienceLabel,
      data: notificationEventMeta.filter((meta) => meta.audience === audienceKey),
    })).filter((section) => section.data.length > 0);

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction
            onPress={isEditing ? handleCancelEdit : () => router.back()}
          />
          <Appbar.Content title="Preferencias" />
          <Appbar.Action
            icon={isEditing ? "check" : "pencil"}
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
          />
        </Appbar.Header>

        {isLoading || !userPreferences ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
            }}
          >
            <ActivityIndicator
              animating={true}
              size="large"
              color={theme.colors.primary}
            />
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <NotificationEventPreference
              icon={"bell"}
              label={"Todos los eventos"}
              valueMail={userPreferences.notification_events_configuration
                .filter((config) => configurableEvents.includes(config.event))
                .every((config) => config.mail)}
              valuePush={userPreferences.notification_events_configuration
                .filter((config) => configurableEvents.includes(config.event))
                .every((config) => config.push)}
              onValueMailChange={(value) =>
                userPreferencesHook.setAllMailEventNotifications(
                  configurableEvents,
                  value,
                )
              }
              onValuePushChange={(value) =>
                userPreferencesHook.setAllPushEventNotifications(
                  configurableEvents,
                  value,
                )
              }
              disabled={!isEditing}
              someMail={userPreferences.notification_events_configuration
                .filter((config) => configurableEvents.includes(config.event))
                .some((config) => config.mail)}
              somePush={userPreferences.notification_events_configuration
                .filter((config) => configurableEvents.includes(config.event))
                .some((config) => config.push)}
            />

            <SectionList
              sections={sections}
              keyExtractor={(item) => item.event}
              renderSectionHeader={({ section: { title } }) => (
                <Text style={styles.sectionHeader}>
                  {title}
                </Text>
              )}
              renderItem={({ item }) => (
                <NotificationEventPreference
                  icon={
                    notificationEventIconBiMap.getFrontValue(item.event) ??
                    "bell"
                  }
                  label={
                    notificationEventBiMap.getFrontValue(item.event) ??
                    item.event
                  }
                  valueMail={
                    userPreferences.notification_events_configuration.find(
                      (config) => config.event === item.event,
                    )?.mail ?? false
                  }
                  valuePush={
                    userPreferences.notification_events_configuration.find(
                      (config) => config.event === item.event,
                    )?.push ?? false
                  }
                  onValueMailChange={(value) =>
                    userPreferencesHook.setMailEventNotification(
                      item.event,
                      value,
                    )
                  }
                  onValuePushChange={(value) =>
                    userPreferencesHook.setPushEventNotification(
                      item.event,
                      value,
                    )
                  }
                  disabled={!isEditing}
                  alwaysDisabled={
                    item.configurable === NotificationConfig.NO_CONFIGURABLE
                  }
                />
              )}
              contentContainerStyle={styles.sectionListContainer}
              style={{ flex: 1 }}
            />
          </View>
        )}
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    gap: 8,
    flex: 1,
  },
  sectionHeader: {
    fontWeight: "bold",
    marginTop: 12,
    fontSize: 18,
  },
  sectionListContainer: {
    gap: 8,
  },
});
