import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { TextField } from "@/components/forms/TextField";
import UserCard from "@/components/cards/UserCard";
import {
  getExamSubmission,
  getTeacherExam,
} from "@/services/activityManagement";
import { getUser } from "@/services/userManagement";
import { ExamDetails, ExamSubmission, TeacherActivity } from "@/types/activity";
import { User } from "@/types/user";
import { formatDateTime } from "@/utils/date";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, View } from "react-native";
import { ActivityIndicator, Appbar, Text, useTheme } from "react-native-paper";
import { ExamItemCard } from "@/components/cards/examCards/ExamItemCard";
import { ExamItemMode } from "@/components/cards/examCards/examItemMode";

export default function TeacherSubmissionPage() {
  const theme = useTheme();
  const router = useRouter();
  const {
    courseId: courseIdParam,
    examId: examIdParam,
    studentId: studentIdParam,
  } = useLocalSearchParams();

  const courseId = courseIdParam as string;
  const examId = examIdParam as string;
  const studentId = studentIdParam as string;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [teacherActivity, setTeacherActivity] =
    useState<TeacherActivity | null>(null);
  const [examSubmission, setStudentSubmission] =
    useState<ExamSubmission | null>(null);
  const [student, setStudent] = useState<User | null>(null);

  async function fetchTeacherActivity() {
    if (!courseId || !examId || !studentId) return;

    setIsLoading(true);
    try {
      const activity = await getTeacherExam(courseId, Number(examId));
      setTeacherActivity(activity);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSubmission() {
    if (!teacherActivity) return;

    setIsLoading(true);
    try {
      const submissionData = await getExamSubmission(
        courseId,
        Number(examId),
        Number(studentId),
        (teacherActivity.activity.activityDetails as ExamDetails).examItems
      );
      setStudentSubmission(submissionData);
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
      const studentData = await getUser(Number(studentId));
      setStudent(studentData);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleStudentPress = () => {
    router.push({
      pathname: `/users/[userId]`,
      params: {
        userId: studentId,
      },
    });
  };

  const setCorrectAnswer = (index: number, correct: boolean) => {
    const newSubmittedExamItems = [...examSubmission.submittedExamItems];
    newSubmittedExamItems[index] = {
      ...newSubmittedExamItems[index],
      correct,
    };
    const newExamSubmission = {
      ...examSubmission,
      submittedExamItems: newSubmittedExamItems,
    };
    setStudentSubmission(newExamSubmission);
  };

  useFocusEffect(
    useCallback(() => {
      fetchSubmission();
    }, [teacherActivity])
  );

  useFocusEffect(
    useCallback(() => {
      fetchTeacherActivity();
      fetchStudent();
    }, [courseId, examId, studentId])
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={"Entrega del examen"} />
      </Appbar.Header>
      {isLoading || !teacherActivity || !examSubmission || !student ? (
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
        <View style={{ padding: 16, flex: 1 }}>
          <FlatList
            data={
              (teacherActivity.activity.activityDetails as ExamDetails)
                .examItems
            }
            keyExtractor={(_item, index) => index.toString()}
            ListHeaderComponent={
              <View style={{ gap: 16, paddingBottom: 16 }}>
                <UserCard user={student} onPress={handleStudentPress} />

                <TextField
                  label="Título"
                  value={teacherActivity.activity.activityDetails.title}
                />
                {examSubmission && examSubmission.submited ? (
                  <>
                    <TextField
                      label="Fecha de entrega"
                      value={formatDateTime(examSubmission.submissionDate)}
                    />
                  </>
                ) : (
                  <Text variant="titleSmall">
                    El alumno no entregó el examen
                  </Text>
                )}
              </View>
            }
            renderItem={({ item, index }) =>
              examSubmission.submited ? (
                <ExamItemCard
                  mode={ExamItemMode.REVIEW}
                  examItem={item}
                  studentAnswer={
                    (examSubmission as ExamSubmission).submittedExamItems[index]
                      .answer
                  }
                  setStudentAnswer={() => {}}
                  answerOk={
                    (examSubmission as ExamSubmission).submittedExamItems[index]
                      .correct
                  }
                  setAnswerOk={(correct) => setCorrectAnswer(index, correct)}
                />
              ) : null
            }
            ItemSeparatorComponent={() => (
              <View
                style={{
                  height: 8,
                }}
              />
            )}
          />
        </View>
      )}
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
