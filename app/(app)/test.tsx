import React from "react";
import { ScrollView } from "react-native";
import { Appbar, Button, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";

import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import VerticalBarChart from "@/components/charts/VerticalBarChart";
import { LineChartSeries } from "@/components/charts/LineChart";
import LineChart from "@/components/charts/LineChart";
import { exportToExcel } from "@/utils/files/exportToExcel";
import { openFile } from "@/utils/files/common";
import { File } from "@/types/file";

export default function TestPage() {
  const router = useRouter();
  const theme = useTheme();

  const [exportedFile, setExportedFile] = React.useState<File | null>(null);

  const data = [
    { label: "Argentina", value: 45000000 },
    { label: "Brasil", value: 213000000 },
    { label: "Chile", value: 19000000 },
    { label: "Uruguay", value: 3500000 },
    { label: "Paraguay", value: 7000000 },
    { label: "Bolivia", value: 12000000 },
    { label: "Perú", value: 33000000 },
    { label: "Colombia", value: 51000000 },
    { label: "Venezuela", value: 28000000 },
    { label: "Ecuador", value: 17000000 },
    { label: "Guyana", value: 800000 },
    { label: "Surinam", value: 600000 },
    { label: "Guayana Francesa", value: 300000 },
  ];

  const series: LineChartSeries[] = [
    {
      label: "Argentina",
      color: "#6C63FF",
      data: [
        { x: 1, y: 20 },
        { x: 2, y: 22 },
        { x: 3, y: 21 },
        { x: 4, y: 19 },
        { x: 5, y: -2 },
        { x: 6, y: 5 },
        { x: 7, y: 10 },
        { x: 8, y: 15 },
        { x: 9, y: 18 },
        { x: 10, y: 23 },
      ],
      showPoints: true,
    },
    {
      label: "Brasil",
      color: "#FF9800",
      data: [
        { x: 1, y: 1 },
        { x: 2, y: 10 },
        { x: 3, y: 3 },
        { x: 4, y: 4 },
        { x: 5, y: 5 },
        { x: 6, y: 8 },
        { x: 7, y: 12 },
        { x: 8, y: 15 },
        { x: 9, y: 13 },
        { x: 10, y: 9 },
      ],
      showPoints: true,
    },
    {
      label: "Chile",
      color: "#4CAF50",
      data: [
        { x: 1, y: 5 },
        { x: 2, y: 7 },
        { x: 3, y: 6 },
        { x: 4, y: 8 },
        { x: 5, y: 10 },
        { x: 6, y: 12 },
        { x: 7, y: 9 },
        { x: 8, y: 7 },
        { x: 9, y: 6 },
        { x: 10, y: 5 },
      ],
      showPoints: true,
    },
  ];

  const tables = [
    {
      sheetName: "Indicadores",
      table: [
        { Métrica: "Estudiantes", Valor: 10 },
        { Métrica: "Finalización", Valor: "100%" },
        { Métrica: "Promedio", Valor: 8.6 },
      ],
    },
    {
      sheetName: "Notas",
      table: [
        { Alumno: "Ana", Nota: 10, Observación: "Excelente" },
        { Alumno: "Luis", Nota: 7, Observación: "Bien" },
      ],
    },
  ];

  const handleExport = async () => {
    try {
      const file = await exportToExcel(tables, "estadisticas");
      setExportedFile(file);
    } catch (error) {
      console.error("Error al exportar:", error);
    }
  };

  const handleOpenFile = async () => {
    if (!exportedFile) {
      console.warn("No hay archivo exportado para abrir.");
      return;
    }
    try {
      await openFile(exportedFile);
      console.log("Archivo abierto correctamente:", exportedFile.name);
    } catch (error) {
      console.error("Error al abrir el archivo:", error);
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.Action icon="arrow-left" onPress={() => router.back()} />
        <Appbar.Content title="Testing" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Excel Export Testing */}
        <Button icon="file-excel" mode="contained" onPress={handleExport}>
          Exportar
        </Button>
        <Button
          icon="file-excel"
          mode="outlined"
          onPress={handleOpenFile}
          disabled={!exportedFile}
        >
          Abrir archivo
        </Button>
        <HorizontalBarChart
          data={data}
          barColor={theme.colors.primary}
          title="Población"
          displayValue={(value) => `${(value / 1000000).toFixed(1)} M`}
        />
        <HorizontalBarChart
          data={data}
          barColor={theme.colors.primary}
          title="Población (desc)"
          displayValue={(value) => `${(value / 1000000).toFixed(1)} M`}
          sortOrder="desc"
        />
        <VerticalBarChart
          data={data}
          barColor={theme.colors.primary}
          title="Población"
          displayValue={(value) => `${(value / 1000000).toFixed(1)} M`}
        />
        <VerticalBarChart
          data={data}
          barColor={theme.colors.primary}
          title="Población (desc)"
          displayValue={(value) => `${(value / 1000000).toFixed(1)} M`}
          sortOrder="desc"
        />
        <LineChart
          titleColor={theme.colors.primary}
          title="Clima"
          series={series}
          yLabel="°C"
          renderXLabel={(x) => `Día ${x}`}
        />
      </ScrollView>
    </>
  );
}
