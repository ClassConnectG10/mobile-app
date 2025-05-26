import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { TextField } from "@/components/forms/TextField";
import UserCard from "@/components/cards/UserCard";
import {
  getExamGrade,
  getExamSubmission,
  getTeacherExam,
  gradeExam,
} from "@/services/activityManagement";
import { getUser } from "@/services/userManagement";
import {
  ExamDetails,
  ExamGrade,
  ExamSubmission,
  SubmittedExamItem,
  TeacherActivity,
} from "@/types/activity";
import { User } from "@/types/user";
import { formatDateTime } from "@/utils/date";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  Text,
  useTheme,
} from "react-native-paper";
import { ExamItemCard } from "@/components/cards/examCards/ExamItemCard";
import { ExamItemMode } from "@/components/cards/examCards/examItemMode";
import { AlertText } from "@/components/AlertText";
import { ToggleableNumberInput } from "@/components/forms/ToggleableNumberInput";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { useExamGrade } from "@/hooks/useExamGrade";

export default function GradeExamSubmissionPage() {
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

  const [examGrade, setExamGrade] = useState<ExamGrade | null>(null);

  const temporalExamGradeHook = useExamGrade();
  const temporalExamGrade = temporalExamGradeHook.examGrade;

  async function fetchTeacherExam() {
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

  async function fetchStudentSubmission() {
    if (!teacherActivity) return;
    setIsLoading(true);

    try {
      const submissionData = await getExamSubmission(
        courseId,
        Number(examId),
        Number(studentId),
        (teacherActivity.activity.activityDetails as ExamDetails).examItems
      );
      const correctAnswers = submissionData.submittedExamItems.map(
        (item: SubmittedExamItem) => {
          return item.correct;
        }
      );
      setStudentSubmission(submissionData);
      if (temporalExamGrade.correctExamItems.length === 0) {
        temporalExamGradeHook.setCorrectExamItems(correctAnswers);
      }
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

  async function fetchExamGrade() {
    if (!courseId || !examId || !studentId) return;
    setIsLoading(true);

    try {
      const grade = await getExamGrade(
        courseId,
        Number(examId),
        Number(studentId)
      );
      setExamGrade(grade);
      if (grade) {
        temporalExamGradeHook.setExamGrade(grade);
        temporalExamGradeHook.setCorrectExamItems(grade.correctExamItems);
      } else {
        // temporalExamGradeHook.setCorrectExamItems(originalCorrectAnswers);
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const setCorrectAnswer = (index: number, correct: boolean) => {
    const newCorrectExamItems = [...temporalExamGrade?.correctExamItems];
    newCorrectExamItems[index] = correct;
    temporalExamGradeHook.setCorrectExamItems(newCorrectExamItems);
  };

  const handleSaveGrade = async () => {
    if (!courseId || !examId || !studentId) return;
    setIsLoading(true);
    try {
      await gradeExam(courseId, temporalExamGrade);
      setExamGrade(temporalExamGrade);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentSubmission();
  }, [teacherActivity]);

  useFocusEffect(
    useCallback(() => {
      fetchTeacherExam();
      fetchStudent();

      fetchExamGrade();
    }, [courseId, examId, studentId])
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={"Corrección del examen"} />
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
                <Text>Corrección de las preguntas</Text>
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
                  answerOk={temporalExamGrade.correctExamItems[index]}
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
            ListFooterComponent={
              <View style={{ gap: 16, paddingVertical: 16 }}>
                <Divider />
                <Text>Calificación de la entrega</Text>
                <AlertText text="La entrega no ha sido calificada todavía." />
                <ToggleableNumberInput
                  label="Nota"
                  value={temporalExamGrade.mark}
                  editable={true}
                  onChange={(mark) => temporalExamGradeHook.setMark(mark)}
                  minValue={0}
                  maxValue={10}
                />
                <ToggleableTextInput
                  label="Comentario de retroalimentación"
                  placeholder="Escriba un comentario para el estudiante"
                  value={temporalExamGrade.feedback_message}
                  editable={true}
                  onChange={(feedback) =>
                    temporalExamGradeHook.setFeedbackMessage(feedback)
                  }
                />
                <Button
                  icon="note-check"
                  mode="contained"
                  onPress={() => handleSaveGrade()}
                  disabled={isLoading}
                >
                  Confirmar calificación
                </Button>
              </View>
            }
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
