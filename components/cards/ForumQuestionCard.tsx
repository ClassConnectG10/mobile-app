import { IconButton, Text, useTheme } from "react-native-paper";
import { Pressable, StyleSheet, View } from "react-native";
import { ForumQuestion } from "@/types/forum";
import { User } from "@/types/user";
import { ToggleableProfilePicture } from "../forms/ToggleableProfilePicture";
import { formatLocalDateTime } from "@/utils/date";

interface ForumQuestionCardProps {
  user: User;
  forumQuestion: ForumQuestion;
  onPress?: () => void;
  fullAnswer?: boolean;
}

const ForumQuestionCard: React.FC<ForumQuestionCardProps> = ({
  user,
  forumQuestion,
  onPress,
  fullAnswer = false,
}) => {
  const theme = useTheme();
  const { title, content } = forumQuestion.information;
  const { createdAt, acceptedAnswerId } = forumQuestion;

  return (
    <Pressable onPress={onPress}>
      <View style={[styles.card, { backgroundColor: theme.colors.onPrimary }]}>
        <View style={[styles.row, { justifyContent: "space-between" }]}>
          <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
            Publicado el {formatLocalDateTime(createdAt)}
          </Text>

          <IconButton
            icon={acceptedAnswerId ? "check-circle" : "help-circle-outline"}
            iconColor={theme.colors.primary}
            accessibilityLabel="Respuesta aceptada"
            size={18}
            style={styles.iconButton}
          />
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <ToggleableProfilePicture
            file={user.userInformation.profilePicture}
            editable={false}
            size={28}
            isBlocked={user.isBlocked}
          />
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={[styles.userName, { color: theme.colors.onSurface }]}
            >
              {user.userInformation.firstName} {user.userInformation.lastName}
            </Text>
          </View>
        </View>
        <View>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {title}
          </Text>
          <Text
            numberOfLines={fullAnswer ? undefined : 1}
            style={[styles.description, { color: theme.colors.onSurface }]}
          >
            {content}
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
  userName: {
    fontSize: 16,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  date: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "left",
  },
  iconButton: {
    padding: 0,
    margin: -10,
  },
});

export default ForumQuestionCard;
