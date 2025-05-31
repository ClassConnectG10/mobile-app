import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import LineChart, { LineChartDataPoint } from "@/components/charts/LineChart";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { DatePickerButton } from "@/components/forms/DatePickerButton";
import OptionPicker from "@/components/forms/OptionPicker";
import { ListStatCard } from "@/components/ListStatCard";
import { getCourseTeacherActivities } from "@/services/activityManagement";
import { getStatistics, getSubmissionStatistics } from "@/services/statistics";
import { ActivitiesOption, TeacherActivity } from "@/types/activity";
import { Course } from "@/types/course";
import {
  Statistics,
  SubmissionStatistic,
  SubmissionStatisticsParams,
} from "@/types/statistics";
import { BiMap } from "@/utils/bimap";
import { customColors } from "@/utils/constants/colors";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View, ScrollView } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";

// Genera puntos diarios para el gráfico de líneas
function generateDailyPoints(
  stats: { date: Date; count: number }[] | null,
  start: Date,
  end: Date,
): LineChartDataPoint[] {
  if (!stats) return [];
  const statMap = new Map(
    stats.map((stat) => [new Date(stat.date).setHours(0, 0, 0, 0), stat.count]),
  );
  const points = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);
  while (current <= endDay) {
    const ts = current.getTime();
    points.push({
      x: ts,
      y: statMap.get(ts) ?? 0,
    });
    current.setDate(current.getDate() + 1);
  }
  return points;
}

interface StatisticsTabProps {
  course: Course;
}

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
    new Date(new Date().setDate(new Date().getDate() - 7)),
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [submissionStatisticsParams, setSubmissionStatisticsParams] =
    useState<SubmissionStatisticsParams>(
      new SubmissionStatisticsParams(startDate, endDate),
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
        ActivitiesOption.ALL,
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

    console.log(
      "Fetching submission statistics with params:",
      submissionStatisticsParams,
    );

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
    }, [course.courseId]),
  );

  useFocusEffect(
    useCallback(() => {
      fetchSubmissionStatistics();
    }, [submissionStatisticsParams]),
  );

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
                      (a) => a.activity.resourceId === activity.activityId,
                    )?.activity.activityDetails.title ??
                    `Actividad ${activity.activityId}`,
                  value: activity.avgGrade,
                }))}
                title={"Promedio por actividad"}
                titleColor="#000"
                barColor={customColors.info}
                displayValue={(value) => value.toFixed(2)}
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
                    value:
                      (statistics.avgTimeDifferenceHours?.toFixed(2) ?? "-") +
                      " hs",
                    label: "Retraso promedio",
                    color: customColors.warning,
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
            Entregas por actividad
          </Text>
          {/* Entregas por actividad */}
          {examsSubmissionStatistics && tasksSubmissionStatistics && (
            <>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <DatePickerButton
                  label="Desde"
                  value={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    if (date < submissionStatisticsParams.startDate) {
                      setSubmissionStatisticsParams((prev) => ({
                        ...prev,
                        startDate: date,
                      }));
                    }
                  }}
                  horizontal={true}
                  style="white"
                />
                <DatePickerButton
                  label="Hasta"
                  value={endDate}
                  onChange={(date) => {
                    setEndDate(date);
                    if (date > submissionStatisticsParams.endDate) {
                      setSubmissionStatisticsParams((prev) => ({
                        ...prev,
                        endDate: date,
                      }));
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
                      ]),
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
                series={[
                  {
                    label: "Exámenes",
                    color: theme.colors.primary,
                    data: generateDailyPoints(
                      examsSubmissionStatistics,
                      startDate,
                      endDate,
                    ),
                    showPoints: true,
                    strokeWidth: 3,
                    strokeDasharray: "12",
                  },
                  {
                    label: "Tareas",
                    color: customColors.warning,
                    data: generateDailyPoints(
                      tasksSubmissionStatistics,
                      startDate,
                      endDate,
                    ),
                    showPoints: true,
                    strokeWidth: 2,
                  },
                ]}
                showAllXLabels={false}
                xLabelSteps={3}
                renderXLabel={(timestamp) =>
                  new Date(timestamp).toLocaleDateString()
                }
              />
            </>
          )}
        </ScrollView>
      )}
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
};
