import { Course } from "@/types/course";
import { useFocusEffect, useRouter } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import { FlatList, View } from "react-native";
import {
  useTheme,
  Text,
  ActivityIndicator,
  IconButton,
} from "react-native-paper";
import ErrorMessageSnackbar from "../ErrorMessageSnackbar";
import { ForumQuestion } from "@/types/forum";
import { getQuestions } from "@/services/forumManagement";
import { User } from "@/types/user";
import { getBulkUsers } from "@/services/userManagement";
import ForumQuestionCard from "@/components/cards/ForumQuestionCard";

interface ForumTabProps {
  course: Course;
}

export const ForumTab: React.FC<ForumTabProps> = ({ course }) => {
  const router = useRouter();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [questions, setQuestions] = useState<ForumQuestion[]>(null);
  const [users, setUsers] = useState<User[]>(null);

  const fetchQuestions = async () => {
    if (!course.courseId) return;

    setIsLoading(true);
    try {
      const fetchedQuestions = await getQuestions(course.courseId);
      setQuestions(fetchedQuestions);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!course.courseId || questions === null) return;
    setIsLoading(true);

    try {
      const uniqueUserIds = Array.from(
        new Set(questions.map((question) => question.creatorId))
      );
      console.log("Fetching users for IDs:", uniqueUserIds);
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
    }, [course.courseId])
  );

  const handleCreateQuestion = () => {
    router.push({
      pathname: "/courses/[courseId]/forum/create",
      params: { courseId: course.courseId },
    });
  };

  const handleViewQuestion = (question: ForumQuestion) => {
    router.push({
      pathname: "/courses/[courseId]/forum/[questionId]", // TODO change to forum question details
      params: {
        courseId: course.courseId,
        questionId: question.id,
      },
    });
  };

  return (
    <View style={{ paddingHorizontal: 16, flex: 1 }}>
      {isLoading || users === null || questions === null ? (
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
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 8,
              justifyContent: "space-between",
            }}
          >
            <Text variant="titleMedium">Foro</Text>

            <View style={{ flexDirection: "row", gap: 4 }}>
              <IconButton
                icon="plus"
                size={24}
                style={{ margin: 0 }}
                onPress={handleCreateQuestion}
                accessibilityLabel="Nueva pregunta"
              />
            </View>
          </View>
          <FlatList
            data={questions}
            keyExtractor={(item) => item.id.toString()}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            renderItem={({ item, index }) => (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
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
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text variant="titleMedium">No hay preguntas en este foro</Text>
              </View>
            }
          />
        </View>
      )}
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
};
