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
import OptionPicker from "@/components/OptionPicker";
import {
  levels,
  modalities,
  categories,
} from "@/utils/constants/courseDetails";
import { useCourseDetails } from "@/hooks/useCourseDetails";
import { globalStyles } from "@/styles/globalStyles";
import { DatePickerButton } from "@/components/DatePickerButton";
import { createCourse } from "@/services/courseManagement";

export default function CreateCoursePage() {
  const theme = useTheme();
  const router = useRouter();
  const courseDetailsHook = useCourseDetails();
  const courseDetails = courseDetailsHook.courseDetails;

  const decreaseNumStudents = () => {
    if (courseDetails.maxNumberOfStudents > 1) {
      courseDetailsHook.setNumberOfStudents(
        courseDetails.maxNumberOfStudents - 1
      );
    }
  };

  const increaseNumStudents = () => {
    courseDetailsHook.setNumberOfStudents(
      courseDetails.maxNumberOfStudents + 1
    );
  };

  const handleCreateCourse = async () => {
    try {
      await createCourse(courseDetails);
      router.push("/home"); // TODO redireccionar a la página del curso creado
    } catch (error) {
      console.error("Error al crear el curso:", error);
    }
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

          <Text>Cantidad máxima de alumnos</Text>
          <View style={globalStyles.numStudentsContainer}>
            <IconButton
              icon="minus"
              mode="contained"
              onPress={() => decreaseNumStudents()}
            />

            <Text variant="titleLarge">
              {courseDetails.maxNumberOfStudents}
            </Text>
            <IconButton
              icon="plus"
              mode="contained"
              onPress={() => increaseNumStudents()}
            />
          </View>

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
            />
            <DatePickerButton
              label="Fecha de finalización"
              value={courseDetails.endDate}
              onChange={courseDetailsHook.setEndDate}
            />
          </View>
          <OptionPicker
            label="Nivel"
            value={courseDetails.level}
            items={levels}
            setValue={courseDetailsHook.setLevel}
          />

          <OptionPicker
            label="Categoría"
            value={courseDetails.category}
            items={categories}
            setValue={courseDetailsHook.setCategory}
          />

          <OptionPicker
            label="Modalidad"
            value={courseDetails.modality}
            items={modalities}
            setValue={courseDetailsHook.setModality}
          />
          <Button onPress={handleCreateCourse} mode="contained">
            Crear curso
          </Button>
        </ScrollView>
      </View>
    </>
  );
}
