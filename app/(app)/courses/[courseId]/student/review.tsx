import { View, ScrollView } from "react-native";
import {
  Appbar,
  Button,
  Text,
  useTheme,
  Dialog,
  ActivityIndicator,
} from "react-native-paper";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { useCallback, useState } from "react";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import ReviewPicker from "@/components/forms/ReviewPicker";
import { AlertText } from "@/components/AlertText";
import { createCourseReview } from "@/services/courseManagement";

export default function ReviewCoursePage() {
  const theme = useTheme();
  const router = useRouter();

  const { courseId: courseIdParam } = useLocalSearchParams();
  const courseId = courseIdParam as string;

  const [isLoading, setIsLoading] = useState(false);
  const [showReviewSentModal, setShowReviewSentModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [mark, setMark] = useState<number>(5);
  const [comment, setComment] = useState<string>("");

  const [hasPreviousReview, setHasPreviousReview] = useState(false);

  const handleFetchReview = async () => {
    if (!courseId) return;
    setIsLoading(true);

    try {
      // TODO: Fetchear la reseña del curso y actualizar hasPreviousReview
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!courseId) return;
    setIsLoading(true);

    try {
      await createCourseReview(courseId, mark, comment);
      setShowReviewSentModal(true);
      setHasPreviousReview(true);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      handleFetchReview();
    }, [courseId])
  );

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => {
              router.back();
            }}
          />
          <Appbar.Content title="Reseña del curso" />
        </Appbar.Header>
        {isLoading ? (
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
          <View style={{ flex: 1, padding: 16 }}>
            <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 80 }}>
              {!hasPreviousReview && (
                <AlertText
                  text="No has enviado una reseña para este curso todavía."
                  error={false}
                />
              )}

              <ReviewPicker
                value={mark}
                onChange={setMark}
                editable={!hasPreviousReview}
              />
              <ToggleableTextInput
                label="Comentario"
                placeholder="Comentario de la reseña"
                value={comment}
                onChange={setComment}
                editable={!hasPreviousReview}
              />
              {!hasPreviousReview && (
                <Button
                  onPress={() => {
                    handleSubmitReview();
                  }}
                  mode="contained"
                  icon="star-plus"
                  disabled={isLoading}
                >
                  Confirmar reseña
                </Button>
              )}
            </ScrollView>
          </View>
        )}
        <Dialog
          visible={showReviewSentModal}
          onDismiss={() => setShowReviewSentModal(false)}
        >
          <Dialog.Title>Reseña enviada</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Su reseña ha sido enviada con éxito.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowReviewSentModal(false)}>
              Aceptar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
