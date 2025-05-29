import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { ListStatCard } from "@/components/ListStatCard";
import { getStatistics } from "@/services/statistics";
import { Course } from "@/types/course";
import { Statistics } from "@/types/statistics";
import { customColors } from "@/utils/constants/colors";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View, ScrollView } from "react-native";
import { ActivityIndicator, useTheme } from "react-native-paper";

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
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          {statistics && (
            <>
              {/* Curso */}
              <ListStatCard
                title={"Curso"}
                indicators={[
                  {
                    icon: "account-multiple",
                    value: statistics.studentsCount,
                    label: "Estudiantes",
                    color: theme.colors.primary,
                  },
                ]}
              />
              {/* Actividades */}
              <ListStatCard
                title={"Actividades"}
                indicators={[
                  {
                    icon: "star",
                    value: statistics.overallAvgGrade?.toFixed(2) ?? "-",
                    label: "Promedio",
                    color: theme.colors.primary,
                  },
                  {
                    icon: "check-circle",
                    value: `${(statistics.completionRate * 100).toFixed(2)} %`,
                    label: "Finalización",
                    color: theme.colors.primary,
                  },
                  {
                    icon: "clipboard-check",
                    value: statistics.publishedActivitiesCount,
                    label: "Publicadas",
                    color: customColors.success,
                  },
                  {
                    icon: "clipboard-remove",
                    value: statistics.unpublishedActivitiesCount,
                    label: "Sin publicar",
                    color: customColors.error,
                  },
                ]}
              />
              {/* Entregas */}
              <ListStatCard
                title={"Entregas"}
                indicators={[
                  {
                    icon: "email-open",
                    value: statistics.completedSubmissionsCount,
                    label: "Entregas",
                    color: theme.colors.primary,
                  },
                  {
                    icon: "timer-sand",
                    value:
                      (statistics.avgTimeDifferenceHours?.toFixed(2) ?? "-") +
                      " hs",
                    label: "Retraso promedio",
                    color: customColors.warning,
                  },
                  {
                    icon: "clock-check",
                    value: statistics.onTimeSubmissions,
                    label: "A tiempo",
                    color: customColors.success,
                  },
                  {
                    icon: "clock-alert",
                    value: statistics.lateSubmissions,
                    label: "Tarde",
                    color: customColors.error,
                  },
                ]}
              />
            </>
          )}
        </ScrollView>
      )}
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
};
