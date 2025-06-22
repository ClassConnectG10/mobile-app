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
import { useForumAnswerInformation } from "@/hooks/useForumAnswerDetailsHook";
import {
  editForumAnswer,
  getAnswer,
  removeForumAnswer,
} from "@/services/forumManagement";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { ForumAnswer } from "@/types/forum";

export default function EditAnswerAnswerPage() {
  const router = useRouter();
  const theme = useTheme();
  const {
    courseId: courseIdParam,
    answerId: answerIdParam,
    questionId: questionIdParam,
  } = useLocalSearchParams();

  const courseId = courseIdParam as string;
  const questionId = Number(questionIdParam);
  const answerId = Number(answerIdParam);

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [forumAnswer, setForumAnswer] = useState<ForumAnswer | null>(null);
  const [fileChanged, setFileChanged] = useState<boolean>(false);

  const {
    forumAnswerInformation,
    setForumAnswerInformation,
    setContent,
    setFile,
  } = useForumAnswerInformation();

  const fetchForumAnswer = async () => {
    if (!courseId || !questionId || !answerId) return;
    setIsLoading(true);

    try {
      const { answer } = await getAnswer(courseId, questionId, answerId);
      setForumAnswer(answer);
      setForumAnswerInformation(answer.information);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateForumAnswer = async () => {
    try {
      await editForumAnswer(
        courseId,
        answerId,
        forumAnswerInformation,
        fileChanged
      );
      router.back();
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const handleDeleteForumAnswer = async () => {
    try {
      await removeForumAnswer(courseId, answerId);
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
      fetchForumAnswer();
    }, [courseId, questionId, answerId])
  );

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Editar respuesta" />
        <Appbar.Action
          icon="check"
          onPress={() => {
            handleUpdateForumAnswer();
          }}
        />
      </Appbar.Header>

      {isLoading || !forumAnswer ? (
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
              label="Contenido"
              value={forumAnswerInformation.content}
              onChangeText={setContent}
              multiline
            />
            <Divider />
            <Text variant="titleMedium">Archivo (opcional)</Text>
            <ToggleableFileInput
              files={
                forumAnswerInformation.file ? [forumAnswerInformation.file] : []
              }
              editable={true}
              onChange={handleFileChange}
              maxFiles={1}
            />
          </View>

          <View style={{ paddingTop: 16 }}>
            <Button
              icon="trash-can"
              mode="contained"
              onPress={() => {
                handleDeleteForumAnswer();
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
