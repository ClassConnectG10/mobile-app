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

export default function CreateCoursePage() {
  const theme = useTheme();
  const router = useRouter();

  const { courseId: courseIdParam } = useLocalSearchParams();
  const courseId = courseIdParam as string;

  const [isEditing, setIsEditing] = useState(false);
  const [, setIsLoading] = useState(false); // TODO: Use loading state
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmationDelete, setShowConfirmationDelete] = useState(false);

  const courseContext = useCourseContext();
  const courseDetailsHook = useCourseDetails();
  const requiredCoursesContext = useRequiredCoursesContext();
  const courseDetails = courseDetailsHook.courseDetails;
  const { requiredCourses } = requiredCoursesContext;

  const handleDiscardChanges = () => {
    if (!courseContext.course) return;
    courseDetailsHook.setCourseDetails({
      ...courseContext.course.courseDetails,
    });
    setIsEditing(false);
  };

  const handleEditCourse = async () => {
    setIsLoading(true);
    if (!courseContext.course) return;

    try {
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
    } catch (error) {
      setErrorMessage((error as Error).message);
      courseContext.setCourse(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!courseContext.course || courseContext.course.courseId !== courseId) {
      fetchCourse();
    } else {
      courseDetailsHook.setCourseDetails({
        ...courseContext.course.courseDetails,
      });
    }
  });

  const handleRequiredCoursePress = (requiredCourseId: string) => {
    router.push({
      pathname: "/courses/[courseId]/inscription",
      params: { courseId: requiredCourseId },
    });
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
        <Appbar.Action
          icon={isEditing ? "check" : "pencil"}
          onPress={
            isEditing ? handleEditCourse : () => setIsEditing(!isEditing)
          }
        />
      </Appbar.Header>
      <View
        style={[
          globalStyles.mainContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ScrollView contentContainerStyle={globalStyles.courseDetailsContainer}>
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
          <ToggleableNumberInput
            label="Cantidad máxima de alumnos"
            value={courseDetails.maxNumberOfStudents}
            onChange={courseDetailsHook.setNumberOfStudents}
            editable={isEditing}
          />
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
