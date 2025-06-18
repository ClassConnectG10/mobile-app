import { Card, Icon, Text, useTheme } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { ForumAnswer } from "@/types/forum";
import { User } from "@/types/user";

interface ForumAnswerCardProps {
  user: User;
  forumAnswer: ForumAnswer;
  onPress?: () => void;
}

const ForumAnswerCard: React.FC<ForumAnswerCardProps> = ({
  user,
  forumAnswer,
  onPress,
}) => {
  const theme = useTheme();
  const { content, file } = forumAnswer.information;
  const { createdAt, creatorId } = forumAnswer;
 
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
        
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {content}
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

export default ForumAnswerCard;
