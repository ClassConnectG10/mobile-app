import { getCourse } from "@/services/courseManagement";
import { useCourseContext } from "@/utils/storage/courseContext";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  useTheme,
  Text,
  SegmentedButtons,
} from "react-native-paper";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { View } from "react-native";
import ActivityCard from "@/components/cards/ActivityCard";

import {
  ActivitiesOption,
  ActivityType,
  StudentActivity,
  StudentActivityFilter,
} from "@/types/activity";
import { useUserContext } from "@/utils/storage/userContext";
import { getCourseStudentActivities } from "@/services/activityManagement";
import { FlatList } from "react-native";

export default function CoursePage() {
  const router = useRouter();
  const theme = useTheme();

  const { courseId: courseIdParam } = useLocalSearchParams();
  const courseId = courseIdParam as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const userContext = useUserContext();

  const [activitiesOption, setActivitiesOption] = useState(
    ActivitiesOption.ALL
  );
  const [submitteedActivitiesOption, setSubmitteedActivitiesOption] = useState(
    StudentActivityFilter.ALL
  );

  const [activities, setActivities] = useState<StudentActivity[]>(null);

  const [filteredActivities, setFilteredActivities] =
    useState<StudentActivity[]>(null);

  const courseContext = useCourseContext();
  const { setCourse } = courseContext;

  async function fetchCourse() {
    if (!courseId || !userContext.user) return;

    setIsLoading(true);
    try {
      const course = await getCourse(courseId);
      setCourse(course);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setCourse(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchActivities() {
    if (!courseId === null) return;
    setIsLoading(true);
    try {
      const activities = await getCourseStudentActivities(
        courseId,
        activitiesOption
      );

      setActivities(activities);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const filterActivities = async () => {
    if (!activities) return;

    const filterByType = activities.filter((activity) => {
      if (activitiesOption === ActivitiesOption.TASKS) {
        return activity.activity.type === ActivityType.TASK;
      }
      if (activitiesOption === ActivitiesOption.EXAMS) {
        return activity.activity.type === ActivityType.EXAM;
      }
      return true;
    });

    const filterByStatus = filterByType.filter((activity) => {
      if (submitteedActivitiesOption === StudentActivityFilter.ALL) {
        return true;
      }
      if (submitteedActivitiesOption === StudentActivityFilter.PENDING) {
        return !activity.submited;
      }
      if (submitteedActivitiesOption === StudentActivityFilter.SUBMITTED) {
        return activity.submited;
      }
    });

    setFilteredActivities(filterByStatus);
  };

  const handleActivitiesOptionChange = (value: ActivitiesOption) => {
    setActivitiesOption(
      activitiesOption === value ? ActivitiesOption.ALL : value
    );
  };

  const handleSubmitteedActivitiesOptionChange = (
    value: StudentActivityFilter
  ) => {
    setSubmitteedActivitiesOption(
      submitteedActivitiesOption === value ? StudentActivityFilter.ALL : value
    );
  };

  const handleActivitiesPress = (studentActivity: StudentActivity) => {
    const activityId = studentActivity.activity.resourceId;
    if (studentActivity.activity.type === ActivityType.TASK) {
      router.push({
        pathname: "/courses/[courseId]/student/activities/tasks/[taskId]",
        params: { courseId, taskId: activityId },
      });
    } else if (studentActivity.activity.type === ActivityType.EXAM) {
      router.push({
        pathname: "/courses/[courseId]/student/activities/exams/[examId]",
        params: { courseId, examId: activityId },
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchActivities(), fetchCourse()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      filterActivities();
    }, [activitiesOption, submitteedActivitiesOption, activities])
  );

  useFocusEffect(
    useCallback(() => {
      fetchActivities();
    }, [courseId])
  );

  useFocusEffect(
    useCallback(() => {
      fetchCourse();
    }, [courseId, userContext.user])
  );

  return (
    <>
      <View style={{ paddingHorizontal: 16, flex: 1 }}>
        {isLoading || !courseContext.course || !filteredActivities ? (
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
          <View style={{ gap: 16, flex: 1 }}>
            <SegmentedButtons
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 100,
              }}
              value={activitiesOption}
              onValueChange={handleActivitiesOptionChange}
              buttons={[
                {
                  value: ActivitiesOption.TASKS,
                  label: "Tareas",
                  icon: "file-document",
                  disabled: isLoading,
                },
                {
                  value: ActivitiesOption.EXAMS,
                  label: "Exámenes",
                  icon: "test-tube",
                  disabled: isLoading,
                },
              ]}
            />

            <SegmentedButtons
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 100,
              }}
              value={submitteedActivitiesOption}
              onValueChange={handleSubmitteedActivitiesOptionChange}
              buttons={[
                {
                  value: StudentActivityFilter.SUBMITTED,
                  label: "Entregadas",
                  icon: "check-circle-outline",
                  disabled: isLoading,
                },
                {
                  value: StudentActivityFilter.PENDING,
                  label: "No entregadas",
                  icon: "circle-outline",
                  disabled: isLoading,
                },
              ]}
            />
            <View style={{ flex: 1 }}>
              {/* Lista de actividades */}
              <FlatList
                data={filteredActivities}
                keyExtractor={(item) => item.activity.resourceId.toString()}
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                renderItem={({ item }) => (
                  <ActivityCard
                    activity={item}
                    onPress={() => handleActivitiesPress(item)}
                  />
                )}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                ListEmptyComponent={
                  isLoading ? (
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
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text variant="titleMedium">
                        No se encontraron actividades
                      </Text>
                    </View>
                  )
                }
              />
            </View>
          </View>
        )}
        <View style={{ paddingVertical: 4 }}></View>
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
