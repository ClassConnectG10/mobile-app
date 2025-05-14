import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  FAB,
  Modal,
  SegmentedButtons,
  useTheme,
  Text,
  IconButton,
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
  const theme = useTheme();

  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourseModalVisible, setNewCourseModalVisible] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchOption, setSearchOption] = useState<SearchOption>(
    SearchOption.RELATED,
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
    favorites: false,
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchCourses();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [searchFilters, searchOption]);

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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            justifyContent: "space-between",
          }}
        >
          <SegmentedButtons
            style={{ flex: 1 }}
            value={searchOption}
            onValueChange={(value: SearchOption) => {
              handleSearchOptionChange(value);
            }}
            buttons={[
              {
                value: "enrolled",
                label: "Inscriptos",
                icon: "book-open-variant",
                disabled: isLoading,
              },
              {
                value: "taught",
                label: "Impartidos",
                icon: "human-male-board",
                disabled: isLoading,
              },
            ]}
          />
          <IconButton
            icon="heart"
            size={24}
            mode={searchFilters.favorites ? "contained" : "outlined"}
            onPress={() => {
              setSearchFilters((prev) => ({
                ...prev,
                favorites: !prev.favorites,
              }));
            }}
            disabled={isLoading}
          />
        </View>

        {/* Searchbar */}

        <CoursesSearchBar onSearch={handleSearch} />

        {/* Main scrollable content */}
        <FlatList
          style={styles.scrollContainer}
          data={courses}
          keyExtractor={(item) => item.courseId}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
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
  scrollContainer: {
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
