import { FlatList, View } from "react-native";
import { Text } from "react-native-paper";
import { StatCard, StatCardProps } from "./cards/StatisticsIndicatorCard";

interface ListStatCardProps {
  title: string;
  indicators: StatCardProps[];
}

export const ListStatCard: React.FC<ListStatCardProps> = ({
  title,
  indicators,
}) => (
  <>
    <Text
      style={{
        fontWeight: "bold",
        fontSize: 18,
        marginTop: 16,
        marginBottom: 8,
      }}
    >
      {title}
    </Text>
    <FlatList
      data={indicators}
      keyExtractor={(item) => item.label}
      numColumns={2}
      scrollEnabled={false}
      columnWrapperStyle={{ gap: 16 }}
      contentContainerStyle={{ gap: 16 }}
      renderItem={({ item }) => (
        <View style={{ flex: 1 }}>
          <StatCard {...item} />
        </View>
      )}
    />
  </>
);
