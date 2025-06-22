import { View, FlatList, StyleSheet } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  useTheme,
  Text,
  IconButton,
} from "react-native-paper";
import { useFocusEffect, useRouter } from "expo-router";
import { globalStyles } from "@/styles/globalStyles";
import { useCallback, useState } from "react";
import { Course, SearchFilters, SearchOption } from "@/types/course";
import { searchCourses } from "@/services/courseManagement";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import CourseCard from "@/components/cards/CourseCard";
import { CourseFilterModal } from "@/components/courses/CourseFilterModal";
import { SearchBar } from "@/components/forms/SearchBar";

export default function SearchCoursesPage() {
  const theme = useTheme();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchFiltersModalVisible, setSearchFiltersModalVisible] =
    useState(false);
  const [searchFilters, setSearchFilters] = useState(
    new SearchFilters("", null, null, "", "", "")
  );

  const fetchCourses = async () => {
    setCourses([]);
    setIsLoading(true);

    try {
      const coursesData = await searchCourses(
        searchFilters,
        SearchOption.NOT_RELATED
      );
      setCourses(coursesData);
    } catch (error) {
      setErrorMessage(`Error al buscar cursos: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCourse = (course: Course) => {
    router.push({
      pathname: "/courses/[courseId]",
      params: { courseId: course.courseId, role: course.currentUserRole },
    });
  };

  const handleSearch = (searchTerm: string) => {
    if (searchFilters.searchQuery === searchTerm) return;
    setSearchFilters((prev) => ({
      ...prev,
      searchQuery: searchTerm,
    }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchCourses();
    } finally {
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCourses();
    }, [searchFilters])
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Buscar cursos" />
      </Appbar.Header>

      <View style={[globalStyles.mainContainer, styles.mainContainer]}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <View style={{ flex: 1 }}>
            <SearchBar placeholder="Buscar cursos" onSearch={handleSearch} />
          </View>

          <IconButton
            icon="filter-variant"
            onPress={() => {
              setSearchFiltersModalVisible(true);
            }}
            disabled={isLoading}
          />
        </View>

        <View style={{ marginVertical: 16 }}>
          <FlatList
            data={courses}
            keyExtractor={(item) => item.courseId.toString()}
            renderItem={({ item }) => (
              <CourseCard
                course={item}
                onPress={() => handleSelectCourse(item)}
              />
            )}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            ListEmptyComponent={
              isLoading ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator
                    animating={true}
                    size="large"
                    color={theme.colors.primary}
                  />
                </View>
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text variant="titleMedium">No se encontraron cursos</Text>
                </View>
              )
            }
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
