import { Course, UserRole } from "@/types/course";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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
import { enrollCourse, getCourse } from "@/services/courseManagement";
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
export default function CourseIncriptionDetails() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam } = useLocalSearchParams();
  const courseId = courseIdParam as string;

  const [errorMessage, setErrorMessage] = useState("");
  const [dependencies, setDependencies] = useState<Course[]>([]);
  const [courseOwner, setCourseOwner] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);

  const userContext = useUserContext();

  async function fetchCourse() {
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

  async function fetchCourseOwner() {
    try {
      setIsLoading(true);
      if (!course) return;
      const courseOwner = await getUser(course.ownerId);
      setIsOwner(courseOwner.id === userContext.user?.id);
      setCourseOwner(courseOwner);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleEnrollCourse = async () => {
    try {
      await enrollCourse(courseId as string);
      router.replace({
        pathname: "/courses/[courseId]",
        params: { courseId: courseId },
      });
    } catch (error) {
      setErrorMessage(
        `Error al inscribirse al curso: ${(error as Error).message}`,
      );
    }
  };

  const handleOwnerPress = () => {
    if (courseOwner) {
      if (isOwner) {
        router.push({
          pathname: "/users/me",
        });
      } else {
        router.push({
          pathname: "/users/[userId]",
          params: { userId: courseOwner.id },
        });
      }
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  useEffect(() => {
    if (course) {
      fetchCourseOwner();
    }
  }, [course]);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Detalles de inscripción" />
      </Appbar.Header>
      {isLoading || !course || !courseOwner || !dependencies ? (
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
                      gap: 10,
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <CourseCard
                      name={dependency.courseDetails.title}
                      category={dependency.courseDetails.category}
                      onPress={() =>
                        dependency.currentUserRole === UserRole.NON_PARTICIPANT
                          ? router.push({
                              pathname: `/courses/[courseId]/inscription`,
                              params: { courseId: dependency.courseId },
                            })
                          : router.push({
                              pathname: `/courses/[courseId]`,
                              params: { courseId: dependency.courseId },
                            })
                      }
                    />
                    <Icon
                      source={
                        dependency.currentUserRole !== UserRole.NON_PARTICIPANT
                          ? "check-circle"
                          : "alert-circle"
                      } //TODO: Cambiar por el estado de completado
                      color={
                        dependency.currentUserRole !== UserRole.NON_PARTICIPANT
                          ? theme.colors.primary
                          : theme.colors.error
                      } //TODO: Cambiar por el estado de completado
                      size={30}
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
              hasNoSeats(
                course.courseDetails.maxNumberOfStudents,
                course.numberOfStudens || 0,
              )
            }
            onPress={handleEnrollCourse}
          >
            Inscribirse al curso
          </Button>
        </ScrollView>
      )}

      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
