import { View, ScrollView } from "react-native";
import {
  Appbar,
  Button,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useRouter } from "expo-router";
import OptionPicker from "@/components/forms/OptionPicker";
import {
  LEVELS,
  MODALITIES,
  CATEGORIES,
} from "@/utils/constants/courseDetails";
import { useCourseDetails } from "@/hooks/useCourseDetails";
import { globalStyles } from "@/styles/globalStyles";
import { DatePickerButton } from "@/components/forms/DatePickerButton";
import { createCourse } from "@/services/courseManagement";
import { useRequiredCoursesContext } from "@/utils/storage/requiredCoursesContext";
import CourseCard from "@/components/cards/CourseCard";
import { ToggleableNumberInput } from "@/components/forms/ToggleableNumberInput";
import { useCourseContext } from "@/utils/storage/courseContext";
import { Course, UserRole } from "@/types/course";

export default function CreateCoursePage() {
  const theme = useTheme();
  const router = useRouter();
  const courseDetailsHook = useCourseDetails();
  const courseDetails = courseDetailsHook.courseDetails;

  const courseContext = useCourseContext();

  const requiredCoursesContext = useRequiredCoursesContext();
  const { requiredCourses } = requiredCoursesContext;

  const handleCreateCourse = async () => {
    try {
      courseDetails.dependencies = requiredCourses.map(
        (course) => course.courseId
      );
      const createdCourse = await createCourse(courseDetails);
      courseContext.setCourse(createdCourse);
      router.replace({
        pathname: "/courses/[courseId]",
        params: { courseId: createdCourse.courseId, role: UserRole.OWNER },
      });
    } catch (error) {
      console.error("Error al crear el curso:", error);
    }
  };

  const handleRequiredCoursePress = (course: Course) => {
    router.push({
      pathname: "/courses/[courseId]",
      params: { courseId: course.courseId, role: course.currentUserRole },
    });
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Crear curso" />
      </Appbar.Header>
      <View
        style={[
          globalStyles.mainContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ScrollView contentContainerStyle={globalStyles.courseDetailsContainer}>
          <TextInput
            placeholder="Nombre del curso"
            onChangeText={courseDetailsHook.setName}
          />
          <TextInput
            placeholder="Descripción del curso"
            onChangeText={courseDetailsHook.setDescription}
          />

          <ToggleableNumberInput
            label="Cantidad máxima de alumnos"
            value={courseDetails.maxNumberOfStudents}
            onChange={courseDetailsHook.setNumberOfStudents}
            editable={true}
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
              onChange={courseDetailsHook.setStartDate}
              horizontal={true}
            />
            <DatePickerButton
              label="Fecha de finalización"
              value={courseDetails.endDate}
              onChange={courseDetailsHook.setEndDate}
              horizontal={true}
            />
          </View>
          <OptionPicker
            label="Nivel"
            value={courseDetails.level}
            items={LEVELS}
            setValue={courseDetailsHook.setLevel}
          />

          <OptionPicker
            label="Categoría"
            value={courseDetails.category}
            items={CATEGORIES}
            setValue={courseDetailsHook.setCategory}
          />

          <OptionPicker
            label="Modalidad"
            value={courseDetails.modality}
            items={MODALITIES}
            setValue={courseDetailsHook.setModality}
          />
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
                <IconButton
                  icon="delete"
                  mode="contained"
                  onPress={() => {
                    requiredCoursesContext.deleteRequiredCourse(course);
                  }}
                />
              </View>
            ))}
            <Button
              onPress={() => router.push("/courses/searchRequired")}
              mode="outlined"
              icon="plus"
            >
              Agregar curso requerido
            </Button>
          </View>
          <Button onPress={handleCreateCourse} mode="contained">
            Crear curso
          </Button>
        </ScrollView>
      </View>
    </>
  );
}
