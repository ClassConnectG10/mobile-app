import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Appbar, Text, useTheme } from "react-native-paper";
import { View, SectionList, StyleSheet } from "react-native";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { UserPreferences } from "@/types/user";
import { getUserPreferences } from "@/services/userManagement";
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

export default function NotificationsPage() {
  const router = useRouter();
  const theme = useTheme();

  const userContextHook = useUserContext();
  const userContext = userContextHook.user;

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userPreferencesContext, setUserPreferencesContext] =
    useState<UserPreferences | null>(null);

  const configurableEventsMeta = Object.entries(notificationEventMeta)
    .filter(
      ([, meta]) => meta.configurable !== NotificationConfig.NO_CONFIGURABLE,
    )
    .map(([, meta]) => meta);

  const userPreferencesHook = useUserPreferences();
  const userPreferences = userPreferencesHook.userPreferences;

  const fetchPreferences = async () => {
    if (!userContext) return;
    setIsLoading(true);

    try {
      const fetchedPreferences = await getUserPreferences(userContext?.id);
      setUserPreferencesContext(fetchedPreferences);
      userPreferencesHook.setUserPreferences(fetchedPreferences);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [userContext]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // await savePreferences();
      setUserPreferencesContext(userPreferences);
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

  const groupedEvents = Object.values(notificationEventMeta).reduce(
    (acc, meta) => {
      const category = meta.audience;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(meta);
      return acc;
    },
    {} as Record<string, NotificationEventMeta[]>,
  );

  const sections = Object.entries(groupedEvents).map(([category, events]) => ({
    title: category,
    data: events,
  }));

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
              valueMail={Object.entries(
                userPreferences.notification_events_configuration,
              )
                .filter(([event]) =>
                  configurableEventsMeta.some((item) => item.event === event),
                )
                .every(([, config]) => config.mail)}
              valuePush={Object.entries(
                userPreferences.notification_events_configuration,
              )
                .filter(([event]) =>
                  configurableEventsMeta.some((item) => item.event === event),
                )
                .every(([, config]) => config.push)}
              onValueMailChange={(value) =>
                userPreferencesHook.setAllMailEventNotifications(
                  configurableEventsMeta.map((item) => item.event),
                  value,
                )
              }
              onValuePushChange={(value) =>
                userPreferencesHook.setAllPushEventNotifications(
                  configurableEventsMeta.map((item) => item.event),
                  value,
                )
              }
              disabled={!isEditing}
              someMail={Object.entries(
                userPreferences.notification_events_configuration,
              )
                .filter(([event]) =>
                  configurableEventsMeta.some((item) => item.event === event),
                )
                .some(([, config]) => config.mail)}
              somePush={Object.entries(
                userPreferences.notification_events_configuration,
              )
                .filter(([event]) =>
                  configurableEventsMeta.some((item) => item.event === event),
                )
                .some(([, config]) => config.push)}
            />

            <SectionList
              sections={sections}
              keyExtractor={(item) => item.event}
              renderSectionHeader={({ section: { title } }) => (
                <Text style={styles.sectionHeader}>
                  {notificationAudienceBiMap.getFrontValue(title) ?? title}
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
                    userPreferences.notification_events_configuration[
                      item.event
                    ]?.mail ?? false
                  }
                  valuePush={
                    userPreferences.notification_events_configuration[
                      item.event
                    ]?.push ?? false
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
