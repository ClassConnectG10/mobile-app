import React from "react";
import { View, StyleSheet } from "react-native";
import { IconButton, useTheme } from "react-native-paper";

interface ReviewPickerProps {
  editable: boolean;
  value: number;
  onChange: (value: number) => void;
}

const ReviewPicker: React.FC<ReviewPickerProps> = ({
  editable,
  value,
  onChange: setValue,
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
            backgroundColor: theme.colors.inverseOnSurface,
            borderColor: theme.colors.outline,
          },
        ]}
      >
        {[...Array(5)].map((_, index) => (
          <IconButton
            key={index}
            icon="star"
            mode="contained-tonal"
            iconColor={
              index < value
                ? theme.colors.primary
                : theme.colors.onSurfaceVariant
            }
            containerColor="transparent"
            size={24}
            onPress={() => {
              if (editable) {
                handlePress(index);
              }
            }}
            style={styles.starButton}
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
  starButton: {
    marginHorizontal: 0, // Reducir margen horizontal entre botones
  },
});

export default ReviewPicker;
