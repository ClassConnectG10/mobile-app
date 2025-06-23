import { Icon, Text, useTheme } from "react-native-paper";
import { Pressable, StyleSheet, View } from "react-native";
import { Course, CourseFeedback } from "@/types/course";
import { formatLocalDateTime } from "@/utils/date";
import { MINIMUM_APPROVAL_MARK } from "@/utils/constants/courseDetails";
import { customColors } from "@/utils/constants/colors";

interface CourseFeedbackCardProps {
  course: Course;
  courseFeedback: CourseFeedback;
  onPress?: () => void;
}

const CourseFeedbackCard: React.FC<CourseFeedbackCardProps> = ({
  course,
  courseFeedback,
  onPress,
}) => {
  const theme = useTheme();
  const { title } = course.courseDetails;
  const { feedback, mark, createdAt } = courseFeedback;

  const isApproved = mark >= MINIMUM_APPROVAL_MARK;

  return (
    <Pressable onPress={onPress}>
      <View style={[styles.card, { backgroundColor: theme.colors.onPrimary }]}>
        <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
          Calificado el {formatLocalDateTime(createdAt)}
        </Text>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        <View
          style={{
            flexDirection: "row",
            gap: 16,
            alignItems: "center",
          }}
        >
          <Icon
            source={isApproved ? "check-circle" : "alert-circle"}
            color={isApproved ? customColors.success : theme.colors.error}
            size={20}
          />
          <View style={{ flex: 1, flexShrink: 1 }}>
            <Text
              style={[styles.description, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "bold" }}>Nota:</Text> {mark}
            </Text>
            <Text
              style={[styles.description, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "bold" }}>Comentario:</Text> {feedback}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    elevation: 0,
    shadowColor: "transparent",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  description: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: "600",
  },
  date: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "left",
  },
});

export default CourseFeedbackCard;
