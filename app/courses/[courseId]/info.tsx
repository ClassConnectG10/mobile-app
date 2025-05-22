import { View, ScrollView } from "react-native";
import {
  Appbar,
  Button,
  IconButton,
  Text,
  useTheme,
  Dialog,
  ActivityIndicator,
} from "react-native-paper";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import OptionPicker from "@/components/forms/OptionPicker";
import {
  LEVELS,
  MODALITIES,
  CATEGORIES,
} from "@/utils/constants/courseDetails";
import { useCourseDetails } from "@/hooks/useCourseDetails";
import { DatePickerButton } from "@/components/forms/DatePickerButton";
import { useRequiredCoursesContext } from "@/utils/storage/requiredCoursesContext";
import CourseCard from "@/components/cards/CourseCard";
import { useCourseContext } from "@/utils/storage/courseContext";
import { useCallback, useEffect, useState } from "react";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import {
  deleteCourse,
  editCourse,
  getCourse,
  startCourse,
} from "@/services/courseManagement";
import { ToggleableNumberInput } from "@/components/forms/ToggleableNumberInput";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { getUser } from "@/services/userManagement";
import { useUserContext } from "@/utils/storage/userContext";
import UserCard from "@/components/cards/UserCard";
import { SeatsField } from "@/components/courses/SeatsField";
import { Course, CourseStatus, UserRole } from "@/types/course";

