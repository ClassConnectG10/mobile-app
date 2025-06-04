import { Card, Text, useTheme, IconButton } from "react-native-paper";
import { View, StyleSheet, Animated } from "react-native";
import { Notification } from "@/types/notification";
import { useEffect, useRef } from "react";

const AUTO_DISMISS_TIMEOUT = 5000; // 5 seconds

interface NotificationBannerProps {
  notification: Notification;
  onPress?: () => void;
  onDismiss?: () => void;
  onAnimationComplete?: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onPress = () => { },
  onDismiss = () => { },
  onAnimationComplete = () => { },
}) => {
  const theme = useTheme();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Obtener el ícono basado en el tipo de notificación
  const getNotificationIcon = () => {
    // Por ahora usar bell por defecto, se puede mejorar cuando se agregue el campo event
    return "bell";
  };

  useEffect(() => {
    // Reset animation value when notification changes
    slideAnim.setValue(-100);

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Animación de entrada
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      // Animation completed, call callback
      onAnimationComplete();
    });

    // Auto dismiss después de 5 segundos
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, AUTO_DISMISS_TIMEOUT);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [notification.id]); // Re-run when notification ID changes

  const handleDismiss = () => {
    // Clear timer if user manually dismisses
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    Animated.timing(slideAnim, {
      toValue: -200,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderLeftColor: theme.colors.primary,
            shadowColor: theme.colors.shadow,
          },
        ]}
        elevation={5}
      >
        <View style={styles.row}>
          <IconButton
            mode="contained"
            icon={getNotificationIcon()}
            size={24}
            iconColor={theme.colors.primary}
          />

          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              {notification.title}
            </Text>
            <Text
              numberOfLines={2}
              style={[
                styles.description,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {notification.body}
            </Text>
          </View>

          <IconButton
            icon="close"
            size={24}
            style={{ margin: 0 }}
            onPress={handleDismiss}
            iconColor={theme.colors.onSurfaceVariant}
          />
        </View>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  card: {
    borderLeftWidth: 4,
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "400",
  },
});

export default NotificationBanner;
