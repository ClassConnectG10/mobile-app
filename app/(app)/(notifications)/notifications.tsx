import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Appbar, useTheme, Text } from "react-native-paper";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { FlatList, View, StyleSheet } from "react-native";
import { Notification } from "@/types/notification";
import NotificationCard from "@/components/cards/NotificationCard";
import { deleteAllNotifications, deleteNotification, getUserNotifications } from "@/services/notifications";
import { AlertDialog } from "@/components/AlertDialog";

export default function NotificationsPage() {
  const router = useRouter();
  const theme = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notifications, setNotifications] = useState<Notification[] | null>(
    null
  );
  const [deleteAllNotificationsDialogVisible, setDeleteAllNotificationsDialogVisible] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // const userNotifications = await getUserMockNotifications();
      const userNotifications = await getUserNotifications();
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

  const handleDeleteNotification = async (notification: Notification) => {
    try {
      await deleteNotification(notification.id);
      setNotifications((prev) =>
        prev ? prev.filter((n) => n.id !== notification.id) : null
      );
    }
    catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (!notifications || notifications.length === 0) return;

    try {
      await deleteAllNotifications(notifications.map(n => n.id));
      setNotifications([]);
      setDeleteAllNotificationsDialogVisible(false);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
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
          {notifications && notifications.length > 0 && (
            <Appbar.Action
              icon="delete-sweep"
              onPress={() => setDeleteAllNotificationsDialogVisible(true)}
            />
          )}
          <Appbar.Action icon="cog" onPress={() => router.push("/preferences")} />
        </Appbar.Header>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              animating={true}
              size="large"
              color={theme.colors.primary}
            />
          </View>
        ) : (
          <View style={styles.container}>

            <FlatList
              data={notifications}
              contentContainerStyle={styles.listContainer}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <NotificationCard
                  notification={item}
                  onPress={() => handleNotificationPress(item)}
                  onDelete={() => handleDeleteNotification(item)}
                />
              )}
              ListHeaderComponent={
                <>
                  {notifications && notifications.length > 0 && (
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {notifications.length === 1 ?
                        `${notifications.length} notificación` :
                        `${notifications.length} notificaciones`}
                    </Text>
                  )}
                </>
              }
              ListEmptyComponent={
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text variant="titleMedium">No tienes notificaciones</Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
      <AlertDialog
        title="Eliminar notificaciones"
        content="¿Estás seguro de que deseas eliminar todas las notificaciones?"
        visible={deleteAllNotificationsDialogVisible}
        onConfirm={handleDeleteAllNotifications}
        onDismiss={() => setDeleteAllNotificationsDialogVisible(false)}
        dismissText="Cancelar"
        confirmText="Eliminar"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    textAlign: 'center',
  },
  listContainer: {
    gap: 12,
  },

});
