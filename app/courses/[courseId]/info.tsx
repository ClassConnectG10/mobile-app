import { View, ScrollView } from "react-native";
import {
  Appbar,
  Button,
  IconButton,
  Text,
  useTheme,
  Dialog,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import OptionPicker from "@/components/OptionPicker";
import {
  levels,
  modalities,
  categories,
} from "@/utils/constants/courseDetails";
import { useCourseDetails } from "@/hooks/useCourseDetails";
import { globalStyles } from "@/styles/globalStyles";
import { DatePickerButton } from "@/components/DatePickerButton";
import { useRequiredCoursesContext } from "@/utils/storage/requiredCoursesContext";
import CourseCard from "@/components/CourseCard";
import { useCourseContext } from "@/utils/storage/courseContext";
import { useEffect, useState } from "react";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import {
  deleteCourse,
  editCourse,
  getCourse,
} from "@/services/courseManagement";
import { ToggleableNumberInput } from "@/components/ToggleableNumberInput";
import { ToggleableTextInput } from "@/components/ToggleableTextInput";
import { getUser } from "@/services/userManagement";
import { useUserContext } from "@/utils/storage/userContext";
import UserCard from "@/components/UserCard";
import { TextField } from "@/components/TextField";

export default function CreateCoursePage() {
  const theme = useTheme();
  const router = useRouter();

  const { courseId: courseIdParam } = useLocalSearchParams();
  const courseId = courseIdParam as string;

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // TODO: Use loading state
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmationDelete, setShowConfirmationDelete] = useState(false);
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
    setIsLoading(true);
    if (!courseContext.course) return;

    try {
      courseDetails.dependencies = requiredCourses.map(
        (course) => course.courseId
      );
      const updatedCourse = await editCourse(
        courseContext.course,
        courseDetails
      );
      courseContext.setCourse(updatedCourse);
      courseDetailsHook.setCourseDetails({
        ...updatedCourse.courseDetails,
      });

      setIsEditing(false);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    setIsLoading(true);
    if (!courseContext.course) return;

    try {
      await deleteCourse(courseContext.course.courseId);
      courseContext.setCourse(null);
      router.push("/home");
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
      setShowConfirmationDelete(false);
    }
  };

  async function fetchCourse() {
    try {
      setIsLoading(true);
      const course = await getCourse(courseId);
      courseContext.setCourse(course);
      courseDetailsHook.setCourseDetails({
        ...course.courseDetails,
      });

      const requiredCourses = await Promise.all(
        course.courseDetails.dependencies.map(
          async (courseId) => await getCourse(courseId)
        )
      );

      requiredCoursesContext.setRequiredCourses(requiredCourses);
    } catch (error) {
      setErrorMessage((error as Error).message);
      courseContext.setCourse(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCourseOwner() {
    try {
      setIsLoading(true);
      const courseOwner = await getUser(courseContext.course.ownerId);
      setIsOwner(courseOwner.id == userContext.user?.id);
      setCourseOwner(courseOwner);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchCourse();
  }, []);

  useEffect(() => {
    if (courseContext.course) {
      fetchCourseOwner();
    }
  }, [courseContext.course]);

  const handleRequiredCoursePress = (requiredCourseId: string) => {
    router.push({
      pathname: "/courses/[courseId]/inscription",
      params: { courseId: requiredCourseId },
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
      <View
        style={[
          globalStyles.mainContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ScrollView contentContainerStyle={globalStyles.courseDetailsContainer}>
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
              <View style={{ gap: 10 }}>
                {/* <TextField
                  label="Cantidad de alumnos"
                  value={courseContext.course.numberOfStudens.toString()}
                /> */}
                <TextField
                  label="Cantidad de alumnos inscritos"
                  value={courseDetails.maxNumberOfStudents.toString()}
                />
              </View>
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
            />
            <DatePickerButton
              label="Fecha de finalización"
              value={courseDetails.endDate}
              editable={isEditing}
              onChange={courseDetailsHook.setEndDate}
            />
          </View>
          <OptionPicker
            label="Nivel"
            value={courseDetails.level}
            items={levels}
            editable={isEditing}
            setValue={courseDetailsHook.setLevel}
          />

          <OptionPicker
            label="Categoría"
            value={courseDetails.category}
            items={categories}
            editable={isEditing}
            setValue={courseDetailsHook.setCategory}
          />

          <OptionPicker
            label="Modalidad"
            value={courseDetails.modality}
            items={modalities}
            editable={isEditing}
            setValue={courseDetailsHook.setModality}
          />
          {(courseDetails.dependencies.length > 0 || isEditing) && (
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
                    name={course.courseDetails.title}
                    category={course.courseDetails.category}
                    onPress={() => handleRequiredCoursePress(course.courseId)}
                  />
                  <IconButton
                    icon="delete"
                    mode="contained"
                    onPress={() => {
                      requiredCoursesContext.deleteRequiredCourse(course);
                    }}
                  />
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

          {isEditing && (
            <Button
              onPress={() => setShowConfirmationDelete(true)}
              mode="contained"
              icon="delete"
            >
              Eliminar curso
            </Button>
          )}
        </ScrollView>

        {/* Confirmation Dialog */}

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
        <ErrorMessageSnackbar
          message={errorMessage}
          onDismiss={() => setErrorMessage("")}
        />
      </View>
    </>
  );
}
