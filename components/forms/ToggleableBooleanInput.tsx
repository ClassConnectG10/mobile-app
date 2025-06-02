import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme, Icon, IconButton } from "react-native-paper";

interface ToggleableBooleanInputProps {
  label: string;
  icon: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  alwaysDisabled?: boolean;
}

export const ToggleableBooleanInput: React.FC<ToggleableBooleanInputProps> = ({
  label,
  icon,
  value,
  onValueChange,
  disabled = false,
  alwaysDisabled = false,
}) => {
  const theme = useTheme();

  const isInteractionDisabled = disabled || alwaysDisabled;

  const getIconName = () => {
    if (alwaysDisabled) {
      return "cancel";
    }
    return value ? "check-circle" : "close-circle";
  };

  const getIconColor = () => {
    if (alwaysDisabled) {
      return theme.colors.outline;
    }
    if (disabled) {
      return "white";
    }
    return value ? theme.colors.primary : theme.colors.error;
  };

  const getBackgroundColor = () => {
    if (alwaysDisabled) {
      return theme.colors.surfaceVariant;
    }
    if (disabled) {
      return value ? theme.colors.primary : theme.colors.error;
    }
    return value
      ? theme.colors.primaryContainer + "40"
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

      <IconButton
        mode="contained"
        icon={getIconName()}
        iconColor={getIconColor()}
        containerColor={getBackgroundColor()}
        size={24}
        onPress={() => {
          if (isInteractionDisabled) return;
          onValueChange(!value);
        }}
        disabled={alwaysDisabled}
      />
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
