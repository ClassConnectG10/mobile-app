import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { getStatistics } from "@/services/statistics";
import { Course } from "@/types/course";
import { Statistics } from "@/types/statistics";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View, ScrollView } from "react-native";
import { ActivityIndicator, useTheme, Text, Icon } from "react-native-paper";

interface StatisticsTabProps {
  course: Course;
}

export const StatisticsTab: React.FC<StatisticsTabProps> = ({ course }) => {
  // const router = useRouter();
  const theme = useTheme();

  //   const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [statistics, setStatistics] = useState<Statistics | null>(null);

  const fetchStatistics = async () => {
    if (!course.courseId) return;
    setIsLoading(true);
    try {
      const fetchedStatistics = await getStatistics(course.courseId);
      setStatistics(fetchedStatistics);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStatistics();
    }, [course.courseId]),
  );

  // Componente para cada indicador
  const StatCard = ({ icon, value, label, color }) => (
    <View
      style={{
        backgroundColor: theme.colors.elevation.level1,
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 10,
        marginBottom: 8,
        alignItems: "center",
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        minWidth: 140,
        maxWidth: 220,
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
        flex: 1,
      }}
    >
      <View style={{ alignItems: "center", justifyContent: "center", width: 44 }}>
        <Icon source={icon} size={36} color={color} />
      </View>
      <View style={{ flex: 1, minWidth: 0, justifyContent: "center" }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color, textAlign: "left" }} numberOfLines={1} ellipsizeMode="tail">{value}</Text>
        <Text style={{ fontSize: 13, color: theme.colors.onSurface, marginTop: 2, textAlign: "left" }} numberOfLines={1} ellipsizeMode="tail">
          {label}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ paddingHorizontal: 16, flex: 1 }}>
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator
            animating={true}
            size="large"
            color={theme.colors.primary}
          />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              paddingVertical: 8,
              justifyContent: "space-between",
            }}
          >
            <Text variant="titleMedium">Indicadores generales</Text>
          </View>
          {statistics && (
            <ScrollView
              contentContainerStyle={{
                gap: 8,
                marginTop: 8,
                paddingBottom: 32,
              }}
              showsVerticalScrollIndicator={true}
            >
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: 8,
                  alignItems: "stretch",
                }}
              >
                <StatCard
                  icon="account-group"
                  value={statistics.studentsCount}
                  label="Inscriptos"
                  color={theme.colors.primary}
                />
                <StatCard
                  icon="clipboard-list"
                  value={statistics.publishedActivitiesCount}
                  label="Publicadas"
                  color={theme.colors.primary}
                />
                <StatCard
                  icon="clipboard-clock-outline"
                  value={statistics.unpublishedActivitiesCount}
                  label="Sin publicar"
                  color={theme.colors.primary}
                />
                <StatCard
                  icon="package-variant-closed"
                  value={statistics.completedSubmissionsCount}
                  label="Completadas"
                  color={theme.colors.primary}
                />
                <StatCard
                  icon="clock-check-outline"
                  value={statistics.onTimeSubmissions}
                  label="A tiempo"
                  color={theme.colors.primary}
                />
                <StatCard
                  icon="alert-circle-outline"
                  value={statistics.lateSubmissions}
                  label="Tarde"
                  color={theme.colors.primary}
                />
                <StatCard
                  icon="star"
                  value={statistics.overallAvgGrade?.toFixed(2) ?? "-"}
                  label="Promedio"
                  color={theme.colors.primary}
                />
                <StatCard
                  icon="timer-outline"
                  value={statistics.avgTimeDifferenceHours?.toFixed(2) ?? "-"}
                  label="Prom. tiempo (hs)"
                  color={theme.colors.primary}
                />
                <StatCard
                  icon="chart-line"
                  value={`${(statistics.completionRate * 100).toFixed(1)}%`}
                  label="Finalización"
                  color={theme.colors.primary}
                />
              </View>
            </ScrollView>
          )}
        </View>
      )}
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
};
