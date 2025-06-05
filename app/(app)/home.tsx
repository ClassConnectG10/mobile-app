import React, { useCallback } from "react";
import { FlatList, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  SegmentedButtons,
  useTheme,
  Text,
  IconButton,
} from "react-native-paper";
import { router, useFocusEffect } from "expo-router";
import CourseCard from "@/components/cards/CourseCard";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { useState } from "react";
import { Course, SearchFilters, SearchOption } from "@/types/course";
import { searchCourses } from "@/services/courseManagement";
import { useUserContext } from "@/utils/storage/userContext";
import { CourseFilterModal } from "@/components/courses/CourseFilterModal";
import { SearchBar } from "@/components/forms/SearchBar";
import { FullScreenModal } from "@/components/FullScreenModal";
import { FloatingActionButton } from "@/components/FloatingActionButton";

export default function HomePage() {
  const theme = useTheme();

  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourseModalVisible, setNewCourseModalVisible] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    favorites: false,
  });

  const userContextHook = useUserContext();
  const userId = userContextHook.user.id;

  const handleSearchOptionChange = async (value: SearchOption) => {
    if (searchOption === value) {
      setSearchOption(SearchOption.RELATED);
    } else {
      setSearchOption(value);
    }
  };

  const fetchCourses = async () => {
    if (!searchFilters || !searchOption) return;

    try {
      setIsLoading(true);
      const coursesData = await searchCourses(searchFilters, searchOption);
      setCourses(coursesData);
    } catch (error) {
      setErrorMessage((error as Error).message);
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

  useFocusEffect(
    useCallback(() => {
      fetchCourses();
    }, [searchFilters, searchOption])
  );

  return (
    <>
      {/* Top bar */}
      <Appbar.Header>
        {/* <Appbar.Action icon="menu" /> */}
        <Appbar.Content title="Class Connect" />
        {/* <IconBadge
          icon="bell"
          count={1}
          showBadge={true}
          onPress={() => {
            router.push("/notifications");
          }}
        /> */}
        <Appbar.Action
          icon="bell-badge"
          onPress={() =>
            router.push("/notifications")
          }
        />
        <Appbar.Action
          icon="account"
          onPress={() =>
            router.push({
              pathname: "/users/[userId]",
              params: {
                userId,
              },
            })
          }
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

        {/* Main scrollable content */}
        <FlatList
          style={{ paddingBottom: 100, gap: 16 }}
          data={courses}
          keyExtractor={(item) => item.courseId}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              onPress={() => {
                router.push({
                  pathname: "/courses/[courseId]",
                  params: {
                    courseId: item.courseId,
                    role: item.currentUserRole,
                  },
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
      <FloatingActionButton
        onPress={() => {
          setNewCourseModalVisible(true);
        }}
      />

      {/* Modal for course join / creation */}
      <FullScreenModal
        visible={newCourseModalVisible}
        onDismiss={() => {
          setNewCourseModalVisible(false);
        }}
        children={
          <>
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
          </>
        }
      />

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
