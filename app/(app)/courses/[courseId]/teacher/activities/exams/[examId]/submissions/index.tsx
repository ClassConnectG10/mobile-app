import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import SubmissionCard from "@/components/cards/SubmissionCard";
import {
  getExamSubmissions,
  getTeacherExam,
} from "@/services/activityManagement";
import { getBulkUsers } from "@/services/userManagement";
import {
  ActivityStatusOption,
  ExamDetails,
  ExamSubmission,
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

export default function ExamSubmissionsPage() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, examId: examIdParam } =
    useLocalSearchParams();

  const courseId = courseIdParam as string;
  const examId = Number(examIdParam);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [teacherActivity, setTeacherActivity] =
    useState<TeacherActivity | null>(null);
  const [examSubmissions, setExamSubmissions] =
    useState<ExamSubmission[]>(null);
  const [filteredSubmissions, setFilteredSubmissions] =
    useState<ExamSubmission[]>(null);
  const [students, setStudents] = useState<Record<number, User>>(null);
  const [activityStatusOption, setActivityStatusOption] = useState(
    ActivityStatusOption.ALL
  );
  async function fetchTeacherActivity() {
    if (!courseId || !examId) return;

    setIsLoading(true);
    try {
      const activity = await getTeacherExam(courseId, examId);
      setTeacherActivity(activity);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSubmissions() {
    if (!teacherActivity) return;
    const examDetails = teacherActivity.activity.activityDetails as ExamDetails;
    const examItems = examDetails.examItems;
    setIsLoading(examSubmissions === null);
    try {
      const fetchedExamSubmissions = await getExamSubmissions(
        courseId,
        examId,
        examItems
      );

      setExamSubmissions(fetchedExamSubmissions);
      setFilteredSubmissions(fetchedExamSubmissions);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchStudents = async () => {
    if (!examSubmissions) return;
    setIsLoading(students === null);
    try {
      const studentIds = examSubmissions.map(submission => submission.studentId);
      const studentsArray = await getBulkUsers(studentIds);

      const studentsDict = studentsArray.reduce((acc, student) => {
        acc[student.id] = student;
        return acc;
      }, {} as Record<number, User>);

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
        ? examSubmissions.filter((submission) => submission.submited)
        : currentActivityStatusOption === ActivityStatusOption.PENDING
          ? examSubmissions.filter((submission) => !submission.submited)
          : examSubmissions;

    setFilteredSubmissions(filteredSubmissions);
  };

  const handleSelectSubmission = (examSubmission: ExamSubmission) => {
    router.push({
      pathname:
        "/courses/[courseId]/teacher/activities/exams/[examId]/submissions/[studentId]",
      params: {
        courseId,
        examId,
        studentId: examSubmission.studentId,
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
    }, [courseId, examId])
  );

  useFocusEffect(
    useCallback(() => {
      fetchSubmissions();
    }, [teacherActivity])
  );

  useFocusEffect(
    useCallback(() => {
      fetchStudents();
    }, [examSubmissions])
  );

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Entregas" />
        </Appbar.Header>
        {isLoading || !examSubmissions || !students || !teacherActivity ? (
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
                examSubmissions.filter((submission) => submission.submited)
                  .length
              }{" "}
              de {examSubmissions.length} entregas recibidas
            </Text>
            <SegmentedButtons
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
