import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import LineChart, {
  generateDailyPoints,
  shouldShowPoints,
} from "@/components/charts/LineChart";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { ListStatCard } from "@/components/ListStatCard";
import { DatePickerButton } from "@/components/forms/DatePickerButton";
import {
  getStudentStatistics,
  getSubmissionStatistics,
} from "@/services/statisticsManagment";
import { getUser } from "@/services/userManagement";
import { ActivitiesOption, ActivityType } from "@/types/activity";
import {
  SubmissionStatisticsParams,
  SubmissionStatistic,
  StudentStatistics,
} from "@/types/statistics";
import { User } from "@/types/user";
import { customColors } from "@/utils/constants/colors";
import { getSimpleRelativeTimeFromNow } from "@/utils/date";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View, ScrollView } from "react-native";
import {
  Appbar,
  useTheme,
  Text,
  ActivityIndicator,
  Button,
} from "react-native-paper";
import { openFile } from "@/utils/files/common";
import { exportToExcel, normalizeFileName } from "@/utils/files/exportToExcel";

export default function StudentStatisticsPage() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, studentId: studentIdParam } =
    useLocalSearchParams();
  const courseId = courseIdParam as string;
  const studentId = studentIdParam as string;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [student, setStudent] = useState<User | null>(null);

  const [studentStatistics, setStudentStatistics] =
    useState<StudentStatistics | null>(null);
  const [tasksSubmissionStatistics, setTasksSubmissionStatistics] = useState<
    SubmissionStatistic[] | null
  >(null);
  const [examsSubmissionStatistics, setExamsSubmissionStatistics] = useState<
    SubmissionStatistic[] | null
  >(null);
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() - 7))
  );
  const [endDate, setEndDate] = useState<Date>(new Date());

  const fetchStudent = async () => {
    if (!studentId) return;
    setIsLoading(true);
    try {
      const fetchedStudent = await getUser(Number(studentId));
      setStudent(fetchedStudent);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentStatistics = async () => {
    if (!courseId || !studentId) return;
    setIsLoading(true);

    try {
      const fetchedStats = await getStudentStatistics(
        courseId,
        Number(studentId)
      );
      setStudentStatistics(fetchedStats);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissionStats = async () => {
    if (!courseId || !studentId) return;
    try {
      const [tasks, exams] = await Promise.all([
        getSubmissionStatistics(
          courseId,
          new SubmissionStatisticsParams(
            startDate,
            endDate,
            ActivitiesOption.TASKS,
            undefined,
            Number(studentId)
          )
        ),
        getSubmissionStatistics(
          courseId,
          new SubmissionStatisticsParams(
            startDate,
            endDate,
            ActivitiesOption.EXAMS,
            undefined,
            Number(studentId)
          )
        ),
      ]);
      setTasksSubmissionStatistics(tasks);
      setExamsSubmissionStatistics(exams);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStudent();
      fetchStudentStatistics();
    }, [courseId, studentId])
  );

  useFocusEffect(
    useCallback(() => {
      fetchSubmissionStats();
    }, [startDate, endDate, courseId, studentId])
  );

  const handleExport = async () => {
    if (!studentStatistics || !student) {
      setErrorMessage("No hay datos disponibles para exportar");
      return;
    }

    try {
      const studentName = `${student.userInformation.firstName}_${student.userInformation.lastName}`;

      const tables = [
        // 1. Datos del estudiante
        {
          sheetName: "Datos del Estudiante",
          table: [
            {
              Métrica: "Nombre",
              Valor: `${student.userInformation.firstName} ${student.userInformation.lastName}`,
            },
            { Métrica: "Email", Valor: student.userInformation.email },
          ],
        },
        // 2. Estadísticas generales
        {
          sheetName: "Estadísticas Generales",
          table: [
            {
              Métrica: "Actividades Publicadas",
              Valor: studentStatistics.publishedActivitiesCount,
            },
            {
              Métrica: "Entregas Completadas",
              Valor: studentStatistics.completedSubmissionsCount,
            },
            {
              Métrica: "Tasa de Finalización",
              Valor: `${(studentStatistics.completionRate * 100).toFixed(2)}%`,
            },
            {
              Métrica: "Promedio General",
              Valor: studentStatistics.overallAvgGrade?.toFixed(2) ?? "-",
            },
            {
              Métrica: "Entregas a Tiempo",
              Valor: studentStatistics.onTimeSubmissions,
            },
            {
              Métrica: "Entregas Tardías",
              Valor: studentStatistics.lateSubmissions,
            },
            {
              Métrica: "Tiempo Promedio de Diferencia",
              Valor:
                studentStatistics.avgTimeDifferenceHours !== undefined
                  ? `${studentStatistics.avgTimeDifferenceHours.toFixed(
                      2
                    )} horas`
                  : "-",
            },
          ],
        },
        // 3. Estadísticas para tareas
        {
          sheetName: "Estadísticas de Tareas",
          table: [
            {
              Métrica: "Promedio de Tareas",
              Valor: studentStatistics.avgTaskGrade?.toFixed(2) ?? "-",
            },
            {
              Métrica: "Cantidad de Tareas",
              Valor:
                studentStatistics.activities?.filter(
                  (a) => a.type === ActivityType.TASK && a.published
                ).length ?? 0,
            },
          ],
        },
        // 4. Notas por tarea
        {
          sheetName: "Notas por Tarea",
          table: studentStatistics.activities
            .filter((a) => a.type === ActivityType.TASK && a.grade !== null)
            .map((a) => ({
              Actividad: a.title,
              Nota: a.grade,
            })),
        },
        // 5. Estadísticas para exámenes
        {
          sheetName: "Estadísticas de Exámenes",
          table: [
            {
              Métrica: "Promedio de Exámenes",
              Valor: studentStatistics.avgExamGrade?.toFixed(2) ?? "-",
            },
            {
              Métrica: "Cantidad de Exámenes",
              Valor:
                studentStatistics.activities?.filter(
                  (a) => a.type === ActivityType.EXAM && a.published
                ).length ?? 0,
            },
          ],
        },
        // 6. Notas por examen
        {
          sheetName: "Notas por Examen",
          table: studentStatistics.activities
            .filter(
              (activity) =>
                activity.type === ActivityType.EXAM && activity.grade !== null
            )
            .map((activity) => {
              return {
                Actividad: activity.title ?? `Actividad ${activity.activityId}`,
                Nota: activity.grade,
              };
            }),
        },
      ];

      // Add submission statistics if available
      if (
        (tasksSubmissionStatistics && tasksSubmissionStatistics.length > 0) ||
        (examsSubmissionStatistics && examsSubmissionStatistics.length > 0)
      ) {
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

        const submissionsTable = allDates.map((date) => ({
          Fecha: date,
          "Entregas de Tareas": tasksMap.get(date) ?? 0,
          "Entregas de Exámenes": examsMap.get(date) ?? 0,
        }));

        tables.push({
          sheetName: "Entregas por Día",
          table: submissionsTable as any,
        });
      }

      const timestamp = new Date().toISOString();
      const normalizedStudentName = normalizeFileName(studentName);
      const fileName = `estadisticas_estudiante_${normalizedStudentName}_${timestamp}`;
      const file = await exportToExcel(tables, fileName);
      await openFile(file);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={"Estadísticas del estudiante"} />
      </Appbar.Header>
      {isLoading || !studentStatistics ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator
            animating={true}
            size="large"
            color={theme.colors.primary}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            gap: 16,
          }}
        >
          <ListStatCard
            title={"Actividades"}
            indicators={[
              {
                icon: "clipboard-check",
                value: studentStatistics.publishedActivitiesCount,
                label: "Publicadas",
                color: customColors.info,
              },
              {
                icon: "email-open",
                value: studentStatistics.completedSubmissionsCount,
                label: "Entregas",
                color: customColors.info,
              },
              {
                icon: "check-circle",
                value: `${(studentStatistics.completionRate * 100).toFixed(
                  2
                )} %`,
                label: "Finalización",
                color: customColors.info,
              },
              {
                icon: "timer-sand",
                value: getSimpleRelativeTimeFromNow(
                  new Date(
                    Date.now() +
                      studentStatistics.avgTimeDifferenceHours * 60 * 60 * 1000
                  )
                ),
                label:
                  studentStatistics.avgTimeDifferenceHours >= 0
                    ? "Anticipo promedio"
                    : "Retraso promedio",
                color:
                  studentStatistics.avgTimeDifferenceHours >= 0
                    ? customColors.success
                    : customColors.error,
              },
              {
                icon: "clock-check",
                value: studentStatistics.onTimeSubmissions,
                label: "A tiempo",
                color: customColors.success,
              },
              {
                icon: "clock-alert",
                value: studentStatistics.lateSubmissions,
                label: "Tarde",
                color: customColors.error,
              },
              {
                icon: "star",
                value: studentStatistics.overallAvgGrade?.toFixed(2) ?? "-",
                label: "Promedio general",
                color: customColors.warning,
              },
            ]}
          />

          {/* Sección Tareas */}
          <ListStatCard
            title={"Tareas"}
            indicators={[
              {
                icon: "clipboard-text",
                value: studentStatistics.activities.filter(
                  (a) => a.type === ActivityType.TASK && a.published
                ).length,
                label: "Cantidad de tareas",
                color: customColors.info,
              },
              {
                icon: "star-outline",
                value: studentStatistics.avgTaskGrade?.toFixed(2) ?? "-",
                label: "Promedio de tareas",
                color: customColors.info,
              },
            ]}
          />
          {/* HorizontalBarChart de notas por tarea */}
          <HorizontalBarChart
            data={studentStatistics.activities
              .filter(
                (activity) =>
                  activity.type === ActivityType.TASK && activity.grade !== null
              )
              .map((activity) => {
                return {
                  label: activity.title,
                  value: activity.grade,
                };
              })}
            title={"Nota por tarea"}
            titleColor={customColors.info}
            barColor={customColors.info}
            displayValue={(value) => value.toFixed(2)}
          />

          {/* HorizontalBarChart de tiempo restante de entrega para tareas - A tiempo */}
          <HorizontalBarChart
            data={studentStatistics.activities
              .filter(
                (activity) =>
                  activity.type === ActivityType.TASK &&
                  activity.submited &&
                  activity.submissionDate.getTime() <=
                    activity.dueDate.getTime()
              )
              .map((activity) => ({
                label: activity.title,
                value:
                  activity.dueDate.getTime() -
                  activity.submissionDate.getTime(),
              }))}
            title={"Tiempo restante de entrega por tarea"}
            titleColor={customColors.info}
            barColor={customColors.info}
            displayValue={(value) => {
              const displayDate = new Date(Date.now() - value);
              return getSimpleRelativeTimeFromNow(displayDate);
            }}
          />

          {/* HorizontalBarChart de tiempo restante de entrega para tareas - Tarde */}
          <HorizontalBarChart
            data={studentStatistics.activities
              .filter(
                (activity) =>
                  activity.type === ActivityType.TASK &&
                  activity.submited &&
                  activity.submissionDate.getTime() > activity.dueDate.getTime()
              )
              .map((activity) => ({
                label: activity.title,
                value:
                  activity.submissionDate.getTime() -
                  activity.dueDate.getTime(),
              }))}
            title={"Tiempo vencido de entrega por tarea"}
            titleColor={customColors.error}
            barColor={customColors.error}
            displayValue={(value) => {
              const displayDate = new Date(Date.now() - value);
              return getSimpleRelativeTimeFromNow(displayDate);
            }}
          />

          {/* Sección Exámenes */}
          <ListStatCard
            title={"Exámenes"}
            indicators={[
              {
                icon: "file-document-edit",
                value: studentStatistics.activities.filter(
                  (a) => a.type === ActivityType.EXAM && a.published
                ).length,
                label: "Cantidad de exámenes",
                color: theme.colors.primary,
              },
              {
                icon: "star-outline",
                value: studentStatistics.avgExamGrade?.toFixed(2) ?? "-",
                label: "Promedio de exámenes",
                color: theme.colors.primary,
              },
            ]}
          />
          {/* HorizontalBarChart de notas por examen */}
          <HorizontalBarChart
            data={studentStatistics.activities
              .filter(
                (activity) =>
                  activity.type === ActivityType.EXAM && activity.grade !== null
              )
              .map((activity) => ({
                label: activity.title,
                value: activity.grade,
              }))}
            title={"Nota por exámen"}
            titleColor={theme.colors.primary}
            barColor={theme.colors.primary}
            displayValue={(value) => value.toFixed(2)}
          />

          {/* HorizontalBarChart de tiempo restante de entrega para exámenes - A tiempo */}
          <HorizontalBarChart
            data={studentStatistics.activities
              .filter(
                (activity) =>
                  activity.type === ActivityType.EXAM &&
                  activity.submited &&
                  activity.submissionDate.getTime() <=
                    activity.dueDate.getTime()
              )
              .map((activity) => ({
                label: activity.title,
                value:
                  activity.dueDate.getTime() -
                  activity.submissionDate.getTime(),
              }))}
            title={"Tiempo restante de entrega por exámen"}
            titleColor={theme.colors.primary}
            barColor={theme.colors.primary}
            displayValue={(value) => {
              // value es positivo aquí, representa cuántas horas antes entregó
              const displayDate = new Date(Date.now() - value);
              return getSimpleRelativeTimeFromNow(displayDate);
            }}
          />

          <HorizontalBarChart
            data={studentStatistics.activities
              .filter(
                (activity) =>
                  activity.type === ActivityType.EXAM &&
                  activity.submited &&
                  activity.submissionDate.getTime() > activity.dueDate.getTime()
              )
              .map((activity) => ({
                label: activity.title,
                value:
                  activity.submissionDate.getTime() -
                  activity.dueDate.getTime(),
              }))}
            title={"Tiempo vencido de entrega por exámen"}
            titleColor={theme.colors.error}
            barColor={theme.colors.error}
            displayValue={(value) => {
              const displayDate = new Date(Date.now() - value);
              return getSimpleRelativeTimeFromNow(displayDate);
            }}
          />

          <Text style={{ fontWeight: "bold", fontSize: 18 }}>
            Entregas a lo largo del tiempo
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <DatePickerButton
              label="Desde"
              value={startDate}
              onChange={(date) => {
                setStartDate(date);
                if (date > endDate) setEndDate(date);
              }}
              horizontal={true}
              style="white"
            />
            <DatePickerButton
              label="Hasta"
              value={endDate}
              onChange={(date) => {
                setEndDate(date);
                if (date < startDate) setStartDate(date);
              }}
              horizontal={true}
              style="white"
            />
          </View>
          <LineChart
            title={"Entregas por día"}
            titleColor="#000"
            series={(() => {
              const showPoints = shouldShowPoints(startDate, endDate);
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
                  color: customColors.info,
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

          <Button icon="file-excel" mode="contained" onPress={handleExport}>
            Exportar estadísticas del estudiante
          </Button>
        </ScrollView>
      )}
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
}
