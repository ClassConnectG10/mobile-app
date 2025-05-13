import { View, FlatList, StyleSheet } from "react-native";
import { Appbar, Searchbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { globalStyles } from "@/styles/globalStyles";
import { useEffect, useState } from "react";
import { Course, SearchFilters, SearchOption } from "@/types/course";
import { searchCourses } from "@/services/courseManagement";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import CourseCard from "@/components/CourseCard";
import { useRequiredCoursesContext } from "@/utils/storage/requiredCoursesContext";
import { useCourseContext } from "@/utils/storage/courseContext";
import { CoursesSearchBar } from "@/components/CoursesSearchBar";
import { CourseFilterModal } from "@/components/CourseFilterModal";

export default function SearchCoursesPage() {
  const router = useRouter();
  const courseContext = useCourseContext();
  const [courses, setCourses] = useState<Course[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchFiltersModalVisible, setSearchFiltersModalVisible] =
    useState(false);

  const [searchFilters, setSearchFilters] = useState(
    new SearchFilters("", null, null, "", "", "")
  );

  const requiredCoursesContext = useRequiredCoursesContext();
  const { addRequiredCourse } = requiredCoursesContext;

  const fetchCourses = async () => {
    try {
      const coursesData = await searchCourses(searchFilters, SearchOption.ALL);

      console.log("Required courses context", requiredCoursesContext);

      const filteredCourses = coursesData.filter(
        (course) =>
          !requiredCoursesContext.requiredCourses.some(
            (selectedCourse) => selectedCourse.courseId === course.courseId
          )
      );

      if (courseContext.course) {
        const filteredCoursesWithSelected = filteredCourses.filter(
          (course) => course.courseId !== courseContext.course?.courseId
        );

        setCourses(filteredCoursesWithSelected);
      } else {
        setCourses(filteredCourses);
      }
    } catch (error) {
      setErrorMessage(`Error al buscar cursos: ${error}`);
    }
  };

  const handleSelectCourse = (course: Course) => {
    addRequiredCourse(course);
    router.back();
  };

  const handleSearch = (searchTerm: string) => {
    setSearchFilters((prev) => ({
      ...prev,
      searchQuery: searchTerm,
    }));
  };

  useEffect(() => {
    fetchCourses();
  }, [searchFilters]);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Buscar cursos" />
        <Appbar.Action
          icon="filter"
          onPress={() => {
            setSearchFiltersModalVisible(true);
          }}
        />
      </Appbar.Header>

      <View style={[globalStyles.mainContainer, styles.mainContainer]}>
        <CoursesSearchBar onSearch={handleSearch} />

        <View style={{ marginVertical: 16 }}>
          <FlatList
            data={courses}
            keyExtractor={(item) => item.courseId.toString()}
            renderItem={({ item }) => (
              <CourseCard
                name={item.courseDetails.title}
                description={item.courseDetails.description}
                category={item.courseDetails.category}
                onPress={() => handleSelectCourse(item)}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          />
        </View>

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
    gap: 16,
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: "#6200ee",
    borderRadius: 4,
    padding: 10,
    color: "white",
  },
});
