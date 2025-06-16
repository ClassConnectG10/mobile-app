import { Card, Icon, Text, useTheme } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { Resource } from "@/types/resources";
import { ForumQuestion } from "@/types/forum";
import { User } from "@/types/user";

interface ForumQuestionCardProps {
  user: User;
  forumQuestion: ForumQuestion;
  onPress?: () => void;
}

const ForumQuestionCard: React.FC<ForumQuestionCardProps> = ({
  user,
  forumQuestion,
  onPress,
}) => {
  const theme = useTheme();
  const { title } = forumQuestion.information;
  const { createdAt, acceptedAnswerId } = forumQuestion;

  return (
    <Card
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.onPrimary,
        },
      ]}
    >
      <View style={styles.row}>
        <Icon
          source={
            acceptedAnswerId
              ? "check-circle-outline"
              : "checkbox-blank-circle-outline"
          }
          size={24}
          color={theme.colors.primary}
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {title}
          </Text>
          <Text numberOfLines={1} style={styles.description}>
            Publicada por {user.userInformation.firstName}{" "}
            {user.userInformation.lastName} el {createdAt.toDateString()}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    elevation: 0,
    shadowColor: "transparent",
    flex: 1,
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
});

export default ForumQuestionCard;
