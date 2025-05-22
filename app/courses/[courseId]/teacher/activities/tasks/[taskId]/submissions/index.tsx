import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import SubmissionCard from "@/components/cards/SubmissionCard";
import {
  getExamSubmissions,
  getTaskSubmission,
  getTaskSubmissions,
  getTeacherExam,
  getTeacherTask,
} from "@/services/activityManagement";
import { getUser } from "@/services/userManagement";
import {
  ActivityStatusOption,
  ExamDetails,
  ExamSubmission,
  TaskDetails,
  TaskSubmission,
  TeacherActivity,
} from "@/types/activity";
import { User } from "@/types/user";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  SegmentedButtons,
  Text,
  useTheme,
} from "react-native-paper";

export default function TaskSubmissionsPage() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, taskId: taskIdParam } =
    useLocalSearchParams();

  const courseId = courseIdParam as string;
  const taskId = Number(taskIdParam);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [teacherTask, setTeacherTask] = useState<TeacherActivity | null>(null);
  const [taskSubmissions, setTaskSubmissions] =
    useState<TaskSubmission[]>(null);
  const [filteredSubmissions, setFilteredSubmissions] =
    useState<TaskSubmission[]>(null);
  const [students, setStudents] = useState<Record<number, User>>(null);
  const [taskStatusOption, setTaskStatusOption] = useState(
    ActivityStatusOption.ALL
  );
  async function fetchTeacherTask() {
    if (!courseId || !taskId) return;

    setIsLoading(true);
    try {
      const task = await getTeacherTask(courseId, taskId);
      setTeacherTask(task);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSubmissions() {
    if (!teacherTask) return;
    const taskDetails = teacherTask.activity.activityDetails as TaskDetails;
    setIsLoading(taskSubmissions === null);
    try {
      const fetchedTaskSubmissions = await getTaskSubmissions(courseId, taskId);

      setTaskSubmissions(fetchedTaskSubmissions);
      setFilteredSubmissions(fetchedTaskSubmissions);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchStudents = async () => {
    if (!taskSubmissions) return;
    setIsLoading(students === null);
    try {
      const studentsDict = await Promise.all(
        taskSubmissions.map(async (submission) => {
          const student = await getUser(submission.studentId);
          return { [submission.studentId]: student };
        })
      ).then((studentsArray) =>
        studentsArray.reduce((acc, curr) => ({ ...acc, ...curr }), {})
      );

      setStudents(studentsDict);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchOptionChange = async (value: ActivityStatusOption) => {
    const currentActivityStatusOption =
      taskStatusOption === value ? ActivityStatusOption.ALL : value;

    setTaskStatusOption(currentActivityStatusOption);

    const filteredSubmissions =
      currentActivityStatusOption === ActivityStatusOption.SUBMITTED
        ? taskSubmissions.filter((submission) => submission.submited)
        : currentActivityStatusOption === ActivityStatusOption.PENDING
        ? taskSubmissions.filter((submission) => !submission.submited)
        : taskSubmissions;

    setFilteredSubmissions(filteredSubmissions);
  };

  const handleSelectSubmission = (taskSubmission: TaskSubmission) => {
    router.push({
      pathname:
        "/courses/[courseId]/teacher/activities/tasks/[taskId]/submissions/[studentId]",
      params: {
        courseId,
        taskId,
        studentId: taskSubmission.studentId,
      },
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchSubmissions();
    } finally {
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTeacherTask();
    }, [courseId, taskId])
  );

  useFocusEffect(
    useCallback(() => {
      fetchSubmissions();
    }, [teacherTask])
  );

  useFocusEffect(
    useCallback(() => {
      fetchStudents();
    }, [taskSubmissions])
  );

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Entregas" />
        </Appbar.Header>
        {isLoading || !taskSubmissions || !students || !teacherTask ? (
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
          <View style={{ padding: 16, gap: 16 }}>
            <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
              Entregas
            </Text>
            <Text variant="bodyMedium">
              {
                taskSubmissions.filter((submission) => submission.submited)
                  .length
              }{" "}
              de {taskSubmissions.length} entregas recibidas
            </Text>
            <SegmentedButtons
              value={taskStatusOption}
              onValueChange={(value: ActivityStatusOption) => {
                handleSearchOptionChange(value);
              }}
              buttons={[
                {
                  value: ActivityStatusOption.SUBMITTED,
                  label: "Entregadas",
                  icon: "check-circle-outline",
                  disabled: isLoading,
                },
                {
                  value: ActivityStatusOption.PENDING,
                  label: "No entregadas",
                  icon: "circle-outline",
                  disabled: isLoading,
                },
              ]}
            />
            <FlatList
              style={styles.scrollContainer}
              data={filteredSubmissions}
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              keyExtractor={(item) => item.studentId.toString()}
              renderItem={({ item }) =>
                students[item.studentId] && (
                  <SubmissionCard
                    student={students[item.studentId]}
                    submission={item}
                    onPress={() => handleSelectSubmission(item)}
                  />
                )
              }
              ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            />
          </View>
        )}
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 100,
    gap: 16,
  },
});
