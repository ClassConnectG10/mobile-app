import { Card, Text, useTheme } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { ActivitySubmission } from "@/types/activity";

interface SubmissionCardProps {
  submission: ActivitySubmission;
  onPress?: () => void;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({
  submission,
  onPress,
}) => {
  const theme = useTheme();

  return (
    <Card
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {submission.studentId}
          </Text>
          <Text style={[styles.dueDate]}>
            {submission.submited ? "Entregada" : "No entregada"}
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
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dueDate: {
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

export default SubmissionCard;
