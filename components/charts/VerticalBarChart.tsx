import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
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
  height?: number;
  sortOrder?: "asc" | "desc";
};

export default function VerticalBarChart({
  data,
  barColor: propBarColor,
  title,
  titleColor = "#1976d2",
  displayValue = (value) => value.toString(),
  height = 220,
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
      {/* Título y botón de ordenamiento en línea */}
      <View
        style={{
          position: "relative",
          marginBottom: 8,
          minHeight: 32,
          justifyContent: "center",
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
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            marginTop: -20,
            margin: 0,
            padding: 0,
          }}
        />
      </View>
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
    marginBottom: 8,
    textAlign: "left",
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
