import { ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  Divider,
  FAB,
  IconButton,
  Modal,
  TextInput,
  useTheme,
} from "react-native-paper";
import { router } from "expo-router";
import CourseCard from "@/components/CourseCard";
import { getCoursesByUser } from "@/services/courses";
import { useEffect, useState } from "react";
import CourseInfo from "@/types/courseInfo";
import { set } from "zod";

export default function HomePage() {
  const theme = useTheme();
  const [courseCode, setCourseCode] = useState("");
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [newCourseModalVisible, setNewCourseModalVisible] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getCoursesByUser();
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => {}} />
        <Appbar.Content title="Class Connect" />
        <Appbar.Action
          icon="account"
          onPress={() => router.push("/userProfile")}
        />
      </Appbar.Header>

      {/* Main scrollable content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {courses.map((course, index) => (
          <CourseCard
            key={index}
            name={course.name}
            description={course.description}
            code={course.code}
            category={course.category}
          />
        ))}
      </ScrollView>

      {/* Floating action button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setNewCourseModalVisible(true)}
      />

      {/* Modal for course join / creation */}

      <Modal
        visible={newCourseModalVisible}
        onDismiss={() => {
          setNewCourseModalVisible(false);
        }}
        contentContainerStyle={styles.modalContainer}
        style={styles.modalContent}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            // justifyContent: "space-between",
            gap: 16,
          }}
        >
          <TextInput
            label="Código del curso"
            value={courseCode}
            mode="outlined"
            placeholder="Ingrese el código del curso"
            onChangeText={setCourseCode}
          />
          <IconButton icon="check" mode="contained" onPress={() => {}} />
        </View>
        <Divider />
        <Button
          mode="contained"
          icon="magnify"
          onPress={() => {
            setNewCourseModalVisible(false);
            router.push("/searchCourses");
          }}
        >
          Buscar un curso existente
        </Button>

        <Button
          mode="contained"
          icon="plus"
          onPress={() => {
            setNewCourseModalVisible(false);
            router.push("/createCourse");
          }}
        >
          Crear un nuevo curso
        </Button>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
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
