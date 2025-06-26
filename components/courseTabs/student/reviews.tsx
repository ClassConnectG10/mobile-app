import { Course } from "@/types/course";
import { useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { ScrollView, View } from "react-native";
import { Button, useTheme, Text, ActivityIndicator } from "react-native-paper";
import ErrorMessageSnackbar from "../../ErrorMessageSnackbar";
import {
  createCourseReview,
  getCourseReview,
} from "@/services/courseManagement";
import { AlertText } from "@/components/AlertText";
import ReviewPicker from "@/components/forms/ReviewPicker";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { FullScreenModal } from "@/components/FullScreenModal";

interface ReviewsTabProps {
  course: Course;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({ course }) => {
  const theme = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [showReviewSentModal, setShowReviewSentModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [mark, setMark] = useState<number>(5);
  const [comment, setComment] = useState<string>("");

  const [hasPreviousReview, setHasPreviousReview] = useState(false);

  const handleFetchReview = async () => {
    if (!course.courseId) return;
    setIsLoading(true);

    try {
      const { mark: fetchedMark, comment: fetchedComment } =
        await getCourseReview(course.courseId);
      setMark(fetchedMark ?? 5);
      setComment(fetchedComment ?? "");
      setHasPreviousReview(!!fetchedMark);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!course.courseId) return;
    setIsLoading(true);

    try {
      await createCourseReview(course.courseId, mark, comment);
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
    }, [course.courseId]),
  );

  return (
    <>
      <View style={{ flex: 1 }}>
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
              <Text variant="titleMedium">Reseña del curso</Text>
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
        <FullScreenModal
          visible={showReviewSentModal}
          onDismiss={() => setShowReviewSentModal(false)}
        >
          <Text variant="titleLarge">Reseña enviada</Text>
          <Text variant="bodyMedium">Su reseña ha sido enviada con éxito.</Text>
          <Button onPress={() => setShowReviewSentModal(false)} mode="text">
            Aceptar
          </Button>
        </FullScreenModal>
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
};
