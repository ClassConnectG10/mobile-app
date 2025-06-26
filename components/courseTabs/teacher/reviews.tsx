import { Course, CourseReview, CourseReviewSearchParams } from "@/types/course";
import { useFocusEffect, useRouter } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import { FlatList, View } from "react-native";
import {
  useTheme,
  Text,
  ActivityIndicator,
  IconButton,
} from "react-native-paper";
import ErrorMessageSnackbar from "../../ErrorMessageSnackbar";
import { getCourseReviews } from "@/services/courseManagement";
import { getBulkUsers } from "@/services/userManagement";
import { User } from "@/types/user";
import CourseReviewCard from "@/components/cards/CourseReviewCard";
import { SearchBar } from "@/components/forms/SearchBar";
import { CourseReviewFilterModal } from "@/components/courses/CourseReviewFilterModal";

interface ReviewsTabProps {
  course: Course;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({ course }) => {
  const router = useRouter();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchFiltersModalVisible, setSearchFiltersModalVisible] =
    useState(false);
  const [reviews, setReviews] = useState<CourseReview[]>(null);
  const [users, setUsers] = useState<User[]>(null);

  const [courseReviewSearchParams, setCourseReviewSearchParams] =
    useState<CourseReviewSearchParams>({
      searchQuery: "",
      startDate: null,
      endDate: null,
      mark: null,
    });

  async function fetchCourseReviews() {
    if (!course.courseId) return;
    setReviews(null);
    setIsLoading(true);
    try {
      const fetchedReviews = await getCourseReviews(
        course.courseId,
        courseReviewSearchParams,
      );
      setReviews(fetchedReviews);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchUsers = async () => {
    if (!course.courseId || !reviews) return;
    setIsLoading(true);

    try {
      const uniqueUserIds = Array.from(
        new Set(reviews.map((review) => review.userId)),
      );
      const fetchedUsers = await getBulkUsers(uniqueUserIds);
      setUsers(fetchedUsers);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
    setIsLoading(false);
  };

  const handleSearch = (searchTerm: string) => {
    if (courseReviewSearchParams.searchQuery === searchTerm) return;
    setCourseReviewSearchParams((prev) => ({
      ...prev,
      searchQuery: searchTerm,
    }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchCourseReviews();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [reviews]);

  useFocusEffect(
    useCallback(() => {
      fetchCourseReviews();
    }, [course.courseId, courseReviewSearchParams]),
  );

  return (
    <View style={{ paddingHorizontal: 16, flex: 1 }}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.userId.toString()}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        renderItem={({ item, index }) => {
          const user = users?.find((user) => user.id === item.userId);
          return (
            !isLoading &&
            reviews &&
            users &&
            user && (
              <CourseReviewCard
                courseReview={item}
                user={user}
                onPress={() => {
                  router.push({
                    pathname: "/users/[userId]",
                    params: { userId: item.userId },
                  });
                }}
              />
            )
          );
        }}
        ListHeaderComponent={
          <View style={{ gap: 8, marginBottom: 16 }}>
            <Text variant="titleMedium">Reseñas del curso</Text>
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
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          isLoading || !reviews || !users ? (
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
              <Text variant="titleMedium">No se han encontrado reseñas</Text>
            </View>
          )
        }
      />
      <CourseReviewFilterModal
        visible={searchFiltersModalVisible}
        onDismiss={() => setSearchFiltersModalVisible(false)}
        onApplySearchParams={setCourseReviewSearchParams}
      />
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
};
