import { Card, Icon, Text, useTheme } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { AssistantLog } from "@/types/assistantLog";

interface AssistantLogCardProps {
  log: AssistantLog;
  onPress?: () => void;
}

const AssistantLogCard: React.FC<AssistantLogCardProps> = ({
  log,
  onPress,
}) => {
  const theme = useTheme();

  const { logId, log: logMessage, timestamp } = log;

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
          source="clipboard-text-outline"
          size={24}
          color={theme.colors.primary}
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Log #{logId}
          </Text>
          <Text style={styles.description}>{logMessage}</Text>
          <Text style={styles.timestamp}>{timestamp.toLocaleString()}</Text>
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
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    color: "gray",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});

export default AssistantLogCard;
