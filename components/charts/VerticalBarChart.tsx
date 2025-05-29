import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
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
  height?: number;
  sortOrder?: "asc" | "desc"; // NUEVO: parámetro para ordenar
};

export default function VerticalBarChart({
  data,
  barColor: propBarColor,
  title,
  displayValue = (value) => value.toString(),
  height = 220,
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
      <Text style={[styles.chartLabel, { color: accentColor }]}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        contentContainerStyle={{ alignItems: "flex-end", height }}
      >
        {/* Eje Y: labels */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            height: "100%",
          }}
        >
          {sortedData.map((item, idx) => {
            const percentage = (item.value / maxValue) * 100;
            return (
              <View key={idx} style={styles.barColumn}>
                {/* Barra */}
                <View style={[styles.barWrapper]}>
                  <Svg style={{ width: 32, height: "100%" }}>
                    <Rect
                      x={0}
                      y={`${100 - percentage}%`}
                      width={32}
                      height={`${percentage}%`}
                      rx={6}
                      ry={6}
                      fill={accentColor}
                    />
                  </Svg>
                </View>
                <View>
                  {/* Valor debajo de la barra */}
                  <Text style={styles.valueLabel}>
                    {displayValue(item.value)}
                  </Text>
                  {/* Label debajo del valor */}
                  <Text style={styles.label} numberOfLines={1}>
                    {item.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
  },
  chartLabel: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
  },
  barColumn: {
    alignItems: "center",
    width: 60,
    height: "100%",
    gap: 4,
  },
  barWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
  },
  valueLabel: {
    fontSize: 12,
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    fontSize: 12,
    color: "#000",
    textAlign: "center",
  },
});
