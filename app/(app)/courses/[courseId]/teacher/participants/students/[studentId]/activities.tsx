import SubmissionCard from "@/components/cards/SubmissionCard";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import {
  getCourseTeacherActivities,
  getSubmissionsByStudent,
} from "@/services/activityManagement";
import { getUser } from "@/services/userManagement";
import {
  ActivitiesOption,
  ActivityStatusOption,
  ActivitySubmission,
  ActivityType,
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
  useTheme,
  Text,
} from "react-native-paper";

export default function StudentSubmissionsPage() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, studentId: studentIdParam } =
    useLocalSearchParams();

  const courseId = courseIdParam as string;
  const studentId = Number(studentIdParam);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [student, setStudent] = useState<User>(null);
  const [studentSubmissions, setStudentSubmissions] =
    useState<ActivitySubmission[]>(null);
  const [filteredSubmissions, setFilteredSubmissions] =
    useState<ActivitySubmission[]>(null);
  const [activityStatusOption, setActivityStatusOption] = useState(
    ActivityStatusOption.ALL
  );
  const [teacherActivities, setTeacherActivities] =
    useState<Record<number, TeacherActivity>>(null);

  async function fetchTeacherActivities() {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const activities = await getCourseTeacherActivities(
        courseId,
        ActivitiesOption.ALL
      );
      const activitiesByResourceId: Record<number, TeacherActivity> = {};
      activities.forEach((activity) => {
        activitiesByResourceId[activity.activity.resourceId] = activity;
      });
      setTeacherActivities(activitiesByResourceId);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSubmissionsByStudent() {
    if (!courseId || !studentId) return;

    setIsLoading(true);
    try {
      const submissions = await getSubmissionsByStudent(courseId, studentId);
      setStudentSubmissions(submissions);
      setFilteredSubmissions(submissions);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchStudent() {
    if (!studentId) return;

    setIsLoading(true);
    try {
      const fetchedStudent = await getUser(studentId);
      setStudent(fetchedStudent);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSearchOptionChange = async (value: ActivityStatusOption) => {
    const currentActivityStatusOption =
      activityStatusOption === value ? ActivityStatusOption.ALL : value;

    setActivityStatusOption(currentActivityStatusOption);

    const filteredSubmissions =
      currentActivityStatusOption === ActivityStatusOption.SUBMITTED
        ? studentSubmissions.filter((submission) => submission.submited)
        : currentActivityStatusOption === ActivityStatusOption.PENDING
        ? studentSubmissions.filter((submission) => !submission.submited)
        : studentSubmissions;

    setFilteredSubmissions(filteredSubmissions);
  };

  const handleSelectSubmission = (activitySubmission: ActivitySubmission) => {
    if (activitySubmission.type === ActivityType.TASK) {
      router.push({
        pathname:
          "/courses/[courseId]/teacher/activities/tasks/[taskId]/submissions/[studentId]",
        params: {
          courseId,
          taskId: activitySubmission.resourceId,
          studentId,
        },
      });
    } else if (activitySubmission.type === ActivityType.EXAM) {
      router.push({
        pathname:
          "/courses/[courseId]/teacher/activities/exams/[examId]/submissions/[studentId]",
        params: {
          courseId,
          examId: activitySubmission.resourceId,
          studentId,
        },
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchSubmissionsByStudent();
    } finally {
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStudent();
      fetchSubmissionsByStudent();
      fetchTeacherActivities();
    }, [courseId, studentId])
  );

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Entregas" />
        </Appbar.Header>
        {isLoading || !studentSubmissions || !student || !teacherActivities ? (
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
          <View style={{ padding: 16, gap: 16, flex: 1 }}>
            <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
              Entregas
            </Text>
            <Text variant="bodyMedium">
              {
                studentSubmissions.filter((submission) => submission.submited)
                  .length
              }{" "}
              de {studentSubmissions.length} entregas recibidas
            </Text>
            <SegmentedButtons
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 100,
              }}
              value={activityStatusOption}
              onValueChange={(value: ActivityStatusOption) => {
                handleSearchOptionChange(value);
              }}
              buttons={[
                {
                  value: ActivityStatusOption.SUBMITTED,
                  label: "Entregados",
                  icon: "check-circle-outline",
                  disabled: isLoading,
                },
                {
                  value: ActivityStatusOption.PENDING,
                  label: "No entregados",
                  icon: "circle-outline",
                  disabled: isLoading,
                },
              ]}
            />
            <FlatList
              contentContainerStyle={styles.scrollContainer}
              data={filteredSubmissions}
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              keyExtractor={(item) => item.resourceId.toString()}
              renderItem={({ item }) => (
                <SubmissionCard
                  student={student}
                  submission={item}
                  onPress={() => handleSelectSubmission(item)}
                  viewActivityMode={true}
                  activity={teacherActivities[item.resourceId]}
                />
              )}
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
    gap: 16,
  },
});
