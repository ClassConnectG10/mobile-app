import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { Appbar, Button, Divider, TextInput } from "react-native-paper";
import { ToggleableFileInput } from "@/components/forms/ToggleableFileInput";
import { ToggleableTagsInput } from "@/components/forms/ToggleableTagsInput";
import { useForumQuestionInformation } from "@/hooks/useForumQuestionDetailsHook";
import {
  createForumAnswer,
  createForumQuestion,
} from "@/services/forumManagement";
import { useForumAnswerInformation } from "@/hooks/useForumAnswerDetailsHook";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";

export default function CreateForumAnswerPage() {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState("");

  const {
    courseId: courseIdParam,
    questionId: questionIdParam,
    parentAnswerId: parentAnswerIdParam,
  } = useLocalSearchParams();
  const courseId = courseIdParam as string;
  const questionId = Number(questionIdParam);
  const parentAnswerId = parentAnswerIdParam
    ? Number(parentAnswerIdParam)
    : null;

  const { forumAnswerInformation, setContent, setFile } =
    useForumAnswerInformation();

  const handleCreateForumAnswer = async () => {
    try {
      await createForumAnswer(
        courseId,
        questionId,
        parentAnswerId,
        forumAnswerInformation
      );
      router.back();
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Responder pregunta" />
        {/* TODO: Handlear responder pregunta/respuesta */}
      </Appbar.Header>

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

          <ToggleableFileInput
            files={
              forumAnswerInformation.file ? [forumAnswerInformation.file] : []
            }
            editable={true}
            onChange={(files) => setFile(files.length > 0 ? files[0] : null)}
            maxFiles={1}
          />
        </View>

        <View style={{ paddingTop: 16 }}>
          <Button mode="contained" onPress={handleCreateForumAnswer}>
            Crear respuesta
          </Button>
        </View>
      </ScrollView>

      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
}
