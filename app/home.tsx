import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  Divider,
  FAB,
  IconButton,
  Modal,
  Searchbar,
  TextInput,
} from "react-native-paper";
import { router } from "expo-router";
import CourseCard from "@/components/CourseCard";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { useEffect, useState } from "react";
import Course from "@/types/course";
import { getSearchedCourses } from "@/services/courseManagement";
import { useUserContext } from "@/utils/storage/userContext";
import axios from "axios";
import SideBar from "@/components/SideBar";


function HomeContent() {
  const [courseCode, setCourseCode] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourseModalVisible, setNewCourseModalVisible] = useState(false);
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [sideBarVisible, setSideBarVisible] = useState(false);

  const userContextHook = useUserContext();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getSearchedCourses(courseSearchQuery, true);
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, [courseSearchQuery]);

  if (!userContextHook.user) {
    router.replace("/login");
    return null;
  }


  axios.defaults.headers.common["X-Caller-Id"] =
    userContextHook.user.id.toString();



  return (
    <View style={styles.container}>
      {/* Top bar */}
      <Appbar.Header>
        <Appbar.Action
          icon="menu"
          onPress={() => setSideBarVisible(!sideBarVisible)}
        />
        <Appbar.Content title="Class Connect" />
        <Appbar.Action
          icon="account"
          onPress={() => router.push("/users/me")}
        />
      </Appbar.Header>

      {/* Drawer menu */}

      <SideBar visible={sideBarVisible} />

      {/* Searchbar */}

      <Searchbar
        placeholder="Buscar cursos"
        onChangeText={setCourseSearchQuery}
        value={courseSearchQuery}

      />

      {/* Main scrollable content */}
      <FlatList
        style={styles.scrollContainer}
        data={courses}
        keyExtractor={(item) => item.courseId.toString()}
        renderItem={({ item }) => (
          <CourseCard
            name={item.courseDetails.title}
            description={item.courseDetails.description}
            category={item.courseDetails.category}
            onPress={() => { }}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />

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
          <IconButton icon="check" mode="contained" onPress={() => { }} />
        </View>
        <Divider />
        <Button
          mode="contained"
          icon="magnify"
          onPress={() => {
            setNewCourseModalVisible(false);
            router.push("/courses/search");
          }}
        >
          Buscar un curso existente
        </Button>

        <Button
          mode="contained"
          icon="plus"
          onPress={() => {
            setNewCourseModalVisible(false);
            router.push("/courses/create");
          }}
        >
          Crear un nuevo curso
        </Button>
      </Modal>

      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
}

export default function HomePage() {
  return (
    // <RNDrawer.Navigator
    //   initialRouteName="HomeContent"
    //   screenOptions={{
    //     drawerStyle: {
    //       backgroundColor: "#f4f4f4",
    //       width: 240,
    //     },
    //   }}
    //   drawerContent={() => (
    //     <>
    //       <Drawer.Section title="Some title">
    //         <Drawer.Item label="First Item" />
    //         <Drawer.Item label="Second Item" />
    //       </Drawer.Section>
    //     </>
    //   )}
    // >
    //   <RNDrawer.Screen
    //     name="HomeContent"
    //     component={HomeContent}
    //     options={{ title: "Inicio" }}
    //   />
    // </RNDrawer.Navigator>
    <HomeContent />
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
});
