import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Appbar, useTheme } from "react-native-paper";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { FlatList, View } from "react-native";
import { Notification } from "@/types/notification";
import NotificationCard from "@/components/cards/NotificationCard";

export default function NotificationsPage() {
  const router = useRouter();
  const theme = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [notifications, setNotifications] = useState<Notification[] | null>([
    {
      id: 1,
      title: "Nueva actualización disponible",
      body: "Se ha lanzado una nueva versión de la aplicación. Por favor, actualiza para disfrutar de las últimas características.",
      date: new Date(),
      read: true,
    },
    {
      id: 2,
      title: "Mantenimiento programado",
      body: "El servicio estará inactivo el próximo sábado de 2 a 4 AM para mantenimiento.",
      date: new Date(),
      read: false,
    },
    {
      id: 3,
      title: "Nueva actualización disponible",
      body: "Se ha lanzado una nueva versión de la aplicación. Por favor, actualiza para disfrutar de las últimas características.",
      date: new Date(),
      read: true,
    },
    {
      id: 4,
      title: "Mantenimiento programado",
      body: "El servicio estará inactivo el próximo sábado de 2 a 4 AM para mantenimiento.",
      date: new Date(),
      read: false,
    },
    {
      id: 5,
      title: "Nueva actualización disponible",
      body: "Se ha lanzado una nueva versión de la aplicación. Por favor, actualiza para disfrutar de las últimas características.",
      date: new Date(),
      read: true,
    },
    {
      id: 6,
      title: "Mantenimiento programado",
      body: "El servicio estará inactivo el próximo sábado de 2 a 4 AM para mantenimiento.",
      date: new Date(),
      read: false,
    },
    {
      id: 7,
      title: "Nueva actualización disponible",
      body: "Se ha lanzado una nueva versión de la aplicación. Por favor, actualiza para disfrutar de las últimas características.",
      date: new Date(),
      read: true,
    },
    {
      id: 8,
      title: "Mantenimiento programado",
      body: "El servicio estará inactivo el próximo sábado de 2 a 4 AM para mantenimiento.",
      date: new Date(),
      read: false,
    },
  ]);

  useFocusEffect(
    useCallback(() => {
      // TODO
    }, []),
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
              gap: 16,
            }}
          >
            <FlatList
              data={notifications}
              contentContainerStyle={{
                gap: 8,
                paddingBottom: 100,
              }}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <NotificationCard notification={item} />
              )}
              ListEmptyComponent={
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
              }
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
