import { Course } from "@/types/course";
import { useFocusEffect, useRouter } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import { FlatList, View } from "react-native";
import {
  useTheme,
  Text,
  ActivityIndicator,
  IconButton,
  Button,
} from "react-native-paper";
import ErrorMessageSnackbar from "../ErrorMessageSnackbar";
import { ForumOrderBy, ForumQuestion, ForumSearchParams } from "@/types/forum";
import { getQuestions } from "@/services/forumManagement";
import { User } from "@/types/user";
import { getBulkUsers } from "@/services/userManagement";
import ForumQuestionCard from "@/components/cards/ForumQuestionCard";
import { SearchBar } from "../forms/SearchBar";
import { ForumQuestionsFilterModal } from "../forum/ForumQuestionsFilterModal";

interface ForumTabProps {
  course: Course;
}

export const ForumTab: React.FC<ForumTabProps> = ({ course }) => {
  const router = useRouter();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchParamsModalVisible, setSearchParamsModalVisible] =
    useState(false);

  const [questions, setQuestions] = useState<ForumQuestion[]>(null);
  const [users, setUsers] = useState<User[]>(null);

  const [forumQueryParams, setForumQueryParams] = useState<ForumSearchParams>({
    searchQuery: "",
    startDate: null,
    endDate: null,
    tags: [],
    orderBy: ForumOrderBy.RECENT,
  });

  const fetchQuestions = async () => {
    if (!course.courseId) return;

    setQuestions(null);
    setIsLoading(true);

    try {
      const fetchedQuestions = await getQuestions(
        course.courseId,
        0,
        forumQueryParams
      );
      setQuestions(fetchedQuestions);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      // setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!course.courseId || !questions) return;
    setIsLoading(true);

    try {
      const uniqueUserIds = Array.from(
        new Set(questions.map((question) => question.creatorId))
      );
      const fetchedUsers = await getBulkUsers(uniqueUserIds);
      setUsers(fetchedUsers);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchQuestions();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [questions]);

  useFocusEffect(
    useCallback(() => {
      fetchQuestions();
    }, [course.courseId, forumQueryParams])
  );

  const handleCreateQuestion = () => {
    router.push({
      pathname: "/courses/[courseId]/forum/questions/create",
      params: { courseId: course.courseId },
    });
  };

  const handleViewQuestion = (question: ForumQuestion) => {
    router.push({
      pathname: "/courses/[courseId]/forum/questions/[questionId]",
      params: {
        courseId: course.courseId,
        questionId: question.id,
      },
    });
  };

  const handleSearch = (searchTerm: string) => {
    if (forumQueryParams.searchQuery === searchTerm) return;
    setForumQueryParams((prev) => ({
      ...prev,
      searchQuery: searchTerm,
    }));
  };

  return (
    <View style={{ paddingHorizontal: 16, flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id.toString()}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) =>
            users && (
              <ForumQuestionCard
                user={
                  users.find((user) => user.id === item.creatorId) ||
                  ({} as User)
                }
                forumQuestion={item}
                onPress={() => {
                  handleViewQuestion(item);
                }}
              />
            )
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
                <Text variant="titleMedium">No hay preguntas en este foro</Text>
              </View>
            )
          }
          ListHeaderComponent={
            <View
              style={{
                paddingBottom: 8,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 8,
                  justifyContent: "space-between",
                }}
              >
                <Text variant="titleMedium">Foro</Text>

                <View
                  style={{
                    flexDirection: "row",
                    gap: 4,
                    alignItems: "center",
                  }}
                >
                  <Button
                    icon="plus"
                    contentStyle={{ flexDirection: "row-reverse" }}
                    onPress={handleCreateQuestion}
                    accessibilityLabel="Nueva pregunta"
                  >
                    Nueva pregunta
                  </Button>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <SearchBar
                    placeholder="Buscar preguntas"
                    onSearch={handleSearch}
                  />
                </View>

                <IconButton
                  icon="filter-variant"
                  onPress={() => {
                    setSearchParamsModalVisible(true);
                  }}
                  disabled={isLoading}
                />
              </View>
            </View>
          }
        />
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
      <ForumQuestionsFilterModal
        visible={searchParamsModalVisible}
        onDismiss={() => setSearchParamsModalVisible(false)}
        onApplySearchParams={setForumQueryParams}
      />
    </View>
  );
};
