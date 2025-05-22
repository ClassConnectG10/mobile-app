import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import UserCard from "@/components/cards/UserCard";
import { getUser } from "@/services/userManagement";
import { User } from "@/types/user";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  useTheme,
} from "react-native-paper";
import { getStudentMark, setStudentMark } from "@/services/courseManagement";
import { ToggleableNumberInput } from "@/components/forms/ToggleableNumberInput";
import { AlertDialog } from "@/components/AlertDialog";
import { AlertText } from "@/components/AlertText";

const MAX_MARK = 10;
const DEFAULT_MARK = 4;

export default function TeacherSubmissionPage() {
  const theme = useTheme();
  const router = useRouter();
  const { courseId: courseIdParam, studentId: studentIdParam } =
    useLocalSearchParams();

  const courseId = courseIdParam as string;
  const studentId = studentIdParam as string;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [student, setStudent] = useState<User | null>(null);
  const [mark, setMark] = useState<number | null>(null);
  const [temporaryMark, setTemporaryMark] = useState<number>(DEFAULT_MARK);
  const [
    showConfirmationUpdateMarkDialog,
    setShowConfirmationUpdateMarkDialog,
  ] = useState(false);

  async function fetchMark() {
    if (!courseId || !studentId) return;
    setIsLoading(true);

    try {
      const fetchedMark = await getStudentMark(courseId, Number(studentId));
      setMark(fetchedMark);
      if (fetchedMark !== null) {
        setTemporaryMark(fetchedMark);
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

  const handleStudentPress = () => {
    router.push({
      pathname: `/users/[userId]`,
      params: {
        userId: studentId,
      },
    });
  };

  // TODO: Solucionar el botón de actividades del alumno
  // const handleStudentActivityPress = () => {
  //   router.push({
  //     pathname: `/courses/[courseId]/teacher/activities/[studentId]`,
  //     params: {
  //       courseId,
  //       studentId,
  //     },
  //   });
  // };

  const handleSaveMark = async () => {
    if (!courseId || !studentId) return;
    setIsLoading(true);

    try {
      await setStudentMark(courseId, Number(studentId), temporaryMark);
      setMark(temporaryMark);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStudent();
      fetchMark();
    }, [courseId, studentId])
  );

  return (
    <>
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
        {!student ? (
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
          <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
            <UserCard user={student} onPress={handleStudentPress} />

            {/* <Button
              icon="check-circle-outline"
              mode="outlined"
              onPress={handleStudentActivityPress}
              disabled={isLoading}
            >
              Ver actividades de {student.userInformation.firstName}{" "}
              {student.userInformation.lastName}
            </Button> */}

            <ToggleableNumberInput
              label="Calificación"
              value={temporaryMark}
              onChange={(mark) => setTemporaryMark(mark)}
              maxValue={MAX_MARK}
            />

            {mark == null && (
              <AlertText text="El estudiante no tiene una calificación asignada." />
            )}

            <Button
              icon="content-save"
              mode="contained"
              onPress={() => setShowConfirmationUpdateMarkDialog(true)}
              disabled={isLoading}
            >
              Guardar calificación
            </Button>
          </ScrollView>
        )}
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
      <AlertDialog
        visible={showConfirmationUpdateMarkDialog}
        onDismiss={() => setShowConfirmationUpdateMarkDialog(false)}
        onConfirm={async () => {
          await handleSaveMark();
          setShowConfirmationUpdateMarkDialog(false);
        }}
        content={`¿Estás seguro de que deseas actualizar la calificación de ${student?.userInformation.firstName} ${student?.userInformation.lastName} a ${temporaryMark}?`}
        dismissText="Cancelar"
        confirmText="Actualizar"
      />
    </>
  );
}
