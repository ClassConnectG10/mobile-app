import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, SectionList } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  useTheme,
  Text,
} from "react-native-paper";
import { ToggleableTagsInput } from "@/components/forms/ToggleableTagsInput";
import { getQuestion } from "@/services/forumManagement";
import { TextField } from "@/components/forms/TextField";
import { getBulkUsers } from "@/services/userManagement";
import { User } from "@/types/user";
import { ForumAnswer, ForumQuestion } from "@/types/forum";
import ForumAnswerCard from "@/components/cards/ForumAnswerCard";
import { ToggleableFileInput } from "@/components/forms/ToggleableFileInput";
import UserCard from "@/components/cards/UserCard";
import ForumQuestionCard from "@/components/cards/ForumQuestionCard";

export default function ForumQuestionPage() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, questionId: quesionIdParam } =
    useLocalSearchParams();
  const courseId = courseIdParam as string;
  const questionId = Number(quesionIdParam);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [forumQuestion, setForumQuestion] = useState<ForumQuestion | null>(
    null
  );
  const [forumAnswers, setForumAnswers] = useState(null);
  const [users, setUsers] = useState<User[] | null>(null);

  const [creator, setCreator] = useState<User | null>(null);

  const [acceptedAnswer, setAcceptedAnswer] = useState<ForumAnswer | null>(
    null
  );
  const [acceptedAnswerUser, setAcceptedAnswerUser] = useState<User | null>(
    null
  );

  const fetchForumQuestion = async () => {
    setIsLoading(true);
    try {
      const { question, answers } = await getQuestion(courseId, questionId);
      setForumQuestion(question);

      if (question.acceptedAnswerId) {
        const fetchedAcceptedAnswer = answers.find(
          (answer: ForumAnswer) => answer.id === question.acceptedAnswerId
        );
        setAcceptedAnswer(fetchedAcceptedAnswer);

        const otherAnswers = answers.filter(
          (answer: ForumAnswer) => answer.id !== question.acceptedAnswerId
        );
        setForumAnswers(otherAnswers);
      } else {
        setAcceptedAnswer(null);
        setForumAnswers(answers);
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!courseId || !forumAnswers || !forumQuestion) return;
    setIsLoading(true);

    try {
      const uniqueUserIds: Set<number> = new Set(
        forumAnswers.map((answer: ForumAnswer) => answer.creatorId)
      );
      uniqueUserIds.add(forumQuestion.creatorId);
      if (acceptedAnswer) {
        uniqueUserIds.add(acceptedAnswer.creatorId);
      }

      const fetchedUsers = await getBulkUsers(Array.from(uniqueUserIds));

      if (acceptedAnswer) {
        const fetchedAcceptedAnswerUser = fetchedUsers.find(
          (user) => user.id === acceptedAnswer.creatorId
        );
        setAcceptedAnswerUser(fetchedAcceptedAnswerUser);
      }
      setUsers(fetchedUsers);
      const questionCreator = fetchedUsers.find(
        (user) => user.id === forumQuestion.creatorId
      );
      setCreator(questionCreator);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
    setIsLoading(false);
  };

  const handleCreateAnswer = () => {
    router.push({
      pathname: "/courses/[courseId]/forum/[questionId]/create",
      params: {
        courseId: courseId,
        questionId: questionId,
        parentAnswerId: null,
      },
    });
  };

  const handleCreatorProfilePress = () => {
    if (!forumQuestion) return;

    router.push({
      pathname: "/users/[userId]",
      params: { userId: forumQuestion.creatorId },
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchForumQuestion();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [forumAnswers]);

  useEffect(() => {
    fetchForumQuestion();
  }, [courseId, questionId]);

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Pregunta" />
      </Appbar.Header>

      {isLoading || !forumQuestion || !users || !forumAnswers || !creator ? (
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
        <SectionList
          style={{ flex: 1, padding: 16 }}
          contentContainerStyle={{ gap: 8 }}
          sections={[
            {
              title: "Pregunta",
              data: [forumQuestion],
              renderItem: () => (
                <ForumQuestionCard
                  forumQuestion={forumQuestion}
                  user={creator}
                  onPress={handleCreatorProfilePress}
                />
              ),
            },
            ...(forumQuestion.information.file
              ? [
                  {
                    title: "Archivo",
                    data: [forumQuestion.information.file],
                    renderItem: () => (
                      <ToggleableFileInput
                        files={[forumQuestion.information.file]}
                        editable={false}
                        onChange={() => {}}
                        maxFiles={1}
                      />
                    ),
                  },
                ]
              : []),
            ...(forumQuestion.information.tags.length > 0
              ? [
                  {
                    title: "Tags",
                    data: [forumQuestion.information.tags],
                    renderItem: () => (
                      <ToggleableTagsInput
                        tags={forumQuestion.information.tags}
                        onChange={() => {}}
                        editable={false}
                      />
                    ),
                  },
                ]
              : []),
            ...(acceptedAnswer && acceptedAnswerUser
              ? [
                  {
                    title: "Respuesta aceptada",
                    data: [acceptedAnswer],
                    renderItem: () => (
                      <ForumAnswerCard
                        user={acceptedAnswerUser}
                        forumAnswer={acceptedAnswer}
                        onPress={() => {
                          alert("Respuesta aceptada");
                        }}
                      />
                    ),
                  },
                ]
              : []),
            {
              title: "Respuestas",
              data: forumAnswers,
              renderItem: ({ item }) => (
                <ForumAnswerCard
                  user={
                    users.find((user) => user.id === item.creatorId) ||
                    ({} as User)
                  }
                  forumAnswer={item}
                  onPress={() => {}}
                />
              ),
            },
          ]}
          keyExtractor={(item, index) => {
            if (item && item.id) return item.id.toString();
            if (Array.isArray(item)) return `tags-${index}`;
            if (item && item.name) return `file-${item.name}`;
            return index.toString();
          }}
          renderSectionHeader={({ section: { title } }) =>
            title !== "Pregunta" ? (
              <View style={{ paddingVertical: 8 }}>
                {title === "Respuestas" ? (
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 4,
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text variant="titleMedium">{title}</Text>
                    <Button
                      icon="plus"
                      contentStyle={{ flexDirection: "row-reverse" }}
                      onPress={handleCreateAnswer}
                      accessibilityLabel="Nueva respuesta"
                    >
                      Añadir respuesta
                    </Button>
                  </View>
                ) : (
                  <Text variant="titleMedium">{title}</Text>
                )}
              </View>
            ) : null
          }
          renderItem={({ section, item, index, separators }) => {
            if (section.renderItem) {
              if (section.title === "Respuestas") {
                return section.renderItem({ item, index, section, separators });
              }
              return section.renderItem({ item, index, section, separators });
            }
            return null;
          }}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text variant="bodyMedium">La pregunta no tiene respuestas</Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 16 }} />}
        />
      )}
    </View>
  );
}
