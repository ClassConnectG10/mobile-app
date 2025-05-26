import { Course, CourseStatus, UserRole } from "@/types/course";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  useTheme,
  Text,
  Icon,
} from "react-native-paper";
import {
  enrollCourse,
  getCourse,
  getStudentMark,
} from "@/services/courseManagement";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { TextField } from "@/components/forms/TextField";
import CourseCard from "@/components/cards/CourseCard";
import UserCard from "@/components/cards/UserCard";
import { getUser } from "@/services/userManagement";
import { useUserContext } from "@/utils/storage/userContext";
import { formatDate } from "@/utils/date";
import { hasNoSeats, SeatsField } from "@/components/courses/SeatsField";
import {
  CATEGORIES,
  LEVELS,
  MODALITIES,
} from "@/utils/constants/courseDetails";
import { customColors } from "@/utils/constants/colors";
import { AlertText } from "@/components/AlertText";

const MINIMUM_APPROVAL_MARK = 4;

export default function CourseIncriptionDetails() {
  const router = useRouter();
  const theme = useTheme();

  const { courseId: courseIdParam } = useLocalSearchParams();
  const courseId = courseIdParam as string;

  const [errorMessage, setErrorMessage] = useState("");
  const [dependencies, setDependencies] = useState<Course[]>([]);
  const [courseOwner, setCourseOwner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [marks, setMarks] = useState<Record<string, number>>(null);

  const userContext = useUserContext();

  async function fetchCourse() {
    if (!courseId) return;
    setIsLoading(true);

    try {
      const fetchedCourse = await getCourse(courseId);
      setCourse(fetchedCourse);

      const courseDependencies = await Promise.all(
        fetchedCourse.courseDetails.dependencies.map((dependency) =>
          getCourse(dependency),
        ),
      );

      setDependencies(courseDependencies);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setCourse(null);
    }
  }

  async function fetchCourseDependenciesMarks() {
    if (!course) return;
    setIsLoading(true);

    try {
      const courseDependenciesMarks = await Promise.all(
        course.courseDetails.dependencies.map(async (dependency) => {
          const mark = await getStudentMark(dependency, userContext.user?.id);
          return { courseId: dependency, mark };
        }),
      );
      const marks = courseDependenciesMarks.reduce((acc, curr) => {
        acc[curr.courseId] = curr.mark;
        return acc;
      }, {});
      setMarks(marks);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCourseOwner() {
    if (!course) return;
    setIsLoading(true);

    try {
      if (!course) return;
      const courseOwner = await getUser(course.ownerId);
      setCourseOwner(courseOwner);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleEnrollCourse = async () => {
    if (!courseId) return;
    setIsLoading(true);

    try {
      await enrollCourse(courseId as string);
      router.replace({
        pathname: "/courses/[courseId]",
        params: { courseId: courseId, role: UserRole.STUDENT },
      });
    } catch (error) {
      setErrorMessage(
        `Error al inscribirse al curso: ${(error as Error).message}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOwnerPress = () => {
    if (!courseOwner) return;

    router.push({
      pathname: "/users/[userId]",
      params: { userId: courseOwner.id },
    });
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  // TODO: Chequear si esto funciona bien y no spammea a lo loco
  // useFocusEffect(
  //   useCallback(() => {
  //     fetchCourse();
  //   }, [])
  // );

  useFocusEffect(
    useCallback(() => {
      fetchCourseOwner();
      fetchCourseDependenciesMarks();
    }, [course]),
  );

  function hasDependencyApproval(dependency: string) {
    if (!marks) return false;
    const mark = marks[dependency];
    return mark !== null && mark >= MINIMUM_APPROVAL_MARK;
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Detalles de inscripción" />
      </Appbar.Header>
      {isLoading || !course || !courseOwner || !dependencies || !marks ? (
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
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
          {courseOwner && (
            <View style={{ gap: 8 }}>
              <Text variant="titleMedium">Propietario del curso</Text>
              <UserCard user={courseOwner} onPress={handleOwnerPress} />
            </View>
          )}
          <TextField
            label="Nombre del curso"
            value={course.courseDetails.title}
          />
          <TextField
            label="Descripción del curso"
            value={course.courseDetails.description}
          />

          <SeatsField
            seats={course.courseDetails.maxNumberOfStudents}
            students={course.numberOfStudens || 0}
            showAlert={true}
          />

          <TextField
            label="Fecha de inicio"
            value={formatDate(course.courseDetails.startDate)}
          />

          <TextField
            label="Fecha de fin"
            value={formatDate(course.courseDetails.endDate)}
          />

          <TextField
            label="Nivel"
            value={LEVELS.getFrontValue(course.courseDetails.level) || ""}
          />
          <TextField
            label="Modalidad"
            value={
              MODALITIES.getFrontValue(course.courseDetails.modality) || ""
            }
          />
          <TextField
            label="Categoría"
            value={
              CATEGORIES.getFrontValue(course.courseDetails.category) || ""
            }
          />

          {dependencies.length > 0 && (
            <View
              style={{
                borderRadius: 10,
                gap: 10,
              }}
            >
              <Text variant="titleMedium">
                Cursos requeridos para la inscripción:
              </Text>
              <View
                style={{
                  gap: 10,
                }}
              >
                {dependencies.map((dependency) => (
                  <View
                    key={dependency.courseId}
                    style={{
                      flexDirection: "row",
                      gap: 8,
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <CourseCard
                      course={dependency}
                      small={true}
                      onPress={() =>
                        router.push({
                          pathname: `/courses/[courseId]`,
                          params: {
                            courseId: dependency.courseId,
                            role: dependency.currentUserRole,
                          },
                        })
                      }
                      horizontal={true}
                    />
                    <Icon
                      source={
                        hasDependencyApproval(dependency.courseId)
                          ? "check-circle"
                          : "alert-circle"
                      }
                      color={
                        hasDependencyApproval(dependency.courseId)
                          ? customColors.success
                          : theme.colors.error
                      }
                      size={20}
                    />
                  </View>
                ))}
                <Divider />
              </View>
            </View>
          )}

          <Button
            mode="contained"
            icon="notebook-multiple"
            disabled={
              isLoading ||
              course.courseStatus !== CourseStatus.NEW ||
              hasNoSeats(
                course.courseDetails.maxNumberOfStudents,
                course.numberOfStudens || 0,
              ) ||
              course.courseDetails.dependencies.some(
                (dependency) => !hasDependencyApproval(dependency),
              )
            }
            onPress={handleEnrollCourse}
          >
            Inscribirse al curso
          </Button>

          {course.courseStatus !== CourseStatus.NEW && (
            <AlertText
              text="El curso ha comenzado, no puedes inscribirte."
              error={true}
            />
          )}
        </ScrollView>
      )}

      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
