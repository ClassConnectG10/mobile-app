import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import LineChart, {
  generateDailyPoints,
  shouldShowPoints,
} from "@/components/charts/LineChart";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { DatePickerButton } from "@/components/forms/DatePickerButton";
import OptionPicker from "@/components/forms/OptionPicker";
import { ListStatCard } from "@/components/ListStatCard";
import { getCourseTeacherActivities } from "@/services/activityManagement";
import {
  getStatistics,
  getSubmissionStatistics,
} from "@/services/statisticsManagment";
import {
  ActivitiesOption,
  ActivityType,
  TeacherActivity,
} from "@/types/activity";
import { Course } from "@/types/course";
import {
  Statistics,
  SubmissionStatistic,
  SubmissionStatisticsParams,
} from "@/types/statistics";
import { BiMap } from "@/utils/bimap";
import { customColors } from "@/utils/constants/colors";
import { getSimpleRelativeTimeFromNow } from "@/utils/date";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View, ScrollView } from "react-native";
import { ActivityIndicator, Button, Text, useTheme } from "react-native-paper";
import { exportToExcel, normalizeFileName } from "@/utils/files/exportToExcel";
import { openFile } from "@/utils/files/common";

interface StatisticsTabProps {
  course: Course;
}

const INITIAL_RANGE_DAYS_DIFF = 7;

