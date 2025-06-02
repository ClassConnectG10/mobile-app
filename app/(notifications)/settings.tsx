import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Appbar, Text, useTheme } from "react-native-paper";
import { View, SectionList, StyleSheet, ScrollView } from "react-native";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { UserPreferences } from "@/types/user";
import { getUserPreferences } from "@/services/userManagement";
import { useUserContext } from "@/utils/storage/userContext";
import { ToggleableBooleanInput } from "@/components/forms/ToggleableBooleanInput";
import {
  notificationEventMeta,
  NotificationConfig,
  NotificationEventMeta,
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
      setUserPreferencesContext(userPreferencesContext);
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
          <View style={styles.centeredContainer}>
            <ActivityIndicator
              animating={true}
              size="large"
              color={theme.colors.primary}
            />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <Text style={styles.sectionHeader}>MEDIOS HABILITADOS</Text>
            <ToggleableBooleanInput
              icon="email"
              label="Notificaciones por correo"
              value={userPreferences.mail_notifications}
              onValueChange={userPreferencesHook.setMailNotifications}
              disabled={!isEditing}
              alwaysDisabled={false}
            />

            <ToggleableBooleanInput
              icon="cellphone"
              label="Notificaciones push"
              value={userPreferences.push_notifications}
              onValueChange={userPreferencesHook.setPushNotifications}
              disabled={!isEditing}
              alwaysDisabled={false}
            />

            <SectionList
              sections={sections}
              keyExtractor={(item) => item.event}
              scrollEnabled={false}
              renderSectionHeader={({ section: { title } }) => (
                <Text style={styles.sectionHeader}>{title}</Text>
              )}
              renderItem={({ item }) => (
                <ToggleableBooleanInput
                  icon={item.icon}
                  label={item.displayName}
                  value={
                    userPreferences.notification_events_configuration[
                      item.event
                    ]
                  }
                  onValueChange={(value) =>
                    userPreferencesHook.setEventNotification(item.event, value)
                  }
                  disabled={!isEditing}
                  alwaysDisabled={
                    item.configurable === NotificationConfig.NO_CONFIGURABLE
                  }
                />
              )}
              contentContainerStyle={styles.sectionListContainer}
            />
          </ScrollView>
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
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    padding: 16,
    gap: 8,
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
