import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import SubmissionCard from "@/components/cards/SubmissionCard";
import {
  getActivitySubmissions,
  getTeacherActivity,
} from "@/services/activityManagement";
import { getUser } from "@/services/userManagement";
import {
  ActivityStatusOption,
  ActivitySubmission,
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
} from "react-native-paper";

export default function TeacherSubmissionsPage() {
  const router = useRouter();
  const { courseId: courseIdParam, activityId: activityIdParam } =
    useLocalSearchParams();

  const courseId = courseIdParam as string;
  const activityId = activityIdParam as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [teacherActivity, setTeacherActivity] =
    useState<TeacherActivity | null>(null);
  const [studentSubmissions, setStudentSubmissions] =
    useState<ActivitySubmission[]>(null);
  const [filteredSubmissions, setFilteredSubmissions] =
    useState<ActivitySubmission[]>(null);
  const [students, setStudents] = useState<Record<number, User>>(null);
  const [activityStatusOption, setActivityStatusOption] = useState(
    ActivityStatusOption.ALL
  );
  async function fetchTeacherActivity() {
    if (!courseId || !activityId) return;

    setIsLoading(true);
    try {
      const activity = await getTeacherActivity(courseId, Number(activityId));
      setTeacherActivity(activity);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSubmissions() {
    if (!teacherActivity) return;

    setIsLoading(true);
    try {
      const submittedActivies = await getActivitySubmissions(
        courseId,
        teacherActivity.activity
      );

      setStudentSubmissions(submittedActivies);
      setFilteredSubmissions(submittedActivies);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchStudents = async () => {
    if (!studentSubmissions) return;

    setIsLoading(true);
    try {
      const studentsDict = await Promise.all(
        studentSubmissions.map(async (submission) => {
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

  const handleSelectSubmission = (submission: ActivitySubmission) => {
    router.push({
      pathname:
        "/courses/[courseId]/teacher/activities/[activityId]/submissions/[studentId]",
      params: {
        courseId,
        activityId,
        studentId: submission.studentId,
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
      fetchTeacherActivity();
    }, [courseId, activityId])
  );

  useFocusEffect(
    useCallback(() => {
      fetchSubmissions();
    }, [teacherActivity])
  );

  useFocusEffect(
    useCallback(() => {
      fetchStudents();
    }, [studentSubmissions])
  );

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Entregas" />
        </Appbar.Header>
        {isLoading || !studentSubmissions || !students || !teacherActivity ? (
          <ActivityIndicator
            animating={true}
            size="large"
            style={{ marginTop: 20 }}
          />
        ) : (
          <View style={{ padding: 16, gap: 16 }}>
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
              value={activityStatusOption}
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
              keyExtractor={(item) => item.resourceId.toString()}
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
