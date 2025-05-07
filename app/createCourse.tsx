import { View, StyleSheet, ScrollView } from "react-native";
import { Appbar, Button, Text, TextInput, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import OptionPicker from "@/components/OptionPicker";
import {
  levels,
  modalities,
  categories,
} from "@/utils/constants/courseDetails";
import { useCourseDetails, CourseDetailsHook } from "@/hooks/useCourseDetails";
import { globalStyles } from "@/styles/globalStyles";
import DatePickerButton from "@/components/DatePickerButton";

export default function CreateCoursePage() {
  const theme = useTheme();
  const router = useRouter();

  const [startDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [endDatePickerVisible, setEndDatePickerVisible] = useState(false);

  const courseDetailsHook = useCourseDetails();
  const courseDetails = courseDetailsHook.courseDetails;

  const decreaseNumStudents = () => {
    if (courseDetails.numberOfStudents > 1) {
      courseDetailsHook.setNumberOfStudents(courseDetails.numberOfStudents - 1);
    }
  };

  const increaseNumStudents = () => {
    courseDetailsHook.setNumberOfStudents(courseDetails.numberOfStudents + 1);
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Crear curso" />
      </Appbar.Header>
      <View style={globalStyles.mainContainer}>
        <ScrollView contentContainerStyle={globalStyles.courseDetailsContainer}>
          <TextInput placeholder="Nombre del curso" />
          <TextInput placeholder="Descripción del curso" />
          <Text>Cantidad máxima de alumnos</Text>
          <View style={globalStyles.numStudentsContainer}>
            <Button mode="contained" onPress={() => decreaseNumStudents()}>
              -
            </Button>
            <Text>{courseDetails.numberOfStudents}</Text>
            <Button mode="contained" onPress={() => increaseNumStudents()}>
              +
            </Button>
          </View>

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
          <Button mode="contained">Crear curso</Button>
        </ScrollView>
      </View>
    </>
  );
}
