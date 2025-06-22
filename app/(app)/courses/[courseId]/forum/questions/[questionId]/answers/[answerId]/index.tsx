import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View, SectionList } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  useTheme,
  Text,
} from "react-native-paper";
import { getAnswer, voteAnswer } from "@/services/forumManagement";
import { getBulkUsers } from "@/services/userManagement";
import { User } from "@/types/user";
import { ForumAnswer } from "@/types/forum";
import ForumAnswerCard from "@/components/cards/ForumAnswerCard";
import { ToggleableFileInput } from "@/components/forms/ToggleableFileInput";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { useUserContext } from "@/utils/storage/userContext";

export default function ForumAnswerPage() {
  const router = useRouter();
  const theme = useTheme();
  const {
    courseId: courseIdParam,
    questionId: questionIdParam,
    answerId: answerIdParam,
    parentAnswerId: parentAnswerIdParam,
  } = useLocalSearchParams();
  const courseId = courseIdParam as string;
  const questionId = Number(questionIdParam);
  const answerId = Number(answerIdParam);
  // const parentAnswerId = Number(parentAnswerIdParam);

  const userContextHook = useUserContext();
  const userId = userContextHook.user.id;
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [forumAnswer, setForumAnswer] = useState<ForumAnswer | null>(null);
  const [answers, setAnswers] = useState(null);
  const [users, setUsers] = useState<User[] | null>(null);

  const [creator, setCreator] = useState<User | null>(null);
  const [isCreator, setIsCreator] = useState(false);

  const fetchForumAnswer = async () => {
    setIsLoading(true);
    try {
      const { answer, childrenAnswers } = await getAnswer(
        courseId,
        questionId,
        answerId
      );
      setForumAnswer(answer);

      setAnswers(childrenAnswers);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!courseId || !answers || !forumAnswer) return;
    // setIsLoading(true);

    try {
      const uniqueUserIds: Set<number> = new Set(
        answers.map((answer: ForumAnswer) => answer.creatorId)
      );
      uniqueUserIds.add(forumAnswer.creatorId);
      const fetchedUsers = await getBulkUsers(Array.from(uniqueUserIds));
      setUsers(fetchedUsers);
      const questionCreator = fetchedUsers.find(
        (user) => user.id === forumAnswer.creatorId
      );
      setCreator(questionCreator);
      setIsCreator(questionCreator?.id === userId);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
    // setIsLoading(false);
  };

  const handleCreateAnswer = () => {
    router.push({
      pathname:
        "/courses/[courseId]/forum/questions/[questionId]/answers/create",
      params: {
        courseId: courseId,
        questionId: questionId,
        parentAnswerId: answerId,
      },
    });
  };

  const handleCreatorProfilePress = () => {
    if (!forumAnswer) return;

    router.push({
      pathname: "/users/[userId]",
      params: { userId: forumAnswer.creatorId },
    });
  };

  const handleAnswerPress = (id: number) => {
    router.push({
      pathname:
        "/courses/[courseId]/forum/questions/[questionId]/answers/[answerId]",
      params: {
        courseId: courseId,
        questionId: questionId,
        answerId: id,
        parentAnswerId: answerId,
      },
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchForumAnswer();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [answers]);

  useFocusEffect(
    useCallback(() => {
      fetchForumAnswer();
    }, [courseId, questionId])
  );

  const updateVoteCount = (
    answer: ForumAnswer,
    vote: 0 | 1 | -1
  ): ForumAnswer => {
    let { upVotes, downVotes } = answer;

    if (answer.vote === 1) upVotes--;
    if (answer.vote === -1) downVotes--;

    if (vote === 1) upVotes++;
    if (vote === -1) downVotes++;

    return { ...answer, upVotes, downVotes, vote };
  };

  const handleVoteForumAnswer = async (vote: 0 | 1 | -1) => {
    if (!forumAnswer) return;

    try {
      setForumAnswer((prev) => {
        if (!prev) return null;
        return updateVoteCount(prev, vote);
      });
      await voteAnswer(courseId, forumAnswer.id, vote);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const handleVoteChildAnswer = async (answerId: number, vote: 0 | 1 | -1) => {
    if (!answers) return;
    try {
      const updatedAnswers = answers.map((answer: ForumAnswer) => {
        if (answer.id === answerId) {
          return updateVoteCount(answer, vote);
        }
        return answer;
      });
      setAnswers(updatedAnswers);

      await voteAnswer(courseId, answerId, vote);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const handleEditAnswer = () => {
    router.push({
      pathname:
        "/courses/[courseId]/forum/questions/[questionId]/answers/[answerId]/edit",
      params: {
        courseId: courseId,
        questionId: questionId,
        answerId: answerId,
      },
    });
  };

  // Refactor keyExtractor for better readability
  const keyExtractor = (item: any, index: number): string => {
    if (item?.id) return item.id.toString();
    if (Array.isArray(item)) return `tags-${index}`;
    if (item?.information?.title) return `file-${item.information.title}`;
    return index.toString();
  };

  // Render functions for each section
  const renderAnswerSection = (forumAnswer: ForumAnswer, creator: User) => (
    <ForumAnswerCard
      forumAnswer={forumAnswer}
      user={creator}
      showAccepted={false}
      onPress={handleCreatorProfilePress}
      onAcceptedPress={() => {}}
      onVotePress={(vote) => handleVoteForumAnswer(vote)}
    />
  );

  const renderFileSection = (file: any) => (
    <ToggleableFileInput
      files={[file]}
      editable={false}
      onChange={() => {}}
      maxFiles={1}
    />
  );

  const renderChildrenAnswersSection =
    (childrenAnswers: ForumAnswer[], users: User[]) =>
    ({ item }: { item: ForumAnswer }) =>
      (
        <ForumAnswerCard
          user={
            users.find((user) => user.id === item.creatorId) || ({} as User)
          }
          forumAnswer={item}
          onPress={() => handleAnswerPress(item.id)}
          onAcceptedPress={() => {}}
          showAccepted={false}
          accepted={false}
          onVotePress={(vote) => handleVoteChildAnswer(item.id, vote)}
        />
      );

  // Ajustar las secciones para que sean compatibles con SectionList
  const sections = [
    {
      title: "Respuesta",
      data: [forumAnswer],
      renderItem: () => renderAnswerSection(forumAnswer, creator),
    },
    ...(forumAnswer && forumAnswer.information.file
      ? [
          {
            title: "Archivo",
            data: [forumAnswer.information.file],
            renderItem: () => renderFileSection(forumAnswer.information.file),
          },
        ]
      : []),
    ...(creator
      ? [
          {
            title: "Respuestas",
            data: answers,
            renderItem: renderChildrenAnswersSection(answers, users),
          },
        ]
      : []),
  ];

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Respuesta" />
        {creator && userId === creator.id && (
          <Appbar.Action
            icon="pencil"
            onPress={() => {
              handleEditAnswer();
            }}
            accessibilityLabel="Editar respuesta"
          />
        )}
      </Appbar.Header>

      {isLoading || !forumAnswer || !users || !answers || !creator ? (
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
          sections={sections}
          keyExtractor={keyExtractor}
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
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          renderSectionFooter={({ section }) => {
            if (section.title === "Respuestas" && section.data.length === 0) {
              return (
                <View style={{ alignItems: "center", marginVertical: 12 }}>
                  <Text variant="bodyMedium">
                    La pregunta no tiene respuestas todavía.
                  </Text>
                </View>
              );
            }
            return null;
          }}
          ListFooterComponent={<View style={{ height: 16 }} />}
        />
      )}
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
}