export default function CreateCoursePage() {
  const theme = useTheme();
  const router = useRouter();

  const { courseId: courseIdParam } = useLocalSearchParams();
  const courseId = courseIdParam as string;

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmationDelete, setShowConfirmationDelete] = useState(false);
  const [showConfirmationStart, setShowConfirmationStart] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [courseOwner, setCourseOwner] = useState(null);

  const courseContext = useCourseContext();
  const userContext = useUserContext();

  const courseDetailsHook = useCourseDetails();
  const requiredCoursesContext = useRequiredCoursesContext();

  const courseDetails = courseDetailsHook.courseDetails;
  const { requiredCourses } = requiredCoursesContext;

  const handleDiscardChanges = async () => {
    if (!courseContext.course) return;
    courseDetailsHook.setCourseDetails({
      ...courseContext.course.courseDetails,
    });

    const requiredCourses = await Promise.all(
      courseContext.course.courseDetails.dependencies.map(
        async (courseId) => await getCourse(courseId)
      )
    );

    requiredCoursesContext.setRequiredCourses(requiredCourses);
    setIsEditing(false);
  };

  const handleEditCourse = async () => {
    if (!courseContext.course) return;

    try {
      setIsLoading(true);
      const newCourseDetails = courseDetailsHook.courseDetails;
      newCourseDetails.dependencies =
        requiredCoursesContext.requiredCourses.map((course) => course.courseId);

      const updatedCourse = await editCourse(
        courseContext.course,
        newCourseDetails
      );

      courseContext.setCourse(updatedCourse);
      setIsEditing(false);
    } catch (error) {
      setErrorMessage((error as Error).message);
      handleDiscardChanges();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseContext.course) return;
    setIsLoading(true);

    try {
      await deleteCourse(courseContext.course.courseId);
      courseContext.setCourse(null);
      requiredCoursesContext.setRequiredCourses([]);
      router.push("/home");
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
      setShowConfirmationDelete(false);
    }
  };

  const handleStartCourse = async () => {
    if (!courseContext.course) return;
    setIsLoading(true);

    try {
      await startCourse(courseContext.course.courseId);
      courseContext.setCourse({
        ...courseContext.course,
        courseStatus: CourseStatus.STARTED,
      });
      router.back();
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
      setShowConfirmationStart(false);
    }
  };

  async function fetchCourse() {
    try {
      setIsLoading(true);
      const course = await getCourse(courseId);
      courseContext.setCourse(course);
    } catch (error) {
      setErrorMessage((error as Error).message);
      courseContext.setCourse(null);
    } finally {
      setIsLoading(false);
    }
  }

  function setCourseDetails() {
    courseDetailsHook.setCourseDetails({
      ...courseContext.course?.courseDetails,
    });
  }

  async function fetchCourseOwner() {
    try {
      setIsLoading(true);
      const courseOwner = await getUser(courseContext.course.ownerId);
      setIsOwner(courseOwner.id === userContext.user?.id);
      setCourseOwner(courseOwner);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchRequiredCourses() {
    try {
      setIsLoading(true);
      const requiredCourses = await Promise.all(
        courseContext.course.courseDetails.dependencies.map(
          async (courseId) => await getCourse(courseId)
        )
      );

      requiredCoursesContext.setRequiredCourses(requiredCourses);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    if (courseContext.course) {
      setCourseDetails();
      fetchCourseOwner();
      fetchRequiredCourses();
    }
  }, [courseContext.course]);

  const handleRequiredCoursePress = (requiredCourse: Course) => {
    router.push({
      pathname: "/courses/[courseId]",
      params: { courseId: requiredCourse.courseId, role: UserRole.OWNER },
    });
  };

  const handleOwnerPress = () => {
    if (isOwner) {
      router.push("/users/me");
    } else {
      router.push({
        pathname: "/users/[userId]",
        params: { userId: courseContext.course.ownerId },
      });
    }
  };

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction
            onPress={
              isEditing ? () => handleDiscardChanges() : () => router.back()
            }
          />
          <Appbar.Content title="Detalles del curso" />
          {isOwner && (
            <Appbar.Action
              icon={isEditing ? "check" : "pencil"}
              onPress={isEditing ? handleEditCourse : () => setIsEditing(true)}
            />
          )}
        </Appbar.Header>

        {isLoading ||
        !courseContext.course ||
        !courseDetails ||
        !courseOwner ||
        !requiredCourses ? (
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
          <ScrollView contentContainerStyle={{ gap: 16, padding: 16 }}>
            {courseOwner && (
              <View style={{ gap: 8 }}>
                <Text variant="titleMedium">Propietario del curso</Text>
                <UserCard user={courseOwner} onPress={handleOwnerPress} />
              </View>
            )}

            <ToggleableTextInput
              label="Nombre del curso"
              placeholder="Nombre del curso"
              value={courseDetails.title}
              editable={isEditing}
              onChange={courseDetailsHook.setName}
            />
            <ToggleableTextInput
              label="Descripción del curso"
              placeholder="Descripción del curso"
              value={courseDetails.description}
              onChange={courseDetailsHook.setDescription}
              editable={isEditing}
            />
            {isEditing ? (
              <ToggleableNumberInput
                label="Cantidad máxima de alumnos"
                value={courseDetails.maxNumberOfStudents}
                onChange={courseDetailsHook.setNumberOfStudents}
                editable={isEditing}
              />
            ) : (
              courseContext.course && (
                <SeatsField
                  seats={courseDetails.maxNumberOfStudents}
                  students={courseContext.course.numberOfStudens || 0}
                  showAlert={false}
                />
              )
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 20,
              }}
            >
              <DatePickerButton
                label="Fecha de inicio"
                value={courseDetails.startDate}
                editable={isEditing}
                onChange={courseDetailsHook.setStartDate}
                horizontal={true}
              />
              <DatePickerButton
                label="Fecha de finalización"
                value={courseDetails.endDate}
                editable={isEditing}
                onChange={courseDetailsHook.setEndDate}
                horizontal={true}
              />
            </View>
            <OptionPicker
              label="Nivel"
              value={courseDetails.level}
              items={LEVELS}
              editable={isEditing}
              setValue={courseDetailsHook.setLevel}
            />

            <OptionPicker
              label="Categoría"
              value={courseDetails.category}
              items={CATEGORIES}
              editable={isEditing}
              setValue={courseDetailsHook.setCategory}
            />

            <OptionPicker
              label="Modalidad"
              value={courseDetails.modality}
              items={MODALITIES}
              editable={isEditing}
              setValue={courseDetailsHook.setModality}
            />
            {((courseContext.course &&
              courseContext.course.courseDetails.dependencies.length > 0) ||
              isEditing) && (
              <View style={{ gap: 10 }}>
                <Text variant="titleMedium">Cursos requeridos</Text>
                {requiredCourses.map((course) => (
                  <View
                    key={course.courseId}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <CourseCard
                      course={course}
                      small={true}
                      onPress={() => handleRequiredCoursePress(course)}
                    />
                    {isEditing && (
                      <IconButton
                        icon="delete"
                        mode="contained"
                        onPress={() => {
                          requiredCoursesContext.deleteRequiredCourse(course);
                        }}
                      />
                    )}
                  </View>
                ))}

                {isEditing && (
                  <Button
                    onPress={() => router.push("/courses/searchRequired")}
                    mode="outlined"
                    icon="plus"
                  >
                    Agregar curso requerido
                  </Button>
                )}
              </View>
            )}

            {isEditing && isOwner && (
              <Button
                onPress={() => setShowConfirmationDelete(true)}
                mode="contained"
                icon="delete"
                disabled={isLoading}
              >
                Eliminar curso
              </Button>
            )}

            {!isEditing &&
              isOwner &&
              courseContext.course.courseStatus === CourseStatus.NEW && (
                <Button
                  onPress={() => setShowConfirmationStart(true)}
                  mode="contained"
                  icon="play"
                  disabled={isLoading}
                >
                  Iniciar curso
                </Button>
              )}
          </ScrollView>
        )}
        {/* Delete confirmation Dialog */}

        <Dialog
          visible={showConfirmationDelete}
          onDismiss={() => setShowConfirmationDelete(false)}
        >
          <Dialog.Title>Atención</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              El curso '{courseDetails.title}' será eliminado.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmationDelete(false)}>
              Cancelar
            </Button>
            <Button onPress={handleDeleteCourse}>Eliminar</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Start confirmation Dialog */}

        <Dialog
          visible={showConfirmationStart}
          onDismiss={() => setShowConfirmationStart(false)}
        >
          <Dialog.Title>Atención</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              ¿Deseas iniciar el curso '{courseDetails.title}'?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmationStart(false)}>
              Cancelar
            </Button>
            <Button onPress={handleStartCourse}>Iniciar</Button>
          </Dialog.Actions>
        </Dialog>
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
