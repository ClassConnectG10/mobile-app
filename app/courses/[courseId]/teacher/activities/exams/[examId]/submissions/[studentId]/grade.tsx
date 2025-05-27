import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
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
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  Icon,
  Text,
  useTheme,
} from "react-native-paper";
import { ExamItemCard } from "@/components/cards/examCards/ExamItemCard";
import { ExamItemMode } from "@/components/cards/examCards/examItemMode";
import { AlertText } from "@/components/AlertText";
import { ToggleableNumberInput } from "@/components/forms/ToggleableNumberInput";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { useExamGrade } from "@/hooks/useExamGrade";
import { customColors } from "@/utils/constants/colors";
import { FullScreenModal } from "@/components/FullScreenModal";

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

  const [hasPreviousGrade, setHasPreviousGrade] = useState(false);

  const [helpModalVisible, setHelpModalVisible] = useState(false);

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

  async function fetchExamGrade() {
    if (!courseId || !examId || !studentId || !examSubmission) return;
    setIsLoading(true);

    try {
      const grade = await getExamGrade(
        courseId,
        Number(examId),
        Number(studentId)
      );
      if (grade) {
        temporalExamGradeHook.setExamGrade(grade);
        setHasPreviousGrade(true);
      } else {
        const correctAnswers = examSubmission.submittedExamItems.map(
          (item: SubmittedExamItem) => {
            return item.correct;
          }
        );

        temporalExamGradeHook.setExamGrade(
          new ExamGrade(
            Number(examId),
            Number(studentId),
            0,
            "",
            correctAnswers
          )
        );
        setHasPreviousGrade(false);
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
      const newGrade = temporalExamGrade;
      newGrade.studentId = Number(studentId);
      newGrade.resourceId = Number(examId);
      await gradeExam(courseId, newGrade);
      router.back();
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStudent();
      fetchTeacherExam();
      setStudentSubmission(null);
      temporalExamGradeHook.setExamGrade(null);
      setHasPreviousGrade(false);
    }, [courseId, examId, studentId])
  );

  useEffect(() => {
    if (teacherActivity) {
      fetchStudentSubmission();
    }
  }, [teacherActivity]);

  useEffect(() => {
    if (examSubmission) {
      fetchExamGrade();
    }
  }, [examSubmission]);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={"Corrección del examen"} />
        <Appbar.Action
          icon="help"
          onPress={() => setHelpModalVisible(true)}
          disabled={isLoading}
        />
      </Appbar.Header>
      {isLoading ||
      !teacherActivity ||
      !examSubmission ||
      !student ||
      !temporalExamGrade ? (
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
                <Text variant="titleMedium">Corrección de las preguntas</Text>
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
                <Text variant="titleLarge">Calificación de la entrega</Text>
                {!hasPreviousGrade && (
                  <AlertText text="La entrega no ha sido calificada todavía." />
                )}
                {/* Quiero un Text que indique la cantidad de items en true en temporalExamGrade.correctExamItems */}
                <Text variant="bodyMedium">
                  Preguntas correctas:{" "}
                  {
                    temporalExamGrade.correctExamItems.filter(
                      (item) => item === true
                    ).length
                  }{" "}
                  de {temporalExamGrade.correctExamItems.length} preguntas.
                </Text>

                <Text variant="bodyMedium">
                  Nota sugerida:{" "}
                  {Math.round(
                    (temporalExamGrade.correctExamItems.filter(
                      (item) => item === true
                    ).length /
                      temporalExamGrade.correctExamItems.length) *
                      10
                  )}{" "}
                </Text>

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
      <FullScreenModal
        visible={helpModalVisible}
        onDismiss={() => setHelpModalVisible(false)}
        children={
          <View style={{ gap: 16, paddingBottom: 16 }}>
            <Text variant="titleMedium">Íconos y código de colores</Text>
            <View>
              <Text>
                Cada pregunta tiene arriba a la izquierda un ícono que indica si
                el estudiante la respondió correctamente o no:
              </Text>
              <View style={{ marginVertical: 16, gap: 8 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Icon
                    source="check-circle-outline"
                    size={24}
                    color={customColors.success}
                  />
                  <Text>Pregunta respondida correctamente</Text>
                </View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Icon
                    source="close-circle-outline"
                    size={24}
                    color={customColors.error}
                  />
                  <Text>Pregunta respondida incorrectamente</Text>
                </View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Icon
                    source="help-circle-outline"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text>
                    Pregunta abierta sin calificar. Presione el ícono para
                    marcarla como correcta o incorrecta.
                  </Text>
                </View>
              </View>

              <Text>En las preguntas con opciones:</Text>
              <View style={{ marginLeft: 16 }}>
                <Text>
                  {"\u2022"} En{" "}
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: customColors.success,
                    }}
                  >
                    verde
                  </Text>
                  : opciones correctas seleccionadas por el estudiante
                </Text>
                <Text>
                  {"\u2022"} En{" "}
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: customColors.error,
                    }}
                  >
                    rojo
                  </Text>
                  : opciones incorrectas seleccionadas por el estudiante
                </Text>
                <Text>
                  {"\u2022"} En{" "}
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: theme.colors.primary,
                    }}
                  >
                    violeta
                  </Text>
                  : opciones correctas no seleccionadas por el estudiante
                </Text>
              </View>
            </View>
            <Button mode="outlined" onPress={() => setHelpModalVisible(false)}>
              OK
            </Button>
          </View>
        }
      />
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
