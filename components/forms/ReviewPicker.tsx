import React from "react";
import { View, StyleSheet } from "react-native";
import { IconButton, useTheme } from "react-native-paper";

interface ReviewPickerProps {
  editable: boolean;
  value: number | null;
  onChange: (value: number | null) => void;
  backgroundColor?: string;
  borderColor?: string;
  iconSize?: number;
  compact?: boolean;
}

const ReviewPicker: React.FC<ReviewPickerProps> = ({
  editable,
  value,
  onChange: setValue,
  backgroundColor,
  borderColor,
  iconSize = 24,
  compact = false,
}) => {
  const theme = useTheme();
  const handlePress = (index: number) => {
    if (editable) {
      setValue(index + 1);
    }
  };

  return (
    <View style={{ flex: 0, alignItems: "center" }}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: backgroundColor || theme.colors.inverseOnSurface,
            borderColor: borderColor || theme.colors.outline,
          },
        ]}
      >
        {[...Array(5)].map((_, index) => (
          <IconButton
            key={index}
            icon="star"
            mode="contained-tonal"
            iconColor={
              value !== null && index < value
                ? theme.colors.primary
                : theme.colors.onSurfaceVariant
            }
            containerColor="transparent"
            size={iconSize}
            onPress={() => {
              if (editable) {
                handlePress(index);
              }
            }}
            style={{ marginHorizontal: compact ? -5 : 0, marginVertical: 0 }}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexGrow: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 0, // Eliminar espaciado interno
    borderRadius: 8, // Bordes redondeados
    borderWidth: 1, // Añadir borde
  },
});

export default ReviewPicker;
