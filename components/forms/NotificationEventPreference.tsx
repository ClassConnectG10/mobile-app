import { customColors } from "@/utils/constants/colors";
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme, Icon, IconButton } from "react-native-paper";

interface NotificationEventPreferenceProps {
  label: string;
  icon: string;
  valueMail: boolean;
  valuePush: boolean;
  onValueMailChange: (value: boolean) => void;
  onValuePushChange: (value: boolean) => void;
  disabled?: boolean;
  alwaysDisabled?: boolean;
  someMail?: boolean;
  somePush?: boolean;
}

export const NotificationEventPreference: React.FC<
  NotificationEventPreferenceProps
> = ({
  label,
  icon,
  valueMail,
  valuePush,
  onValueMailChange,
  onValuePushChange,
  disabled = false,
  alwaysDisabled = false,
  someMail = false,
  somePush = false,
}) => {
    const theme = useTheme();

    const isInteractionDisabled = disabled || alwaysDisabled;

    const getIconColor = (value: boolean, some: boolean) => {
      if (disabled) {
        return "white";
      }
      return value
        ? customColors.success
        : some
          ? customColors.warning
          : theme.colors.error;
    };

    const getBackgroundColor = (value: boolean, some: boolean) => {
      if (disabled) {
        return value
          ? customColors.success
          : some
            ? customColors.warning
            : theme.colors.error;
      }
      return value
        ? customColors.success + "40"
        : some
          ? customColors.warning + "40"
          : theme.colors.errorContainer + "40";
    };

    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.onPrimary }]}
      >
        <View style={styles.labelContainer}>
          <Icon source={icon} size={24} color={theme.colors.onSurface} />
          <Text style={styles.label}>{label}</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <IconButton
            mode="contained"
            icon={"cellphone"}
            iconColor={getIconColor(valuePush, somePush)}
            containerColor={getBackgroundColor(valuePush, somePush)}
            size={24}
            onPress={() => {
              if (isInteractionDisabled) return;
              onValuePushChange(!valuePush);
            }}
            disabled={alwaysDisabled}
          />
          <IconButton
            mode="contained"
            icon={"email"}
            iconColor={getIconColor(valueMail, someMail)}
            containerColor={getBackgroundColor(valueMail, someMail)}
            size={24}
            onPress={() => {
              if (isInteractionDisabled) return;
              onValueMailChange(!valueMail);
            }}
            disabled={alwaysDisabled}
          />
        </View>
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelContainer: {
    gap: 16,
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  label: {
    fontSize: 16,
  },
});
