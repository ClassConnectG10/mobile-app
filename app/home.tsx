import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  FAB,
  Modal,
  Searchbar,
  SegmentedButtons,
} from "react-native-paper";
import { router } from "expo-router";
import CourseCard from "@/components/CourseCard";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { useEffect, useState } from "react";
import { Course, SearchFilters, SearchOption } from "@/types/course";
import { searchCourses } from "@/services/courseManagement";
import { useUserContext } from "@/utils/storage/userContext";
import axios from "axios";
import { CourseFilterModal } from "@/components/CourseFilterModal";
import { CoursesSearchBar } from "@/components/CoursesSearchBar";

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourseModalVisible, setNewCourseModalVisible] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [searchOption, setSearchOption] = useState<SearchOption>(
    SearchOption.RELATED
  );
  const [searchFiltersModalVisible, setSearchFiltersModalVisible] =
    useState(false);

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchQuery: "",
    startDate: null,
    endDate: null,
    level: "",
    modality: "",
    category: "",
  });

  const userContextHook = useUserContext();

  const handleSearchOptionChange = async (value: SearchOption) => {
    if (searchOption === value) {
      setSearchOption(SearchOption.RELATED);
    } else {
      setSearchOption(value);
    }
  };

  const fetchCourses = async () => {
    console.log("Fetching courses with filters:", searchFilters);
    try {
      setIsLoading(true);
      const coursesData = await searchCourses(searchFilters, searchOption);
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setSearchFilters((prev) => ({
      ...prev,
      searchQuery: searchTerm,
    }));
  };

  useEffect(() => {
    fetchCourses();
  }, [searchFilters, searchOption]);

  // useEffect(() => {
  //   if (!userContextHook.user) {
  //     router.replace("/login");
  //   }
  // }, []);

  if (!userContextHook.user) {
    return null;
  }

  axios.defaults.headers.common["X-Caller-Id"] =
    userContextHook.user.id.toString();

  return (
    <>
      {/* Top bar */}
      <Appbar.Header>
        {/* <Appbar.Action icon="menu" /> */}
        <Appbar.Content title="Class Connect" />
        <Appbar.Action
          icon="filter"
          onPress={() => {
            setSearchFiltersModalVisible(true);
          }}
        />
        <Appbar.Action
          icon="account"
          onPress={() => router.push("/users/me")}
        />
      </Appbar.Header>

      {/* Segmented control */}

      <View style={{ padding: 16, gap: 16, flex: 1 }}>
        <SegmentedButtons
          value={searchOption}
          onValueChange={(value: SearchOption) => {
            handleSearchOptionChange(value);
          }}
          buttons={[
            {
              value: "enrolled",
              label: "Cursos inscriptos",
              icon: "book-open-variant",
              disabled: isLoading,
            },
            {
              value: "taught",
              label: "Cursos creados",
              icon: "human-male-board",
              disabled: isLoading,
            },
          ]}
        />

        {/* Searchbar */}

        <CoursesSearchBar onSearch={handleSearch} />

        {/* Main scrollable content */}
        <FlatList
          style={styles.scrollContainer}
          data={courses}
          keyExtractor={(item) => item.courseId}
          renderItem={({ item }) => (
            <CourseCard
              name={item.courseDetails.title}
              description={item.courseDetails.description}
              category={item.courseDetails.category}
              onPress={() => {
                router.push({
                  pathname: "/courses/[courseId]",
                  params: { courseId: item.courseId },
                });
              }}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      </View>

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
        {/* <View
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
          <IconButton icon="check" mode="contained" onPress={() => {}} />
        </View>
        <Divider /> */}
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

      <CourseFilterModal
        visible={searchFiltersModalVisible}
        onDismiss={() => {
          setSearchFiltersModalVisible(false);
        }}
        onApplyFilters={setSearchFilters}
      />

      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  scrollContainer: {
    // padding: 16,
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
