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
import { ToggleableTagsInput } from "@/components/forms/ToggleableTagsInput";
import {
  acceptAnswer,
  getQuestion,
  voteAnswer,
} from "@/services/forumManagement";
import { getBulkUsers } from "@/services/userManagement";
import { User } from "@/types/user";
import { ForumAnswer, ForumQuestion } from "@/types/forum";
import ForumAnswerCard from "@/components/cards/ForumAnswerCard";
import { ToggleableFileInput } from "@/components/forms/ToggleableFileInput";
import ForumQuestionCard from "@/components/cards/ForumQuestionCard";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { useUserContext } from "@/utils/storage/userContext";

export default function ForumQuestionPage() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, questionId: quesionIdParam } =
    useLocalSearchParams();
  const courseId = courseIdParam as string;
  const questionId = Number(quesionIdParam);

  const userContextHook = useUserContext();
  const userId = userContextHook.user.id;
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [forumQuestion, setForumQuestion] = useState<ForumQuestion | null>(
    null
  );
  const [forumAnswers, setForumAnswers] = useState(null);
  const [users, setUsers] = useState<User[] | null>(null);

  const [creator, setCreator] = useState<User | null>(null);
  const [isCreator, setIsCreator] = useState(false);

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
    // setIsLoading(true);

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

  const handleAnswerPress = (answerId: number) => {
    router.push({
      pathname:
        "/courses/[courseId]/forum/questions/[questionId]/answers/[answerId]",
      params: {
        courseId: courseId,
        questionId: questionId,
        answerId: answerId,
      },
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

  useFocusEffect(
    useCallback(() => {
      fetchForumQuestion();
    }, [courseId, questionId])
  );

  const handleAcceptAnswer = async (newAcceptedAnswer: ForumAnswer) => {
    if (!forumQuestion || !forumAnswers || !users) return;
    setIsLoading(true);

    try {
      const newAcceptedAnswerId = newAcceptedAnswer.id;
      await acceptAnswer(courseId, questionId, newAcceptedAnswerId);
      const updatedQuestion = {
        ...forumQuestion,
        acceptedAnswerId: newAcceptedAnswerId,
      };

      const newAcceptedAnswerUser = users?.find(
        (user: User) => user.id === newAcceptedAnswer.creatorId
      );

      const updatedAnswers = forumAnswers.filter(
        (answer: ForumAnswer) => answer.id !== newAcceptedAnswerId
      );

      if (acceptedAnswer) {
        updatedAnswers.push(acceptedAnswer);
      }

      setForumQuestion(updatedQuestion);
      setAcceptedAnswerUser(newAcceptedAnswerUser);
      setAcceptedAnswer(newAcceptedAnswer);
      setForumAnswers(updatedAnswers);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleVoteAnswer = async (answerId: number, vote: 0 | 1 | -1) => {
    if (!forumAnswers) return;

    try {
      if (acceptedAnswer && acceptedAnswer.id === answerId) {
        const updatedAcceptedAnswer = updateVoteCount(acceptedAnswer, vote);
        setAcceptedAnswer(updatedAcceptedAnswer);
      } else {
        const updatedAnswers = forumAnswers.map((answer: ForumAnswer) => {
          if (answer.id === answerId) {
            return updateVoteCount(answer, vote);
          }
          return answer;
        });
        setForumAnswers(updatedAnswers);
      }

      await voteAnswer(courseId, answerId, vote);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const handleEditQuestion = () => {
    router.push({
      pathname: "/courses/[courseId]/forum/questions/[questionId]/edit",
      params: {
        courseId: courseId,
        questionId: forumQuestion.id,
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
  const renderQuestionSection = (
    forumQuestion: ForumQuestion,
    creator: User
  ) => (
    <ForumQuestionCard
      forumQuestion={forumQuestion}
      user={creator}
      onPress={handleCreatorProfilePress}
      fullAnswer={true}
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

  const renderTagsSection = (tags: string[]) => (
    <ToggleableTagsInput tags={tags} onChange={() => {}} editable={false} />
  );

  const renderAcceptedAnswerSection = (
    acceptedAnswer: ForumAnswer,
    acceptedAnswerUser: User
  ) => (
    <ForumAnswerCard
      user={acceptedAnswerUser}
      forumAnswer={acceptedAnswer}
      showAccepted={true}
      accepted={true}
      onPress={() => handleAnswerPress(acceptedAnswer.id)}
      onAcceptedPress={() => {}}
      onVotePress={(vote) => handleVoteAnswer(acceptedAnswer.id, vote)}
    />
  );

  // Corrección final para renderItem en SectionList
  const renderAnswersSection =
    (forumAnswers: ForumAnswer[], users: User[]) =>
    ({ item }: { item: ForumAnswer }) =>
      (
        <ForumAnswerCard
          user={
            users.find((user) => user.id === item.creatorId) || ({} as User)
          }
          forumAnswer={item}
          onPress={() => handleAnswerPress(item.id)}
          onAcceptedPress={() => handleAcceptAnswer(item)}
          showAccepted={isCreator}
          accepted={false}
          onVotePress={(vote) => handleVoteAnswer(item.id, vote)}
        />
      );

  // Ajustar las secciones para que sean compatibles con SectionList
  const sections = [
    {
      title: "Pregunta",
      data: [forumQuestion],
      renderItem: () => renderQuestionSection(forumQuestion, creator),
    },
    ...(forumQuestion && forumQuestion.information.file
      ? [
          {
            title: "Archivo",
            data: [forumQuestion.information.file],
            renderItem: () => renderFileSection(forumQuestion.information.file),
          },
        ]
      : []),
    ...(forumQuestion && forumQuestion.information.tags.length > 0
      ? [
          {
            title: "Tags",
            data: [forumQuestion.information.tags],
            renderItem: () => renderTagsSection(forumQuestion.information.tags),
          },
        ]
      : []),
    ...(creator && acceptedAnswer && acceptedAnswerUser
      ? [
          {
            title: "Respuesta aceptada",
            data: [acceptedAnswer],
            renderItem: () =>
              renderAcceptedAnswerSection(acceptedAnswer, acceptedAnswerUser),
          },
        ]
      : []),
    ...(creator
      ? [
          {
            title: "Respuestas",
            data: forumAnswers,
            renderItem: renderAnswersSection(forumAnswers, users),
          },
        ]
      : []),
  ];

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Pregunta" />
        {creator && userId == creator.id && (
          <Appbar.Action
            icon="pencil"
            onPress={() => {
              handleEditQuestion();
            }}
            accessibilityLabel="Editar pregunta"
          />
        )}
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
