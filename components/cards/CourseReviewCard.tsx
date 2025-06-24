import { Icon, Text, useTheme } from "react-native-paper";
import { Pressable, StyleSheet, View } from "react-native";
import { Course, CourseFeedback, CourseReview } from "@/types/course";
import { formatLocalDateTime } from "@/utils/date";
import { MINIMUM_APPROVAL_MARK } from "@/utils/constants/courseDetails";
import { customColors } from "@/utils/constants/colors";
import { User } from "@/types/user";
import ReviewPicker from "../forms/ReviewPicker";

interface CourseReviewCardProps {
  user: User;
  courseReview: CourseReview;
  onPress?: () => void;
}

const CourseReviewCard: React.FC<CourseReviewCardProps> = ({
  user,
  courseReview,
  onPress,
}) => {
  const theme = useTheme();
  const { firstName, lastName } = user.userInformation;
  const { comment, mark, createdAt } = courseReview;

  return (
    <Pressable onPress={onPress}>
      <View style={[styles.card, { backgroundColor: theme.colors.onPrimary }]}>
        <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
          Publicada el {formatLocalDateTime(createdAt)}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={[
              styles.title,
              { color: theme.colors.onSurface, flexShrink: 1 },
            ]}
            numberOfLines={10}
            ellipsizeMode="tail"
            allowFontScaling
          >
            {firstName} {lastName}
          </Text>
          <ReviewPicker
            value={mark}
            editable={false}
            backgroundColor="transparent"
            borderColor="transparent"
            iconSize={18}
            compact={true}
            onChange={() => {}}
          />
        </View>
        <View style={{ flex: 1, flexShrink: 1 }}>
          <Text style={[styles.description, { color: theme.colors.onSurface }]}>
            <Text style={{ fontWeight: "bold" }}>Comentario:</Text> {comment}
          </Text>
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

export default CourseReviewCard;
