import {
  Button,
  Card,
  Icon,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import { Pressable, StyleSheet, View } from "react-native";
import { ForumAnswer } from "@/types/forum";
import { User } from "@/types/user";
import { ToggleableProfilePicture } from "../forms/ToggleableProfilePicture";
import { formatLocalDateTime } from "@/utils/date";
import { formatNumberToString } from "@/utils/number";

interface ForumAnswerCardProps {
  user: User;
  forumAnswer: ForumAnswer;
  showAccepted?: boolean;
  accepted?: boolean;
  onAcceptedPress?: () => void;
  onVotePress?: (voteType: 0 | 1 | -1) => void;
  onPress?: () => void;
}

const ForumAnswerCard: React.FC<ForumAnswerCardProps> = ({
  user,
  forumAnswer,
  showAccepted = false,
  accepted = false,
  onAcceptedPress = () => {},
  onVotePress = () => {},
  onPress = () => {},
}) => {
  const theme = useTheme();
  const { content, file } = forumAnswer.information;
  const { createdAt } = forumAnswer;

  return (
    <Pressable onPress={onPress}>
      <View style={[styles.card, { backgroundColor: theme.colors.onPrimary }]}>
        <View style={{ flex: 1, gap: 8 }}>
          <View style={[styles.row, { justifyContent: "space-between" }]}>
            <Text
              style={[styles.date, { color: theme.colors.onSurfaceVariant }]}
            >
              Publicado el {formatLocalDateTime(createdAt)}
            </Text>

            {showAccepted && ( // TODO: traer si la respuesta es aceptada o si soy el creador de la pregunta
              <IconButton
                icon={accepted ? "check-circle" : "check-circle-outline"}
                iconColor={theme.colors.primary}
                accessibilityLabel="Respuesta aceptada"
                onPress={onAcceptedPress}
                size={18}
                style={styles.iconButton}
              />
            )}
          </View>
          <View style={[styles.row, { justifyContent: "space-between" }]}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
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
                  {user.userInformation.firstName}{" "}
                  {user.userInformation.lastName}
                </Text>
              </View>
            </View>
          </View>
          <Text style={[styles.content, { color: theme.colors.onSurface }]}>
            {content}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {file && (
                <IconButton
                  icon="paperclip"
                  iconColor={theme.colors.primary}
                  accessibilityLabel="Archivo adjunto"
                  size={18}
                  style={styles.iconButton}
                />
              )}

              <Button
                icon="comment-outline"
                mode="text"
                onPress={onPress}
                accessibilityLabel="Respuesta"
                style={styles.iconButton}
              >
                {formatNumberToString(forumAnswer.answerCount)}
              </Button>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Button
                icon={forumAnswer.vote === 1 ? "thumb-up" : "thumb-up-outline"}
                mode="text"
                onPress={
                  forumAnswer.vote === 1
                    ? () => onVotePress(0)
                    : () => onVotePress(1)
                }
                accessibilityLabel="Me gusta"
                style={styles.iconButton}
              >
                {formatNumberToString(forumAnswer.upVotes)}
              </Button>
              <Button
                icon={
                  forumAnswer.vote === -1 ? "thumb-down" : "thumb-down-outline"
                }
                mode="text"
                onPress={
                  forumAnswer.vote === -1
                    ? () => onVotePress(0)
                    : () => onVotePress(-1)
                }
                accessibilityLabel="No me gusta"
                style={styles.iconButton}
              >
                {formatNumberToString(forumAnswer.downVotes)}
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    elevation: 0,
    shadowColor: "transparent",
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    fontSize: 14,
  },
  userName: {
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  date: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "left",
  },
  responses: {
    fontSize: 16,
    fontWeight: "500",
  },
  iconButton: {
    padding: 0,
    margin: 0,
  },
});

export default ForumAnswerCard;
