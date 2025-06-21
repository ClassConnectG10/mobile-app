import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { Appbar, Button, Divider, TextInput, Text } from "react-native-paper";
import { ToggleableFileInput } from "@/components/forms/ToggleableFileInput";
import { ToggleableTagsInput } from "@/components/forms/ToggleableTagsInput";
import { useForumQuestionInformation } from "@/hooks/useForumQuestionDetailsHook";
import { createForumQuestion } from "@/services/forumManagement";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";

export default function CreateForumQuestionPage() {
  const router = useRouter();

  const { courseId: courseIdParam } = useLocalSearchParams();
  const courseId = courseIdParam as string;

  const [errorMessage, setErrorMessage] = useState<string>("");

  const { forumQuestionInformation, setTitle, setContent, setTags, setFile } =
    useForumQuestionInformation();

  const handleCreateForumQuestion = async () => {
    try {
      await createForumQuestion(courseId, forumQuestionInformation);
      router.back();
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Crear Pregunta en el Foro" />
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
            onChange={(files) => setFile(files.length > 0 ? files[0] : null)}
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
          <Button mode="contained" onPress={handleCreateForumQuestion}>
            Crear Pregunta
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
