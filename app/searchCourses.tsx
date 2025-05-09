import {
  View,
  ScrollView,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
import {
  Appbar,
  Button,
  Text,
  TextInput,
  Searchbar,
  Modal,
  Divider,
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
import { useState } from "react";
import Course from "@/types/course";
import CourseDetails from "@/types/courseDetails";
import { getCoursesByUser } from "@/services/coursesWithDetails";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import CourseCard from "@/components/CourseCard";

export default function SearchCoursesPage() {
  const router = useRouter();
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [joinCourseModalVisible, setJoinCourseModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const fetchCourses = async () => {
    try {
      const coursesData = await getCoursesByUser();
      setCourses(coursesData);
    } catch (error) {
      setErrorMessage(`Error al buscar cursos: ${error}`);
    }
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setJoinCourseModalVisible(true);
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Buscar cursos" />
      </Appbar.Header>
      <View style={[globalStyles.mainContainer, styles.mainContainer]}>
        <Searchbar
          placeholder="Buscar cursos"
          onChangeText={setCourseSearchQuery}
          value={courseSearchQuery}
          onIconPress={fetchCourses}
        />
        <View style={{ marginVertical: 16 }}>
          <FlatList
            data={courses}
            keyExtractor={(item) => item.courseId.toString()}
            renderItem={({ item }) => (
              <Pressable onPress={() => handleSelectCourse(item)}>
                <CourseCard
                  name={item.courseDetails.name}
                  description={item.courseDetails.description}
                  category={item.courseDetails.category}
                  code={item.courseId.toString()}
                />
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          />
        </View>
        <Modal
          visible={joinCourseModalVisible}
          onDismiss={() => {
            setJoinCourseModalVisible(false);
          }}
          contentContainerStyle={styles.modalContainer}
          style={styles.modalContent}
        >
          {selectedCourse && (
            <View style={{ alignItems: "center" }}>
              <Text variant="titleLarge">
                {selectedCourse.courseDetails.name} (ID{" "}
                {selectedCourse.courseId})
              </Text>
              <Text variant="titleSmall" style={{ marginBottom: 16 }}>
                {selectedCourse.courseDetails.description}
              </Text>
              <Text>
                Cantidad máxima de estudiantes:{" "}
                {selectedCourse.courseDetails.numberOfStudents}
              </Text>
              <Text>
                Fecha de inicio:{" "}
                {selectedCourse.courseDetails.startDate.toLocaleDateString()}
              </Text>
              <Text>
                Fecha de fin:{" "}
                {selectedCourse.courseDetails.endDate.toLocaleDateString()}
              </Text>
              <Text>Nivel: {selectedCourse.courseDetails.level}</Text>
              <Text>Modalidad: {selectedCourse.courseDetails.modality}</Text>
              <Text>Categoría: {selectedCourse.courseDetails.category}</Text>
            </View>
          )}
          <Divider />
          <Button
            mode="contained"
            icon="notebook-multiple"
            onPress={() => {
              setJoinCourseModalVisible(false);
              // router.push("/createCourse");
            }}
          >
            Unirse al curso
          </Button>
        </Modal>
        <ErrorMessageSnackbar
          message={errorMessage}
          onDismiss={() => setErrorMessage("")}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingBottom: 100,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
    elevation: 5,
    gap: 16,
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: "#6200ee",
    borderRadius: 4,
    padding: 10,
    color: "white",
  },
});
