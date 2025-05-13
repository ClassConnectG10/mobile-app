import { View, FlatList, StyleSheet } from "react-native";
import {
  Appbar,
  Button,
  Text,
  Searchbar,
  Modal,
  Divider,
  IconButton,
  useTheme,
} from "react-native-paper";
import { useRouter } from "expo-router";
import OptionPicker from "@/components/OptionPicker";
import {
  levels,
  modalities,
  categories,
} from "@/utils/constants/courseDetails";
import { globalStyles } from "@/styles/globalStyles";
import { DatePickerButton } from "@/components/DatePickerButton";
import { useState } from "react";
import { Course, SearchFilters, SearchOption } from "@/types/course";
import { searchCourses } from "@/services/courseManagement";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import CourseCard from "@/components/CourseCard";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { CourseFilterModal } from "@/components/CourseFilterModal";

export default function SearchCoursesPage() {
  const router = useRouter();
  const theme = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchFiltersModalVisible, setSearchFiltersModalVisible] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState(
    new SearchFilters("", null, null, "", "", "")
  );

  const fetchCourses = async () => {
    try {
      console.log("JJJJJJJJ");
      console.log("searchFilters", searchFilters);
      searchFilters.searchQuery = searchQuery;
      const coursesData = await searchCourses(
        searchFilters,
        SearchOption.NOT_RELATED
      );
      setCourses(coursesData);
    } catch (error) {
      setErrorMessage(`Error al buscar cursos: ${error}`);
    }
  };

  const handleSelectCourse = (course: Course) => {
    router.push({
      pathname: "/courses/[courseId]/inscription",
      params: { courseId: course.courseId },
    });
  };

  const handleApplyFilters = async (searchFilters: SearchFilters) => {
    setSearchFiltersModalVisible(false);
    setSearchFilters(searchFilters);
  };

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
        <Searchbar
          placeholder="Buscar cursos"
          onChangeText={setSearchQuery}
          value={searchQuery}
          onIconPress={fetchCourses}
        />

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
          onApplyFilters={handleApplyFilters}
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
