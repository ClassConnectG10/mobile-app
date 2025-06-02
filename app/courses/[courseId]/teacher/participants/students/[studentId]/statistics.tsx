import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import LineChart, { generateDailyPoints } from "@/components/charts/LineChart";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { ListStatCard } from "@/components/ListStatCard";
import { DatePickerButton } from "@/components/forms/DatePickerButton";
import {
  getStudentStatistics,
  getSubmissionStatistics,
} from "@/services/statisticsManagment";
import { getUser } from "@/services/userManagement";
import {
  ActivitiesOption,
  ActivityGrade,
  ActivitySubmission,
  TeacherActivity,
  ActivityType,
} from "@/types/activity";
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
import { Appbar, useTheme, Text, ActivityIndicator } from "react-native-paper";
import {
  getActivitiesGradesByStudent,
  getCourseTeacherActivities,
  getSubmissionsByStudent,
} from "@/services/activityManagement";

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
  const [submissions, setSubmissions] = useState<ActivitySubmission[] | null>(
    null,
  );
  const [activities, setActivities] = useState<TeacherActivity[] | null>(null);
  const [grades, setGrades] = useState<ActivityGrade[] | null>(null);
  const [studentStatistics, setStudentStatistics] =
    useState<StudentStatistics | null>(null);
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
        Number(studentId),
      );
      setStudentStatistics(fetchedStats);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentSubmissions = async () => {
    if (!courseId || !studentId) return;

    setIsLoading(true);
    try {
      const fetchedSubmissions = await getSubmissionsByStudent(
        courseId,
        Number(studentId),
      );
      setSubmissions(fetchedSubmissions);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentGrades = async () => {
    if (!courseId || !studentId) return;
    setIsLoading(true);
    try {
      const fetchedGrades = await getActivitiesGradesByStudent(
        courseId,
        Number(studentId),
      );
      console.log("fetchedGrades", fetchedGrades);
      setGrades(fetchedGrades);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivities = async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const fetchedActivies = await getCourseTeacherActivities(
        courseId,
        ActivitiesOption.ALL,
      );
      setActivities(fetchedActivies);
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
            Number(studentId),
          ),
        ),
        getSubmissionStatistics(
          courseId,
          new SubmissionStatisticsParams(
            startDate,
            endDate,
            ActivitiesOption.EXAMS,
            undefined,
            Number(studentId),
          ),
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
      fetchStudentSubmissions();
      fetchStudentGrades();
      fetchActivities();
    }, [courseId, studentId]),
  );

  useFocusEffect(
    useCallback(() => {
      fetchSubmissionStats();
    }, [startDate, endDate, courseId, studentId]),
  );

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title={
            student
              ? `${student.userInformation.firstName} ${student.userInformation.lastName}`
              : "Calificación del estudiante"
          }
        />
      </Appbar.Header>
      {isLoading ||
      !studentStatistics ||
      !activities ||
      !submissions ||
      !grades ? (
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
                  2,
                )} %`,
                label: "Finalización",
                color: customColors.info,
              },
              {
                icon: "timer-sand",
                value:
                  studentStatistics.avgTimeDifferenceHours !== undefined
                    ? getSimpleRelativeTimeFromNow(
                        new Date(
                          Date.now() +
                            studentStatistics.avgTimeDifferenceHours *
                              60 *
                              60 *
                              1000,
                        ),
                      )
                    : "-",
                label:
                  studentStatistics.avgTimeDifferenceHours === undefined
                    ? "Retraso promedio"
                    : studentStatistics.avgTimeDifferenceHours >= 0
                    ? "Anticipo promedio"
                    : "Retraso promedio",
                color:
                  studentStatistics.avgTimeDifferenceHours === undefined
                    ? customColors.error
                    : studentStatistics.avgTimeDifferenceHours >= 0
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
                value:
                  activities?.filter(
                    (a) => a.activity.type === ActivityType.TASK && a.visible,
                  ).length ?? 0,
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
            data={
              grades
                ?.filter((grade) => grade.type === ActivityType.TASK)
                .map((grade) => {
                  const activity = activities?.find(
                    (a) => a.activity.resourceId === grade.resourceId,
                  );
                  return {
                    label:
                      activity?.activity.activityDetails.title ??
                      `Actividad ${grade.resourceId}`,
                    value: grade.mark,
                  };
                }) ?? []
            }
            title={"Nota por tarea"}
            titleColor={customColors.info}
            barColor={customColors.info}
            displayValue={(value) => value.toFixed(2)}
          />

          {/* HorizontalBarChart de tiempo restante de entrega para tareas - A tiempo */}
          <HorizontalBarChart
            data={submissions
              .filter((submission) => {
                const activity = activities.find(
                  (a) => a.activity.resourceId === submission.resourceId,
                );
                if (
                  activity?.activity.type !== ActivityType.TASK ||
                  !submission.submissionDate
                )
                  return false;
                const dueDate = activity?.activity.activityDetails.dueDate;
                if (!dueDate) return false;
                const due = new Date(dueDate);
                const submitted = new Date(submission.submissionDate);
                return submitted.getTime() <= due.getTime();
              })
              .map((submission) => {
                const activity = activities.find(
                  (a) => a.activity.resourceId === submission.resourceId,
                );
                const dueDate = activity?.activity.activityDetails.dueDate;
                let value = 0;
                if (dueDate && submission.submissionDate) {
                  const due = new Date(dueDate);
                  const submitted = new Date(submission.submissionDate);
                  value =
                    (due.getTime() - submitted.getTime()) / (1000 * 60 * 60); // horas de anticipo
                }
                return {
                  label:
                    activity?.activity.activityDetails.title ??
                    `Actividad ${submission.resourceId}`,
                  value: Math.abs(value),
                };
              })}
            title={"Tiempo restante de entrega por tarea"}
            titleColor={customColors.info}
            barColor={customColors.info}
            displayValue={(value) => {
              // value es positivo aquí, representa cuántas horas antes entregó
              const displayDate = new Date(Date.now() - value * 60 * 60 * 1000);
              return getSimpleRelativeTimeFromNow(displayDate);
            }}
          />

          {/* HorizontalBarChart de tiempo restante de entrega para tareas - Tarde */}
          <HorizontalBarChart
            data={submissions
              .filter((submission) => {
                const activity = activities.find(
                  (a) => a.activity.resourceId === submission.resourceId,
                );
                if (
                  activity?.activity.type !== ActivityType.TASK ||
                  !submission.submissionDate
                )
                  return false;
                const dueDate = activity?.activity.activityDetails.dueDate;
                if (!dueDate) return false;
                const due = new Date(dueDate);
                const submitted = new Date(submission.submissionDate);
                return submitted.getTime() > due.getTime();
              })
              .map((submission) => {
                const activity = activities.find(
                  (a) => a.activity.resourceId === submission.resourceId,
                );
                const dueDate = activity?.activity.activityDetails.dueDate;
                let value = 0;
                if (dueDate && submission.submissionDate) {
                  const due = new Date(dueDate);
                  const submitted = new Date(submission.submissionDate);
                  value =
                    (submitted.getTime() - due.getTime()) / (1000 * 60 * 60); // horas de atraso
                }
                return {
                  label:
                    activity?.activity.activityDetails.title ??
                    `Actividad ${submission.resourceId}`,
                  value: Math.abs(value),
                };
              })}
            title={"Tiempo vencido de entrega por tarea"}
            titleColor={customColors.error}
            barColor={customColors.error}
            displayValue={(value) => {
              // value es positivo aquí, representa cuántas horas después entregó
              const displayDate = new Date(Date.now() - value * 60 * 60 * 1000);
              return getSimpleRelativeTimeFromNow(displayDate);
            }}
          />

          {/* Sección Exámenes */}
          <ListStatCard
            title={"Exámenes"}
            indicators={[
              {
                icon: "file-document-edit",
                value:
                  activities?.filter(
                    (a) => a.activity.type === ActivityType.EXAM && a.visible,
                  ).length ?? 0,
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
            data={
              grades
                ?.filter((grade) => grade.type === ActivityType.EXAM)
                .map((grade) => {
                  const activity = activities?.find(
                    (a) => a.activity.resourceId === grade.resourceId,
                  );
                  return {
                    label:
                      activity?.activity.activityDetails.title ??
                      `Actividad ${grade.resourceId}`,
                    value: grade.mark,
                  };
                }) ?? []
            }
            title={"Nota por exámen"}
            titleColor={theme.colors.primary}
            barColor={theme.colors.primary}
            displayValue={(value) => value.toFixed(2)}
          />

          {/* HorizontalBarChart de tiempo restante de entrega para exámenes - A tiempo */}
          <HorizontalBarChart
            data={submissions
              .filter((submission) => {
                const activity = activities.find(
                  (a) => a.activity.resourceId === submission.resourceId,
                );
                if (
                  activity?.activity.type !== ActivityType.EXAM ||
                  !submission.submissionDate
                )
                  return false;
                const dueDate = activity?.activity.activityDetails.dueDate;
                if (!dueDate) return false;
                const due = new Date(dueDate);
                const submitted = new Date(submission.submissionDate);
                return submitted.getTime() <= due.getTime();
              })
              .map((submission) => {
                const activity = activities.find(
                  (a) => a.activity.resourceId === submission.resourceId,
                );
                const dueDate = activity?.activity.activityDetails.dueDate;
                let value = 0;
                if (dueDate && submission.submissionDate) {
                  const due = new Date(dueDate);
                  const submitted = new Date(submission.submissionDate);
                  value =
                    (due.getTime() - submitted.getTime()) / (1000 * 60 * 60); // horas de anticipo
                }
                return {
                  label:
                    activity?.activity.activityDetails.title ??
                    `Actividad ${submission.resourceId}`,
                  value: Math.abs(value),
                };
              })}
            title={"Tiempo restante de entrega por exámen"}
            titleColor={theme.colors.primary}
            barColor={theme.colors.primary}
            displayValue={(value) => {
              // value es positivo aquí, representa cuántas horas antes entregó
              const displayDate = new Date(Date.now() - value * 60 * 60 * 1000);
              return getSimpleRelativeTimeFromNow(displayDate);
            }}
          />

          {/* HorizontalBarChart de tiempo restante de entrega para exámenes - Tarde */}
          <HorizontalBarChart
            data={submissions
              .filter((submission) => {
                const activity = activities.find(
                  (a) => a.activity.resourceId === submission.resourceId,
                );
                if (
                  activity?.activity.type !== ActivityType.EXAM ||
                  !submission.submissionDate
                )
                  return false;
                const dueDate = activity?.activity.activityDetails.dueDate;
                if (!dueDate) return false;
                const due = new Date(dueDate);
                const submitted = new Date(submission.submissionDate);
                return submitted.getTime() > due.getTime();
              })
              .map((submission) => {
                const activity = activities.find(
                  (a) => a.activity.resourceId === submission.resourceId,
                );
                const dueDate = activity?.activity.activityDetails.dueDate;
                let value = 0;
                if (dueDate && submission.submissionDate) {
                  const due = new Date(dueDate);
                  const submitted = new Date(submission.submissionDate);
                  value =
                    (submitted.getTime() - due.getTime()) / (1000 * 60 * 60); // horas de atraso
                }
                return {
                  label:
                    activity?.activity.activityDetails.title ??
                    `Actividad ${submission.resourceId}`,
                  value: Math.abs(value),
                };
              })}
            title={"Tiempo vencido de entrega por exámen"}
            titleColor={theme.colors.error}
            barColor={theme.colors.error}
            displayValue={(value) => {
              // value es positivo aquí, representa cuántas horas después entregó
              const displayDate = new Date(Date.now() - value * 60 * 60 * 1000);
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
                strokeDasharray: "5",
              },
              {
                label: "Tareas",
                color: customColors.info,
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
        </ScrollView>
      )}
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
}