export const StatisticsTab: React.FC<StatisticsTabProps> = ({ course }) => {
  // const router = useRouter();
  const theme = useTheme();

  //   const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [activities, setActivities] = useState<TeacherActivity[] | null>(null);
  const [tasksSubmissionStatistics, setTasksSubmissionStatistics] = useState<
    SubmissionStatistic[] | null
  >(null);
  const [examsSubmissionStatistics, setExamsSubmissionStatistics] = useState<
    SubmissionStatistic[] | null
  >(null);
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() - INITIAL_RANGE_DAYS_DIFF))
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [submissionStatisticsParams, setSubmissionStatisticsParams] =
    useState<SubmissionStatisticsParams>(
      new SubmissionStatisticsParams(startDate, endDate)
    );

  const fetchStatistics = async () => {
    if (!course.courseId) return;
    setIsLoading(true);
    try {
      const fetchedStatistics = await getStatistics(course.courseId);
      setStatistics(fetchedStatistics);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivities = async () => {
    if (!course.courseId) return;
    setIsLoading(true);
    try {
      const fetchedActivities = await getCourseTeacherActivities(
        course.courseId,
        ActivitiesOption.ALL
      );
      setActivities(fetchedActivities);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissionStatistics = async () => {
    if (!course.courseId) return;
    // setIsLoading(true); Lo comento para que no me recargue toda la pantalla al cambiar los filtros

    try {
      const [
        fetchedTasksSubmissionStatistics,
        fetchedExamsSubmissionStatistics,
      ] = await Promise.all([
        getSubmissionStatistics(course.courseId, {
          ...submissionStatisticsParams,
          activityType: ActivitiesOption.TASKS,
        }),
        getSubmissionStatistics(course.courseId, {
          ...submissionStatisticsParams,
          activityType: ActivitiesOption.EXAMS,
        }),
      ]);

      setTasksSubmissionStatistics(fetchedTasksSubmissionStatistics);
      setExamsSubmissionStatistics(fetchedExamsSubmissionStatistics);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStatistics();
      fetchActivities();
    }, [course.courseId])
  );

  useFocusEffect(
    useCallback(() => {
      fetchSubmissionStatistics();
    }, [submissionStatisticsParams])
  );

  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
    if (date < submissionStatisticsParams.startDate) {
      setSubmissionStatisticsParams((prev) => ({
        ...prev,
        startDate: date,
      }));
    }
  };

  const handleEndDateChange = (date: Date) => {
    setEndDate(date);
    if (date > submissionStatisticsParams.endDate) {
      setSubmissionStatisticsParams((prev) => ({
        ...prev,
        endDate: date,
      }));
    }
  };

  const handleExport = async () => {
    if (!statistics || !activities) {
      setErrorMessage("No hay datos disponibles para exportar");
      return;
    }

    try {
      const tables = [
        {
          sheetName: "Indicadores del Curso",
          table: [
            { Métrica: "Estudiantes", Valor: statistics.studentsCount },
            {
              Métrica: "Promedio General",
              Valor: statistics.overallAvgGrade?.toFixed(2) ?? "-",
            },
            {
              Métrica: "Tasa de Finalización",
              Valor: `${(statistics.completionRate * 100).toFixed(2)}%`,
            },
            {
              Métrica: "Actividades Publicadas",
              Valor: statistics.publishedActivitiesCount,
            },
            {
              Métrica: "Actividades Sin Publicar",
              Valor: statistics.unpublishedActivitiesCount,
            },
          ],
        },
        {
          sheetName: "Estadísticas de Entregas",
          table: [
            {
              Métrica: "Total de Entregas",
              Valor: statistics.completedSubmissionsCount,
            },
            {
              Métrica: "Entregas a Tiempo",
              Valor: statistics.onTimeSubmissions,
            },
            { Métrica: "Entregas Tardías", Valor: statistics.lateSubmissions },
            {
              Métrica: "Tiempo Promedio de Diferencia",
              Valor:
                statistics.avgTimeDifferenceHours !== undefined
                  ? `${statistics.avgTimeDifferenceHours.toFixed(2)} horas`
                  : "-",
            },
          ],
        },
        {
          sheetName: "Promedio por Actividad",
          table: statistics.avgGradesPerActivity.map((activity) => ({
            Actividad:
              activities?.find(
                (a) => a.activity.resourceId === activity.activityId
              )?.activity.activityDetails.title ??
              `Actividad ${activity.activityId}`,
            "Promedio de Calificación": activity.avgGrade.toFixed(2),
          })),
        },
        {
          sheetName: "Foro",
          table: [
            { Métrica: "Preguntas", Valor: statistics.questionsCount },
            { Métrica: "Respuestas", Valor: statistics.answersCount },
            {
              Métrica: "Respuestas por Pregunta",
              Valor: statistics.avgAnswersPerQuestion.toFixed(2),
            },
          ],
        },
      ];

      // Unificar entregas de tareas y exámenes en una sola tabla
      if (
        (tasksSubmissionStatistics && tasksSubmissionStatistics.length > 0) ||
        (examsSubmissionStatistics && examsSubmissionStatistics.length > 0)
      ) {
        // Generar todos los días del rango seleccionado
        const generateDateRange = (start: Date, end: Date): string[] => {
          const dates = [];
          const current = new Date(start);
          current.setHours(0, 0, 0, 0);
          const endDay = new Date(end);
          endDay.setHours(0, 0, 0, 0);

          while (current <= endDay) {
            dates.push(current.toDateString());
            current.setDate(current.getDate() + 1);
          }
          return dates;
        };

        const allDates = generateDateRange(startDate, endDate);

        // Verificar si hay una actividad específica seleccionada
        if (submissionStatisticsParams.activityId) {
          const selectedActivity = activities?.find(
            (a) =>
              a.activity.resourceId === submissionStatisticsParams.activityId
          );

          if (selectedActivity) {
            const isExam = selectedActivity.activity.type === ActivityType.EXAM;
            const relevantStats = isExam
              ? examsSubmissionStatistics
              : tasksSubmissionStatistics;

            // Mapear fecha a cantidad de entregas
            const statsMap = new Map(
              (relevantStats ?? []).map((stat) => [
                stat.date.toDateString(),
                stat.count,
              ])
            );

            // Construir la tabla con solo el tipo correspondiente
            const columnName = isExam
              ? "Entregas de Exámenes"
              : "Entregas de Tareas";
            const submissionsTable = allDates.map((date) => ({
              Fecha: date,
              [columnName]: statsMap.get(date) ?? 0,
            }));

            const sheetName = `Entregas por Día - ${selectedActivity.activity.activityDetails.title}`;
            tables.push({
              sheetName,
              table: submissionsTable as any,
            });
          }
        } else {
          // Vista general: mostrar ambas columnas con todos los días del rango
          const tasksMap = new Map(
            (tasksSubmissionStatistics ?? []).map((stat) => [
              stat.date.toDateString(),
              stat.count,
            ])
          );
          const examsMap = new Map(
            (examsSubmissionStatistics ?? []).map((stat) => [
              stat.date.toDateString(),
              stat.count,
            ])
          );

          // Construir la tabla combinada con todos los días
          const combinedTable = allDates.map((date) => ({
            Fecha: date,
            "Entregas de Tareas": tasksMap.get(date) ?? 0,
            "Entregas de Exámenes": examsMap.get(date) ?? 0,
          }));

          tables.push({
            sheetName: "Entregas por Día",
            table: combinedTable as any,
          });
        }
      }

      const timestamp = new Date().toISOString();
      const normalizedCourseName = normalizeFileName(
        course.courseDetails.title
      );
      const fileName = `estadisticas_${normalizedCourseName}_${timestamp}`;
      const file = await exportToExcel(tables, fileName);
      await openFile(file);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <View style={{ paddingHorizontal: 16, flex: 1 }}>
      {isLoading || !statistics || !activities ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator
            animating={true}
            size="large"
            color={theme.colors.primary}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 32, gap: 16 }}>
          {/* Título */}
          {statistics && (
            <>
              {/* Curso */}
              <ListStatCard
                title={"Curso"}
                indicators={[
                  {
                    icon: "account-multiple",
                    value: statistics.studentsCount,
                    label: "Estudiantes",
                    color: theme.colors.primary,
                  },
                ]}
              />
              {/* Actividades */}
              <ListStatCard
                title={"Actividades"}
                indicators={[
                  {
                    icon: "star",
                    value: statistics.overallAvgGrade?.toFixed(2) ?? "-",
                    label: "Promedio",
                    color: theme.colors.primary,
                  },
                  {
                    icon: "check-circle",
                    value: `${(statistics.completionRate * 100).toFixed(2)} %`,
                    label: "Finalización",
                    color: theme.colors.primary,
                  },
                  {
                    icon: "clipboard-check",
                    value: statistics.publishedActivitiesCount,
                    label: "Publicadas",
                    color: customColors.success,
                  },
                  {
                    icon: "clipboard-remove",
                    value: statistics.unpublishedActivitiesCount,
                    label: "Sin publicar",
                    color: customColors.error,
                  },
                ]}
              />
              {/* Promedio por actividad */}
              <HorizontalBarChart
                data={statistics.avgGradesPerActivity.map((activity) => ({
                  label:
                    activities?.find(
                      (a) => a.activity.resourceId === activity.activityId
                    )?.activity.activityDetails.title ??
                    `Actividad ${activity.activityId}`,
                  value: activity.avgGrade,
                }))}
                title={"Promedio por actividad"}
                titleColor="#000"
                barColor={customColors.info}
                displayValue={(value) => value.toFixed(2)}
              />

              {/* Foro */}
              <ListStatCard
                title={"Foro"}
                indicators={[
                  {
                    icon: "forum",
                    value: statistics.questionsCount,
                    label: "Preguntas",
                    color: theme.colors.primary,
                  },
                  {
                    icon: "comment-text-multiple",
                    value: statistics.answersCount,
                    label: "Respuestas",
                    color: theme.colors.primary,
                  },
                  {
                    icon: "comment-question",
                    value: statistics.avgAnswersPerQuestion.toFixed(2),
                    label: "Respuestas por pregunta",
                    color: theme.colors.primary,
                  },
                ]}
              />

              {/* Entregas */}
              <ListStatCard
                title={"Entregas"}
                indicators={[
                  {
                    icon: "email-open",
                    value: statistics.completedSubmissionsCount,
                    label: "Entregas",
                    color: theme.colors.primary,
                  },
                  {
                    icon: "timer-sand",
                    value: getSimpleRelativeTimeFromNow(
                      new Date(
                        Date.now() +
                        statistics.avgTimeDifferenceHours * 60 * 60 * 1000
                      )
                    ),
                    label:
                      statistics.avgTimeDifferenceHours >= 0
                        ? "Anticipo promedio"
                        : "Retraso promedio",
                    color:
                      statistics.avgTimeDifferenceHours >= 0
                        ? customColors.success
                        : customColors.error,
                  },
                  {
                    icon: "clock-check",
                    value: statistics.onTimeSubmissions,
                    label: "A tiempo",
                    color: customColors.success,
                  },
                  {
                    icon: "clock-alert",
                    value: statistics.lateSubmissions,
                    label: "Tarde",
                    color: customColors.error,
                  },
                ]}
              />
            </>
          )}
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            Entregas a lo largo del tiempo
          </Text>
          {/* Entregas por actividad */}
          {examsSubmissionStatistics && tasksSubmissionStatistics && (
            <>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <DatePickerButton
                  label="Desde"
                  value={startDate}
                  onChange={(date) => {
                    handleStartDateChange(date);
                    if (date > endDate) {
                      handleEndDateChange(date);
                    }
                  }}
                  horizontal={true}
                  style="white"
                />
                <DatePickerButton
                  label="Hasta"
                  value={endDate}
                  onChange={(date) => {
                    handleEndDateChange(date);
                    if (date < startDate) {
                      handleStartDateChange(date);
                    }
                  }}
                  horizontal={true}
                  style="white"
                />
              </View>
              <OptionPicker
                label="Actividad"
                value={submissionStatisticsParams.activityId?.toString() ?? ""}
                items={
                  new BiMap(
                    activities
                      .filter((activity) => activity.visible)
                      .map((activity) => [
                        activity.activity.activityDetails.title,
                        activity.activity.resourceId.toString(),
                      ])
                  )
                }
                setValue={(value) => {
                  setSubmissionStatisticsParams((prev) => ({
                    ...prev,
                    activityId: value ? Number(value) : undefined,
                  }));
                }}
                style="white"
              />
              <LineChart
                title={"Entregas por día"}
                titleColor="#000"
                series={(() => {
                  const showPoints = shouldShowPoints(startDate, endDate);

                  if (submissionStatisticsParams.activityId) {
                    const selectedActivity = activities?.find(
                      (a) =>
                        a.activity.resourceId ===
                        submissionStatisticsParams.activityId
                    );
                    if (!selectedActivity) return [];

                    return [
                      {
                        label: selectedActivity.activity.activityDetails.title,
                        color: theme.colors.primary,
                        data: generateDailyPoints(
                          selectedActivity.activity.type === ActivityType.EXAM
                            ? examsSubmissionStatistics
                            : tasksSubmissionStatistics,
                          startDate,
                          endDate
                        ),
                        showPoints: showPoints,
                        strokeWidth: 2,
                      },
                    ];
                  }
                  return [
                    {
                      label: "Exámenes",
                      color: theme.colors.primary,
                      data: generateDailyPoints(
                        examsSubmissionStatistics,
                        startDate,
                        endDate
                      ),
                      showPoints: showPoints,
                      strokeWidth: 3,
                      strokeDasharray: "5",
                    },
                    {
                      label: "Tareas",
                      color: customColors.warning,
                      data: generateDailyPoints(
                        tasksSubmissionStatistics,
                        startDate,
                        endDate
                      ),
                      showPoints: showPoints,
                      strokeWidth: 2,
                    },
                  ];
                })()}
                showAllXLabels={false}
                xLabelSteps={3}
                renderXLabel={(timestamp) =>
                  new Date(timestamp).toLocaleDateString()
                }
              />
            </>
          )}

          <Button icon="file-excel" mode="contained" onPress={handleExport}>
            Exportar estadísticas
          </Button>
        </ScrollView>
      )}
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
};
