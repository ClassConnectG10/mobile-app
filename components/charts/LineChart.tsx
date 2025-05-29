import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import Svg, { Line, Path, G, Text as SvgText } from "react-native-svg";

export type LineChartSeries = {
  label: string;
  color: string;
  data: { x: number; y: number }[];
};

export type LineChartProps = {
  title: string;
  series: LineChartSeries[];
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
};

export default function LineChart({
  title,
  series,
  width: propWidth = 340,
  height = 220,
  xLabel,
  yLabel,
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
  const chartW = 400 - margin * 2; // valor base para proporción
  const chartH = height - margin * 2;

  return (
    <View
      style={[
        styles.cardContainer,
        { backgroundColor: theme.colors.surface, width: "100%" },
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      <View style={{ width: "100%" }}>
        <Svg width="100%" height={height} viewBox={`0 0 340 ${height}`}>
          {/* Ejes */}
          <G>
            {/* Eje X */}
            <Line
              x1={margin}
              y1={height - margin}
              x2={340 - margin}
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
                  const x =
                    margin +
                    (allX.length === 1
                      ? chartW / 2
                      : (allX.indexOf(d.x) / (allX.length - 1)) * chartW);
                  const y =
                    yMax === yMin
                      ? margin + chartH / 2
                      : margin +
                        chartH -
                        ((d.y - yMin) / (yMax - yMin)) * chartH;
                  return i === 0 ? `M${x},${y}` : `L${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke={serie.color}
              strokeWidth={2}
            />
          ))}
          {/* Labels de eje Y */}
          {[0, 0.5, 1].map((t, i) => (
            <SvgText
              key={i}
              x={margin - 10}
              y={margin + chartH - t * chartH + 4}
              fontSize={12}
              fill="#888"
              textAnchor="end"
              alignmentBaseline="middle"
              fontWeight={i === 0 || i === 2 ? "bold" : "normal"}
            >
              {Number((yMin + (yMax - yMin) * t).toFixed(1))}
            </SvgText>
          ))}
          {/* Labels de eje X */}
          {allX.map((x, i) => (
            <SvgText
              key={i}
              x={
                margin +
                (allX.length === 1
                  ? chartW / 2
                  : (i / (allX.length - 1)) * chartW)
              }
              y={height - margin + 22}
              fontSize={12}
              fill="#888"
              textAnchor="middle"
              alignmentBaseline="hanging"
              fontWeight={i === 0 || i === allX.length - 1 ? "bold" : "normal"}
            >
              {xLabel ? `${xLabel} ${x}` : x}
            </SvgText>
          ))}
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
