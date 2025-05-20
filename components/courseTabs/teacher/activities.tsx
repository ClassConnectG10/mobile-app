import { getCourse } from "@/services/courseManagement";
import { useCourseContext } from "@/utils/storage/courseContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  useTheme,
  Text,
  SegmentedButtons,
  Button,
} from "react-native-paper";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { View } from "react-native";
import ActivityCard from "@/components/cards/ActivityCard";

import {
  ActivitiesOption,
  ActivityType,
  TeacherActivity,
  TeacherActivityFilter,
} from "@/types/activity";
import { useUserContext } from "@/utils/storage/userContext";
import { getCourseTeacherActivities } from "@/services/activityManagement";
import { FlatList } from "react-native";
import { FullScreenModal } from "@/components/FullScreenModal";
import { FloatingActionButton } from "@/components/FloatingActionButton";

export default function ActivitiesTab() {
  const router = useRouter();
  const theme = useTheme();

  const { courseId: courseIdParam } = useLocalSearchParams();
  const courseId = courseIdParam as string;
  const [newActivityModalVisible, setNewActivityModalVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const userContext = useUserContext();

  const [activitiesOption, setActivitiesOption] = useState(
    ActivitiesOption.ALL
  );

  const [publishedActivitiesOption, setPublishedActivitiesOption] = useState(
    TeacherActivityFilter.ALL
  );

  const [isOwner, setIsOwner] = useState(null);

  const [activities, setActivities] = useState<TeacherActivity[]>(null);

  const [filteredActivities, setFilteredActivities] =
    useState<TeacherActivity[]>(null);

  const courseContext = useCourseContext();
  const { setCourse } = courseContext;

  async function fetchCourse() {
    if (!courseId || !userContext.user) return;

    setIsLoading(true);
    try {
      const course = await getCourse(courseId);
      setCourse(course);
      setIsOwner(course.ownerId === userContext.user.id);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setCourse(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchActivities() {
    if (!courseId || isOwner === null) return;

    setIsLoading(true);
    try {
      const activities = await getCourseTeacherActivities(
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
      if (publishedActivitiesOption === TeacherActivityFilter.ALL) {
        return true;
      }
      if (publishedActivitiesOption === TeacherActivityFilter.PUBLISHED) {
        return activity.visible;
      }
      if (publishedActivitiesOption === TeacherActivityFilter.UNPUBLISHED) {
        return !activity.visible;
      }
    });

    setFilteredActivities(filterByStatus);
  };

  const handleActivitiesOptionChange = (value: ActivitiesOption) => {
    setActivitiesOption(
      activitiesOption === value ? ActivitiesOption.ALL : value
    );
  };

  const handlePublishedActivitiesOptionChange = (
    value: TeacherActivityFilter
  ) => {
    setPublishedActivitiesOption(
      publishedActivitiesOption === value ? TeacherActivityFilter.ALL : value
    );
  };

  const handleActivitiesPress = (activityId: number) => {
    router.push({
      pathname: "/courses/[courseId]/teacher/activities/[activityId]",
      params: { courseId, activityId },
    });
  };

  const handleCreateActivityPress = (activityType: ActivityType) => {
    setNewActivityModalVisible(false);

    if (activityType === ActivityType.TASK) {
      router.push({
        pathname: "/courses/[courseId]/teacher/activities/tasks/create",
        params: { courseId },
      });
    } else if (activityType === ActivityType.EXAM) {
      router.push({
        pathname: "/courses/[courseId]/teacher/activities/exams/create",
        params: { courseId },
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

  useEffect(() => {
    filterActivities();
  }, [activitiesOption, publishedActivitiesOption, activities, isOwner]);

  useEffect(() => {
    fetchActivities();
  }, [courseId, isOwner]);

  useEffect(() => {
    fetchCourse();
  }, [courseId, userContext.user]);

  return (
    <>
      <View style={{ paddingHorizontal: 16, flex: 1 }}>
        {isLoading ||
        !courseContext.course ||
        isOwner === null ||
        !filteredActivities ? (
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
            {/* Filter de actividades entregadas y/o publicadas */}

            <SegmentedButtons
              value={publishedActivitiesOption}
              onValueChange={handlePublishedActivitiesOptionChange}
              buttons={[
                {
                  value: TeacherActivityFilter.PUBLISHED,
                  label: "Visibles",
                  icon: "eye-outline",
                  disabled: isLoading,
                },
                {
                  value: TeacherActivityFilter.UNPUBLISHED,
                  label: "No visibles",
                  icon: "eye-off-outline",
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
                    onPress={() =>
                      handleActivitiesPress(item.activity.resourceId)
                    }
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
      <FloatingActionButton
        onPress={() => {
          setNewActivityModalVisible(true);
        }}
      />
      <FullScreenModal
        visible={newActivityModalVisible}
        onDismiss={() => {
          setNewActivityModalVisible(false);
        }}
        children={
          <>
            <Button
              mode="contained"
              icon="file-document"
              onPress={() => {
                handleCreateActivityPress(ActivityType.TASK);
              }}
            >
              Crear una nueva tarea
            </Button>

            <Button
              mode="contained"
              icon="test-tube"
              onPress={() => {
                handleCreateActivityPress(ActivityType.EXAM);
              }}
            >
              Crear un nuevo examen
            </Button>
          </>
        }
      />

      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}

// const styles = StyleSheet.create({});
