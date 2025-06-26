import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import {
  autocorrectExam,
  getExamAutocorrection,
  getExamGrade,
  getExamSubmission,
  getTeacherExam,
  gradeExam,
} from "@/services/activityManagement";
import { getUser } from "@/services/userManagement";
import {
  AutocorrectionStatus,
  ExamAutocorrection,
  ExamDetails,
  ExamGrade,
  ExamItemType,
  ExamSubmission,
  SubmittedExamItem,
  TeacherActivity,
} from "@/types/activity";
import { User } from "@/types/user";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
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
import { ListStatCard } from "@/components/ListStatCard";
import { set } from "zod";

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

  const [examAutocorrection, setExamAutocorrection] =
    useState<ExamAutocorrection | null>(null);
  const [autocorrectionStatus, setAutocorrectionStatus] =
    useState<AutocorrectionStatus>(AutocorrectionStatus.NOT_STARTED);
  const [autocorrectionModalVisible, setAutocorrectionModalVisible] =
    useState(false);
  const [autocorrected, setAutocorrected] = useState(false);

  const [isAutocorrecting, setIsAutocorrecting] = useState(false);

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

  const handlePressAutocorrectButton = async () => {
    setIsAutocorrecting(true);
    await handleGetAutocorrection();
    setIsAutocorrecting(false);
    setAutocorrectionModalVisible(true);
  };

  const handleAutocorrect = async () => {
    if (!courseId || !examId || !studentId) return;
    setIsLoading(true);
    setAutocorrectionModalVisible(false);
    try {
      await autocorrectExam(courseId, Number(examId), Number(studentId));
      console.log("Autocorrection started");
      setAutocorrectionStatus(AutocorrectionStatus.IN_PROGRESS);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setAutocorrectionStatus(AutocorrectionStatus.FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAutocorrection = async () => {
    if (!courseId || !examId || !studentId) return;
    // setIsLoading(true);
    try {
      const fetchedAutocorrection = await getExamAutocorrection(
        courseId,
        Number(examId),
        Number(studentId)
      );
      setExamAutocorrection(fetchedAutocorrection);
      setAutocorrectionStatus(fetchedAutocorrection.status);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setAutocorrectionStatus(AutocorrectionStatus.FAILED);
    } finally {
      // setIsLoading(false);
    }
  };

  const handleApplyAutocorrection = () => {
    if (!examAutocorrection) return;
    setAutocorrected(true);
    console.log("Applying autocorrection:", examAutocorrection);
    console.log("Mark:", examAutocorrection.mark);

    // Definir la variable examGrade como una copia de temporalExamGrade.
    // Luego, cambiar los valores de examGrade.mark y examGrade.feedback_message
    // por los correspondientes valores de examAutocorrection.mark y
    // examAutocorrection.feedback_message.
    // Finalmente, cambiar los valores de examGrade.correctExamItems por los
    // correspondientes valores de examAutocorrection.correctedExamItems.

    let examGrade = { ...temporalExamGrade } as ExamGrade;
    examGrade.mark = examAutocorrection.mark;
    examGrade.feedback_message = examAutocorrection.feedback_message;

    // Hacer una copia del arreglo temporalExamGrade.correctExamItems. En la
    // copia, cambiar todos los valores asociados a una pregunta abierta por el
    // correspondiente valor de examAutocorrection.correctExamItems.
    const examItems = (teacherActivity.activity.activityDetails as ExamDetails)
      .examItems;
    examAutocorrection.correctedExamItems.forEach(
      (correctedExamItem, index) => {
        if (examItems[index].type === ExamItemType.OPEN) {
          examGrade.correctExamItems[index] = correctedExamItem.correct;
        }
      }
    );

    temporalExamGradeHook.setExamGrade(examGrade);
    setAutocorrectionStatus(AutocorrectionStatus.COMPLETED);
    setAutocorrectionModalVisible(false);
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

  useEffect(() => {
    if (examAutocorrection) {
      temporalExamGradeHook.setMark(examAutocorrection.mark);
    }
  }, [examAutocorrection]);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={"Corrección del examen"} />
        <Appbar.Action
          icon={
            isAutocorrecting
              ? () => (
                  <ActivityIndicator
                    animating={true}
                    size={24}
                    color={theme.colors.primary}
                  />
                )
              : "robot"
          }
          onPress={async () => {
            if (!isAutocorrecting) {
              setIsAutocorrecting(true);
              await handlePressAutocorrectButton();
              setIsAutocorrecting(false);
            }
          }}
          disabled={isAutocorrecting}
        />
        <Appbar.Action
          icon="help-circle"
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
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={16} // Ajusta este valor según la altura de tu Appbar/Header
        >
          <ScrollView
            contentContainerStyle={{ padding: 16, flexGrow: 1, gap: 8 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ gap: 16 }}>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 18,
                  paddingBottom: 8,
                }}
              >
                Corrección de las preguntas
              </Text>
            </View>
            {(
              teacherActivity.activity.activityDetails as ExamDetails
            ).examItems.map((item, index) =>
              examSubmission.submited ? (
                <View key={index} style={{ marginBottom: 8 }}>
                  <ExamItemCard
                    mode={ExamItemMode.REVIEW}
                    examItem={item}
                    studentAnswer={
                      (examSubmission as ExamSubmission).submittedExamItems[
                        index
                      ].answer
                    }
                    setStudentAnswer={() => {}}
                    answerOk={temporalExamGrade.correctExamItems[index]}
                    setAnswerOk={(correct) => setCorrectAnswer(index, correct)}
                    autocorrected={autocorrected}
                    setAutocorrected={setAutocorrected}
                  />
                </View>
              ) : null
            )}
            <View style={{ gap: 16, paddingVertical: 16 }}>
              <Divider />
              <ListStatCard
                title="Calificación de la entrega"
                indicators={[
                  {
                    icon: "check-circle",
                    value: temporalExamGrade.correctExamItems.filter(
                      (item) => item
                    ).length,
                    label: "Correctas",
                    color: customColors.success,
                  },
                  {
                    icon: "help-circle",
                    value: temporalExamGrade.correctExamItems.length,
                    label: "Total",
                    color: theme.colors.primary,
                  },
                  {
                    icon: "star",
                    value: Math.round(
                      (temporalExamGrade.correctExamItems.filter(
                        (item) => item === true
                      ).length /
                        temporalExamGrade.correctExamItems.length) *
                        10
                    ),
                    label: "Nota sugerida",
                    color: customColors.warning,
                  },
                ]}
              />

              <Divider />

              {!hasPreviousGrade && (
                <AlertText text="La entrega no ha sido calificada todavía." />
              )}

              {autocorrected && (
                <AlertText text="Corrección realizada por IA." />
              )}

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
              <Divider />
              <Button
                icon="note-check"
                mode="contained"
                onPress={() => handleSaveGrade()}
                disabled={isLoading}
              >
                Confirmar calificación
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
      <FullScreenModal
        visible={helpModalVisible}
        onDismiss={() => setHelpModalVisible(false)}
        children={
          <View style={{ gap: 16 }}>
            <Text variant="titleMedium">Íconos y código de colores</Text>
            <View>
              <Text>
                Cada pregunta tiene arriba a la derecha un ícono que indica si
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
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <Button mode="text" onPress={() => setHelpModalVisible(false)}>
                OK
              </Button>
            </View>
          </View>
        }
      />
      <FullScreenModal
        visible={autocorrectionModalVisible}
        onDismiss={() => setAutocorrectionModalVisible(false)}
      >
        <View style={{ gap: 16 }}>
          <Text variant="titleLarge">Estado de la autocorrección</Text>
          {autocorrectionStatus === AutocorrectionStatus.NOT_STARTED && (
            <View style={{ gap: 16 }}>
              <Text>
                ¿Desea corregir el examen automáticamente con Inteligencia
                Artificial?
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 8,
                }}
              >
                <Button
                  mode="text"
                  onPress={() => setAutocorrectionModalVisible(false)}
                >
                  Cancelar
                </Button>
                <Button mode="text" onPress={() => handleAutocorrect()}>
                  Aceptar
                </Button>
              </View>
            </View>
          )}
          {autocorrectionStatus === AutocorrectionStatus.IN_PROGRESS && (
            <View style={{ alignItems: "center", gap: 16 }}>
              <Text>
                La corrección se está realizando de forma automática. Puede
                salir de esta pantalla mientras tanto.
              </Text>
              <ActivityIndicator animating={true} size="large" />
              <Button
                mode="text"
                onPress={() => setAutocorrectionModalVisible(false)}
              >
                Aceptar
              </Button>
            </View>
          )}
          {autocorrectionStatus === AutocorrectionStatus.COMPLETED && (
            <View style={{ gap: 16 }}>
              <Text>
                El examen se ha corregido exitosamente. Pulse el botón 'Aceptar'
                para traer esos datos. NOTA: esto pisará las correcciones hechas
                manualmente.
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 8,
                }}
              >
                <Button
                  mode="text"
                  onPress={() => {
                    // Acción para descartar corrección
                    setAutocorrectionModalVisible(false);
                  }}
                >
                  Descartar
                </Button>
                <Button
                  mode="text"
                  onPress={() => {
                    // Acción para aceptar corrección
                    handleApplyAutocorrection();
                  }}
                >
                  Aceptar
                </Button>
              </View>
            </View>
          )}
          {autocorrectionStatus === AutocorrectionStatus.FAILED && (
            <View style={{ alignItems: "center", gap: 16 }}>
              <Text>
                Hubo un error al corregir automáticamente el examen. Intente
                nuevamente.
              </Text>
              <Button
                mode="text"
                onPress={() => setAutocorrectionModalVisible(false)}
              >
                Aceptar
              </Button>
            </View>
          )}
        </View>
      </FullScreenModal>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
