import { Course } from "@/types/course";
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
import { TextField } from "@/components/TextField";
import CourseCard from "@/components/CourseCard";
import { useCourseContext } from "@/utils/storage/courseContext";
import UserCard from "@/components/UserCard";
import { getUser } from "@/services/userManagement";
import { useUserContext } from "@/utils/storage/userContext";
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
      const course = await getCourse(courseId as string);
      setCourse(course);

      const courseDependencies = await Promise.all(
        course.courseDetails.dependencies.map((dependency) =>
          getCourse(dependency)
        )
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
      setIsOwner(courseOwner.id == userContext.user?.id);
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
      setErrorMessage((error as Error).message);
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
    <View>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Detalles de inscripción" />
      </Appbar.Header>
      {course === null ? (
        <ActivityIndicator
          animating={true}
          size="large"
          color={theme.colors.primary}
        />
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
          <TextField
            label="Cantidad máxima de estudiantes"
            value={course.courseDetails.maxNumberOfStudents}
          />
          <TextField
            label="Fecha de inicio"
            value={course.courseDetails.startDate.toLocaleDateString()}
          />

          <TextField
            label="Fecha de fin"
            value={course.courseDetails.endDate.toLocaleDateString()}
          />

          <TextField label="Nivel" value={course.courseDetails.level} />
          <TextField label="Modalidad" value={course.courseDetails.modality} />

          <TextField label="Categoría" value={course.courseDetails.category} />

          {dependencies.length > 0 && (
            <View
              style={{
                padding: 10,
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
                      onPress={() => {
                        router.push({
                          pathname: "/courses/[courseId]",
                          params: { courseId: dependency.courseId },
                        });
                      }}
                    />
                    <Icon
                      source={true ? "check-circle" : "alert-circle"} //TODO: Cambiar por el estado de completado
                      color={true ? theme.colors.primary : theme.colors.error} //TODO: Cambiar por el estado de completado
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
            onPress={() => {
              handleEnrollCourse();
            }}
          >
            Inscribirse al curso
          </Button>
        </ScrollView>
      )}

      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
}
