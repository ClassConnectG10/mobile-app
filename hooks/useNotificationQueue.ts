import { useState, useCallback, useRef } from "react";
import { Notification } from "@/types/notification";

interface QueuedNotification {
  id: string;
  notification: Notification;
  isVisible: boolean;
}

export const useNotificationQueue = () => {
  const [queue, setQueue] = useState<QueuedNotification[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addNotification = useCallback((notification: Notification) => {
    const queuedNotification: QueuedNotification = {
      id: notification.id,
      notification,
      isVisible: false,
    };

    setQueue((prevQueue) => {
      const newQueue = [...prevQueue, queuedNotification];

      // If this is the first notification, show it immediately
      if (newQueue.length === 1) {
        return [{ ...queuedNotification, isVisible: true }];
      }

      return newQueue;
    });
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setQueue((prevQueue) => {
      const filteredQueue = prevQueue.filter(
        (item) => item.id !== notificationId
      );

      // If there are more notifications in the queue, show the next one
      if (filteredQueue.length > 0 && !filteredQueue[0].isVisible) {
        return [
          { ...filteredQueue[0], isVisible: true },
          ...filteredQueue.slice(1),
        ];
      }

      return filteredQueue;
    });
  }, []);

  const dismissCurrentNotification = useCallback(() => {
    setQueue((prevQueue) => {
      if (prevQueue.length === 0) return prevQueue;

      const [current, ...rest] = prevQueue;

      // If there are more notifications, show the next one
      if (rest.length > 0) {
        return [{ ...rest[0], isVisible: true }, ...rest.slice(1)];
      }

      return [];
    });
  }, []);

  const currentNotification =
    queue.find((item) => item.isVisible)?.notification || null;

  return {
    currentNotification,
    queueLength: queue.length,
    addNotification,
    removeNotification,
    dismissCurrentNotification,
  };
};
