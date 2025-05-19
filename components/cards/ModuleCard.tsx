import { Card, Icon, Text, useTheme } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { CourseModule } from "@/types/course";

interface ModuleCardProps {
  module: CourseModule;
  onPress?: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onPress }) => {
  const theme = useTheme();
  const { title, description } = module.courseModuleDetails;

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
        <Icon source="book" size={24} color={theme.colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {title}
          </Text>
          <Text style={styles.description}>{description}</Text>
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

export default ModuleCard;
