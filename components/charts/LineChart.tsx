import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import Svg, { Line, Path, Circle, G, Text as SvgText } from "react-native-svg";

export type LineChartDataPoint = {
  x: number;
  y: number;
};

export type LineChartSeries = {
  label: string;
  color: string;
  data: LineChartDataPoint[];
  showPoints?: boolean;
};

export type LineChartProps = {
  title: string;
  series: LineChartSeries[];
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  showAllXLabels?: boolean;
  xLabelSteps?: number;
  showAllYLabels?: boolean;
  yLabelSteps?: number;
  titleColor?: string;
};

export default function LineChart({
  title,
  series,
  width = 340,
  height = 220,
  xLabel,
  yLabel,
  showAllXLabels = false,
  xLabelSteps = 5,
  showAllYLabels = false,
  yLabelSteps = 3,
  titleColor = "#888", // por defecto gris
}: LineChartProps) {
  const theme = useTheme();
  // Unificar todos los puntos X
  const allX = Array.from(
    new Set(series.flatMap((s) => s.data.map((d) => d.x))),
  ).sort((a, b) => a - b);
  // Escala Y global
  const allY = series.flatMap((s) => s.data.map((d) => d.y));
  const yMin = Math.min(...allY);
  const yMax = Math.max(...allY);
  // Margen para ejes y labels
  const margin = 32;
  // chartW y chartH se calculan en px, pero el SVG se ajusta al 100% del contenedor
  // Por eso, el SVG debe tener width="100%" y el View debe tener style={{ width: '100%' }}
  const chartW = width - margin * 2; // valor base para proporción
  const chartH = height - margin * 2;

  // Escala X basada en valores, no en cantidad de puntos
  const xMin = Math.min(...allX);
  const xMax = Math.max(...allX);

  // Función para escalar X (ahora depende del valor, no del índice)
  const getX = (x: number) => {
    if (xMax === xMin) return margin + chartW / 2;
    return margin + ((x - xMin) / (xMax - xMin)) * chartW;
  };
  // Función para escalar Y
  const getY = (y: number) => {
    if (yMax === yMin) return margin + chartH / 2;
    return margin + chartH - ((y - yMin) / (yMax - yMin)) * chartH;
  };

  // Para labels de X: todos o solo algunos
  let xLabelIndexes: number[];
  if (showAllXLabels || allX.length <= 1) {
    xLabelIndexes = allX.map((_, i) => i);
  } else {
    const steps = Math.min(xLabelSteps, allX.length);
    xLabelIndexes = Array.from({ length: steps }, (_, i) =>
      steps === 1 ? 0 : Math.round((i * (allX.length - 1)) / (steps - 1)),
    );
  }

  // Para labels de Y: todos o solo algunos
  let yLabelValues: number[];
  if (showAllYLabels || yMin === yMax) {
    yLabelValues = Array.from(new Set(allY)).sort((a, b) => b - a);
  } else {
    const steps = Math.max(2, yLabelSteps);
    yLabelValues = Array.from(
      { length: steps },
      (_, i) => yMin + ((yMax - yMin) * (steps - 1 - i)) / (steps - 1),
    );
  }

  return (
    <View
      style={[
        styles.cardContainer,
        { backgroundColor: theme.colors.surface, width: "100%" },
      ]}
    >
      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      <View style={{ width: "100%" }}>
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Ejes */}
          <G>
            {/* Eje X */}
            <Line
              x1={margin}
              y1={height - margin}
              x2={width - margin}
              y2={height - margin}
              stroke="#888"
              strokeWidth={1}
            />
            {/* Eje Y */}
            <Line
              x1={margin}
              y1={margin}
              x2={margin}
              y2={height - margin}
              stroke="#888"
              strokeWidth={1}
            />
          </G>
          {/* Líneas de datos */}
          {series.map((serie) => (
            <Path
              key={serie.label}
              d={serie.data
                .map((d, i) => {
                  const x = getX(d.x);
                  const y = getY(d.y);
                  return i === 0 ? `M${x},${y}` : `L${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke={serie.color}
              strokeWidth={2}
            />
          ))}
          {/* Puntos de datos */}
          {series
            .filter((serie) => serie.showPoints)
            .map((serie) =>
              serie.data.map((d, i) => (
                <Circle
                  key={`${serie.label}-point-${i}`}
                  cx={getX(d.x)}
                  cy={getY(d.y)}
                  r={4}
                  fill={serie.color}
                  stroke="#fff"
                  strokeWidth={1}
                />
              )),
            )}
          {/* Labels de eje Y */}
          {yLabelValues.map((yValue, i) => (
            <SvgText
              key={i}
              x={margin - 10}
              y={getY(yValue) + 4}
              fontSize={12}
              fill="#888"
              textAnchor="end"
              alignmentBaseline="middle"
              fontWeight={
                i === 0 || i === yLabelValues.length - 1 ? "bold" : "normal"
              }
            >
              {Number(yValue.toFixed(1))}
            </SvgText>
          ))}
          {/* Labels de eje X */}
          {xLabelIndexes.map((i) => {
            const x = allX[i];
            return (
              <SvgText
                key={i}
                x={getX(x)}
                y={height - margin + 22}
                fontSize={12}
                fill="#888"
                textAnchor="middle"
                alignmentBaseline="hanging"
                fontWeight={
                  i === 0 || i === allX.length - 1 ? "bold" : "normal"
                }
              >
                {xLabel ? `${xLabel} ${x}` : x}
              </SvgText>
            );
          })}
          {/* Label de eje Y principal ARRIBA */}
          {yLabel && (
            <SvgText
              x={margin - 10}
              y={margin - 12}
              fontSize={13}
              fill="#888"
              textAnchor="end"
              alignmentBaseline="middle"
              fontWeight="bold"
            >
              {yLabel}
            </SvgText>
          )}
        </Svg>
      </View>
      {/* Leyendas */}
      <View
        style={{
          flexDirection: "row",
          gap: 16,
          marginTop: 8,
          justifyContent: "center",
        }}
      >
        {series.map((serie) => (
          <View
            key={serie.label}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <View
              style={{
                width: 16,
                height: 3,
                backgroundColor: serie.color,
                borderRadius: 2,
              }}
            />
            <Text style={{ fontSize: 12 }}>{serie.label}</Text>
          </View>
        ))}
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
    marginVertical: 8,
    width: "100%",
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "left",
  },
});
