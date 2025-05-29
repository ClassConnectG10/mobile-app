import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import Svg, { Rect } from "react-native-svg";

type Item = {
  label: string;
  value: number;
};

type Props = {
  data: Item[];
  title: string;
  barColor?: string;
  displayValue?: (value: number) => string;
  sortOrder?: "asc" | "desc"; // NUEVO: parámetro para ordenar
};

export default function HorizontalBarChart({
  data,
  barColor: propBarColor,
  title,
  displayValue = (value) => value.toString(),
  sortOrder,
}: Props) {
  const theme = useTheme();
  const accentColor = propBarColor || "#6C63FF";
  // Ordenar si corresponde
  const sortedData = sortOrder
    ? [...data].sort((a, b) =>
        sortOrder === "asc" ? a.value - b.value : b.value - a.value,
      )
    : data;
  const maxValue = Math.max(...sortedData.map((d) => d.value));

  return (
    <View
      style={[styles.cardContainer, { backgroundColor: theme.colors.surface }]}
    >
      {/* Título del gráfico */}
      <Text style={[styles.chartLabel, { color: accentColor }]}>{title}</Text>
      <View style={{ gap: 8 }}>
        {sortedData.map((item, index) => {
          const percentage = item.value / maxValue;
          const effectivePercentage = percentage * 100;
          return (
            <View key={index} style={styles.row}>
              {/* Label del país */}
              <View style={styles.labelContainer}>
                <Text numberOfLines={1} style={styles.label}>
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
    width: "100%",
  },
  chartLabel: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
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
