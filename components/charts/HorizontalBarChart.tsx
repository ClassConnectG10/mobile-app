import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, IconButton } from "react-native-paper";
import Svg, { Rect } from "react-native-svg";

type Item = {
  label: string;
  value: number;
};

type Props = {
  data: Item[];
  title?: string;
  titleColor?: string;
  barColor?: string;
  displayValue?: (value: number) => string;
  sortOrder?: "asc" | "desc";
};

export default function HorizontalBarChart({
  data,
  barColor: propBarColor,
  title,
  titleColor = "#1976d2",
  displayValue = (value) => value.toString(),
  sortOrder: defaultSortOrder,
}: Props) {
  const theme = useTheme();
  const accentColor = propBarColor || "#6C63FF";

  // Estado para el ordenamiento: inicia con el valor pasado por props, o null
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(
    defaultSortOrder ?? null,
  );

  let sortedData: Item[];
  if (sortOrder === "asc") {
    sortedData = [...data].sort((a, b) => a.value - b.value);
  } else if (sortOrder === "desc") {
    sortedData = [...data].sort((a, b) => b.value - a.value);
  } else {
    sortedData = data;
  }

  // Si no hay datos, mostrar mensaje y no mostrar botón de orden
  if (!sortedData.length) {
    return (
      <View style={[styles.cardContainer, { backgroundColor: theme.colors.surface, minHeight: 120 }]}> 
        {/* Título en la posición habitual */}
        {title && (
          <Text style={[styles.chartLabel, { color: titleColor, marginBottom: 0 }]}>{title}</Text>
        )}
        {/* Mensaje centrado */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 80 }}>
          <Text style={{ color: "#888", fontSize: 16, textAlign: "center" }}>No hay datos para mostrar</Text>
        </View>
      </View>
    );
  }

  const maxValue = Math.max(...sortedData.map((d) => d.value));

  return (
    <View
      style={[styles.cardContainer, { backgroundColor: theme.colors.surface }]}
    >
      {/* Título y botones de ordenamiento en línea */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {title && (
          <Text
            style={[styles.chartLabel, { color: titleColor, marginBottom: 0 }]}
          >
            {title}
          </Text>
        )}
        <IconButton
          icon={
            sortOrder === "asc"
              ? "sort-ascending"
              : sortOrder === "desc"
              ? "sort-descending"
              : "sort"
          }
          size={20}
          iconColor={accentColor}
          containerColor={`${accentColor}22`}
          onPress={() =>
            setSortOrder(
              sortOrder === "asc"
                ? "desc"
                : sortOrder === "desc"
                ? null
                : "asc",
            )
          }
          accessibilityLabel="Cambiar orden"
          style={{ margin: 0, padding: 0 }}
        />
      </View>
      <View style={{ gap: 8 }}>
        {sortedData.map((item, index) => {
          const percentage = item.value / maxValue;
          const effectivePercentage = percentage * 100;
          return (
            <View key={index} style={styles.row}>
              {/* Label */}
              <View style={styles.labelContainer}>
                <Text numberOfLines={3} style={styles.label}>
                  {item.label}
                </Text>
              </View>
              {/* Barra */}
              <View style={styles.barOnlyContainer}>
                <Svg style={{ height: 24, width: "100%" }}>
                  <Rect
                    x={0}
                    y={0}
                    width={`${effectivePercentage}%`}
                    height={24}
                    rx={4}
                    ry={4}
                    fill={accentColor}
                  />
                </Svg>
              </View>
              {/* Valor */}
              <View style={styles.valueLabelContainer}>
                <Text numberOfLines={1} style={styles.valueLabel}>
                  {displayValue(item.value)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
    width: "100%",
  },
  chartLabel: {
    fontWeight: "bold",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelContainer: {
    width: 80,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  label: {
    fontSize: 14,
    color: "#000",
  },
  barOnlyContainer: {
    flex: 1,
    height: 24,
    backgroundColor: "#E0E0E0", // Color de fondo de la barra
    borderRadius: 4,
  },
  valueLabelContainer: {
    width: 50,
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 8,
  },
  valueLabel: {
    fontSize: 12,
  },
});
