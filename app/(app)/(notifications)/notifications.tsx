import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Appbar, useTheme, Text } from "react-native-paper";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { FlatList, View } from "react-native";
import { Notification } from "@/types/notification";
import NotificationCard from "@/components/cards/NotificationCard";
import { getUserNotifications } from "@/services/notifications";
import { useUserContext } from "@/utils/storage/userContext";

export default function NotificationsPage() {
  const router = useRouter();
  const theme = useTheme();
  const userContext = useUserContext();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notifications, setNotifications] = useState<Notification[] | null>(
    null
  );

  const fetchNotifications = async () => {
    if (!userContext.user) return;

    setIsLoading(true);
    try {
      const userNotifications = await getUserNotifications(userContext.user.id);
      setNotifications(userNotifications);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    try {
      // Aquí podrías navegar a una pantalla específica según el tipo de notificación
      // Por ejemplo:
      // if (notification.event === NotificationEvent.ACTIVITY_PUBLISHED) {
      //   router.push('/activities');
      // }
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [userContext.user?.id])
  );

  const renderEmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 50,
      }}
    >
      <Text variant="titleMedium" style={{ color: theme.colors.outline }}>
        No tienes notificaciones
      </Text>
      <Text
        variant="bodyMedium"
        style={{ color: theme.colors.outline, marginTop: 8 }}
      >
        Las nuevas notificaciones aparecerán aquí
      </Text>
    </View>
  );

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/home");
              }
            }}
          />
          <Appbar.Content title="Notificaciones" />
          <Appbar.Action icon="cog" onPress={() => router.push("/settings")} />
        </Appbar.Header>

        {isLoading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator
              animating={true}
              size="large"
              color={theme.colors.primary}
            />
          </View>
        ) : (
          <View
            style={{
              padding: 16,
              flex: 1,
            }}
          >
            <FlatList
              data={notifications}
              contentContainerStyle={{
                gap: 8,
                paddingBottom: 100,
              }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <NotificationCard
                  notification={item}
                  onPress={() => handleNotificationPress(item)}
                />
              )}
              ListEmptyComponent={renderEmptyState}
              showsVerticalScrollIndicator={false}
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
