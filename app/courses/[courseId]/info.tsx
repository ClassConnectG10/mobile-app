import { View, ScrollView } from "react-native";
import {
  Appbar,
  Button,
  IconButton,
  Text,
  TextInput,
  useTheme,
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
import { editCourse, getCourse } from "@/services/courseManagement";
import { ToggleableNumberInput } from "@/components/ToggleableNumberInput";
import { ToggleableTextInput } from "@/components/ToggleableTextInput";

export default function CreateCoursePage() {
  const theme = useTheme();
  const router = useRouter();

  const { courseId: courseIdParam } = useLocalSearchParams();
  const courseId = courseIdParam as string;

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    if (!courseContext.course) {
      fetchCourse();
    } else {
      courseDetailsHook.setCourseDetails({
        ...courseContext.course.courseDetails,
      });
    }
  }, [courseId]);

  const handleRequiredCoursePress = (requiredCourseId: string) => {
    router.push({
      pathname: "/courses/[courseId]",
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
                  onPress={() => router.push("/courses/create/searchRequired")}
                  mode="outlined"
                  icon="plus"
                >
                  Agregar curso requerido
                </Button>
              )}
            </View>
          )}
        </ScrollView>
        <ErrorMessageSnackbar
          message={errorMessage}
          onDismiss={() => setErrorMessage("")}
        />
      </View>
    </>
  );
}
