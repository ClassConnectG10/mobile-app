import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  TextInput,
  useTheme,
} from "react-native-paper";
import { ToggleableFileInput } from "@/components/forms/ToggleableFileInput";
import { ToggleableTagsInput } from "@/components/forms/ToggleableTagsInput";
import { useForumQuestionInformation } from "@/hooks/useForumQuestionDetailsHook";
import { createForumQuestion, getQuestion } from "@/services/forumManagement";
import { TextField } from "@/components/forms/TextField";
import { set } from "zod";

export default function ForumQuestionPage() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, questionId: quesionIdParam } =
    useLocalSearchParams();
  const courseId = courseIdParam as string;
  const questionId = Number(quesionIdParam);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [forumQuestion, setForumQuestion] = useState(null);
  const [forumAnswers, setForumAnswers] = useState(null);

  //   const { forumQuestionInformation, setTitle, setContent, setTags, setFile } =
  //     useForumQuestionInformation();

  const fetchForumQuestion = async () => {
    setIsLoading(true);
    try {
      const { question, answers } = await getQuestion(courseId, questionId);
      setForumQuestion(question);
      setForumAnswers(answers);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForumQuestion();
  }, [courseId, questionId]);

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Pregunta" />
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
            <TextField label="Título" value={forumQuestion.information.title} />

            <TextField
              label="Contenido"
              value={forumQuestion.information.content}
            />

            {/* <ToggleableFileInput
            files={
              forumQuestionInformation.file
                ? [forumQuestionInformation.file]
                : []
            }
            editable={true}
            onChange={(files) => setFile(files.length > 0 ? files[0] : null)}
            maxFiles={1}
          />

          <ToggleableTagsInput
            tags={forumQuestionInformation.tags}
            onChange={setTags}
          />*/}
          </View>

          {/* <View style={{ paddingTop: 16 }}>
          <Button mode="contained" onPress={handleCreateForumQuestion}>
            Crear Pregunta
          </Button>
        </View> */}
        </ScrollView>
      )}
    </View>
  );
}
