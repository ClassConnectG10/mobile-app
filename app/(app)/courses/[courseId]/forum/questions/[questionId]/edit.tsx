import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { View, ScrollView } from "react-native";
import {
  Appbar,
  Button,
  Divider,
  TextInput,
  Text,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import { ToggleableFileInput } from "@/components/forms/ToggleableFileInput";
import { ToggleableTagsInput } from "@/components/forms/ToggleableTagsInput";
import { useForumQuestionInformation } from "@/hooks/useForumQuestionDetailsHook";
import {
  editForumQuestion,
  getQuestion,
  removeForumQuestion,
} from "@/services/forumManagement";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { ForumOrderBy, ForumQuestion, ForumSearchParams } from "@/types/forum";

export default function EditForumQuestionPage() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, questionId: questionIdParam } =
    useLocalSearchParams();
  const courseId = courseIdParam as string;
  const questionId = Number(questionIdParam);

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [forumQuestion, setForumQuestion] = useState<ForumQuestion | null>(
    null
  );
  const [fileChanged, setFileChanged] = useState<boolean>(false);

  const {
    forumQuestionInformation,
    setForumQuestionInformation,
    setTitle,
    setContent,
    setTags,
    setFile,
  } = useForumQuestionInformation();

  const fetchForumQuestion = async () => {
    if (!courseId || !questionId) return;

    setIsLoading(true);
    try {
      const { question } = await getQuestion(courseId, questionId);
      setForumQuestion(question);
      setForumQuestionInformation(question.information);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateForumQuestion = async () => {
    try {
      await editForumQuestion(
        courseId,
        questionId,
        forumQuestionInformation,
        fileChanged
      );
      router.back();
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const handleDeleteForumQuestion = async () => {
    try {
      await removeForumQuestion(courseId, questionId);
      router.back();
      router.back();
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
    } else if (files.length === 0) {
      setFile(null);
    }

    setFileChanged(true);
  };

  useFocusEffect(
    useCallback(() => {
      fetchForumQuestion();
    }, [courseId, questionId])
  );

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Editar pregunta" />
        <Appbar.Action
          icon="check"
          onPress={() => {
            handleUpdateForumQuestion();
          }}
        />
      </Appbar.Header>

      {isLoading || !forumQuestion ? (
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
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            justifyContent: "space-between",
            flex: 1,
          }}
        >
          <View style={{ gap: 16 }}>
            <TextInput
              label="Título"
              value={forumQuestionInformation.title}
              onChangeText={setTitle}
            />

            <TextInput
              label="Contenido"
              value={forumQuestionInformation.content}
              onChangeText={setContent}
              multiline
            />

            <Divider />

            <Text variant="titleMedium">Archivo (opcional)</Text>

            <ToggleableFileInput
              files={
                forumQuestionInformation.file
                  ? [forumQuestionInformation.file]
                  : []
              }
              editable={true}
              onChange={handleFileChange}
              maxFiles={1}
            />

            <Divider />

            <Text variant="titleMedium">Tags (opcional)</Text>

            <ToggleableTagsInput
              tags={forumQuestionInformation.tags}
              onChange={setTags}
            />
          </View>

          <View style={{ paddingTop: 16 }}>
            <Button
              icon="trash-can"
              mode="contained"
              onPress={() => {
                handleDeleteForumQuestion();
              }}
            >
              Eliminar pregunta
            </Button>
          </View>
        </ScrollView>
      )}
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
}
