import CourseFeedbackCard from "@/components/cards/CourseFeedbackCard";
import { CourseFeedbackFilterModal } from "@/components/courses/CourseFeedbackFilterModal";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { SearchBar } from "@/components/forms/SearchBar";
import { getFeedbacks, searchCourses } from "@/services/courseManagement";
import {
  Course,
  CourseFeedback,
  CourseFeedbackSearchParams,
  FeedbackType,
  SearchFilters,
  SearchOption,
} from "@/types/course";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { Appbar, IconButton, Text, useTheme } from "react-native-paper";

export default function FeedbacksPage() {
  const router = useRouter();
  const theme = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedbacks, setFeedbacks] = useState<CourseFeedback[] | null>(null);
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [searchFiltersModalVisible, setSearchFiltersModalVisible] =
    useState(false);

  const [courseFeedbackSearchParams, setCourseFeedbackSearchParams] =
    useState<CourseFeedbackSearchParams>({
      searchQuery: "",
      startDate: null,
      endDate: null,
      feedbackType: FeedbackType.ALL,
    });

  const fetchCourses = async () => {
    setIsLoading(true);

    try {
      const searchFilters = new SearchFilters("", null, null, "", "", "");

      const fetchedCourses = await searchCourses(
        searchFilters,
        SearchOption.ENROLLED
      );
      setCourses(fetchedCourses);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    if (!courses) return;

    setIsLoading(true);
    setFeedbacks(null);

    try {
      const myFeedbacks = await getFeedbacks(courseFeedbackSearchParams);
      setFeedbacks(myFeedbacks);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePressCourseFeedback = (course: Course) => {
    router.push({
      pathname: "/courses/[courseId]",
      params: { courseId: course.courseId, role: course.currentUserRole },
    });
  };

  const handleSearch = (searchTerm: string) => {
    if (courseFeedbackSearchParams.searchQuery === searchTerm) return;
    setCourseFeedbackSearchParams((prev) => ({
      ...prev,
      searchQuery: searchTerm,
    }));
  };

  const fetchAll = async () => {
    await Promise.all([fetchCourses(), fetchFeedbacks()]);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAll();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [courseFeedbackSearchParams, courses]);

  useFocusEffect(
    useCallback(() => {
      fetchCourses();
    }, [])
  );

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            router.back();
          }}
        />
        <Appbar.Content title="Mis notas" />
      </Appbar.Header>
      <View
        style={{
          padding: 16,
          flex: 1,
          backgroundColor: theme.colors.background,
        }}
      >
        <FlatList
          data={feedbacks}
          contentContainerStyle={{ gap: 8 }}
          keyExtractor={(item) => item.courseId}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) => {
            if (!courses) return null;

            const course = courses.find((c) => c.courseId === item.courseId);
            if (!course) return null;

            return (
              <CourseFeedbackCard
                course={course}
                courseFeedback={item}
                onPress={() => {
                  handlePressCourseFeedback(course);
                }}
              />
            );
          }}
          ListEmptyComponent={
            isLoading ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 16,
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
                <Text variant="titleMedium">Aún no se han recibido notas</Text>
              </View>
            )
          }
          ListHeaderComponent={
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <SearchBar placeholder="Buscar notas" onSearch={handleSearch} />
              </View>

              <IconButton
                icon="filter-variant"
                onPress={() => {
                  setSearchFiltersModalVisible(true);
                }}
                disabled={isLoading}
              />
            </View>
          }
        />
      </View>
      <CourseFeedbackFilterModal
        visible={searchFiltersModalVisible}
        onDismiss={() => setSearchFiltersModalVisible(false)}
        onApplySearchParams={setCourseFeedbackSearchParams}
      />

      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
}
