import { useEffect } from "react";
import { PermissionsAndroid } from "react-native";
import { getMessaging } from "@react-native-firebase/messaging";
import {
  Notification,
  NotificationEvent,
  notificationEventBiMap,
} from "@/types/notification";

const requestUserPermission = async () => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  );
  if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    console.log("You can use the notifications");
  } else {
    console.error("Notification permission denied");
  }
};

export const getToken = async () => {
  try {
    const messaging = getMessaging();
    const token = await messaging.getToken();
    console.log("FCM Token:", token);
    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

// Función para obtener notificaciones del usuario
export const getUserNotifications = async (
  userId: number
): Promise<Notification[]> => {
  // TODO: Implementar llamada real a la API
  // Por ahora retornamos notificaciones de ejemplo basadas en los tipos definidos
  const mockNotifications: Notification[] = [
    new Notification(
      "1",
      notificationEventBiMap.getFrontValue(NotificationEvent.WELCOME) ||
        "Bienvenida",
      "¡Bienvenido a Class Connect! Estamos emocionados de tenerte en nuestra plataforma educativa.",
      new Date(Date.now() - 1000 * 60 * 30) // 30 minutos atrás
    ),
    new Notification(
      "2",
      notificationEventBiMap.getFrontValue(
        NotificationEvent.ACTIVITY_PUBLISHED
      ),
      "Se ha publicado una nueva actividad en el curso 'Matemáticas Avanzadas'. Revisa los detalles y la fecha de entrega.",
      new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 horas atrás
    ),
    new Notification(
      "3",
      notificationEventBiMap.getFrontValue(NotificationEvent.ACTIVITY_GRADED),
      "Tu tarea 'Ejercicios de Álgebra' ha sido calificada. Puedes ver tus resultados en la sección de actividades.",
      new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 horas atrás
    ),
    new Notification(
      "4",
      notificationEventBiMap.getFrontValue(
        NotificationEvent.RESOURCE_PUBLISHED
      ),
      "Se ha añadido un nuevo recurso de estudio en el curso 'Física Cuántica'. Material complementario disponible.",
      new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 día atrás
    ),
    new Notification(
      "5",
      notificationEventBiMap.getFrontValue(NotificationEvent.COURSE_GRADE),
      "Ya están disponibles las calificaciones finales del curso 'Programación Web'. Revisa tu desempeño general.",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 días atrás
    ),
    new Notification(
      "6",
      notificationEventBiMap.getFrontValue(NotificationEvent.STUDENT_ENROLLED),
      "Un nuevo estudiante se ha inscrito en tu curso 'Introducción a React Native'.",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 días atrás
    ),
  ];

  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 500));

  return mockNotifications;
};

// Función para eliminar notificación
export const deleteNotification = async (
  notificationId: number
): Promise<void> => {
  // TODO: Implementar llamada real a la API
  console.log(`Notification ${notificationId} deleted`);
};

export const useNotification = () => {
  useEffect(() => {
    requestUserPermission();
  }, []);
};
