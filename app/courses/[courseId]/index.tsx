import {
  addCourseToFavorites,
  getCourse,
  removeCourseFromFavorites,
} from "@/services/courseManagement";
import { useCourseContext } from "@/utils/storage/courseContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Appbar,
  useTheme,
  Text,
  SegmentedButtons,
  FAB,
  Modal,
  Button,
} from "react-native-paper";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import CourseCard from "@/components/CourseCard";
import { View, StyleSheet, ScrollView } from "react-native";
import ActivityCard from "@/components/ActivityCard";

import {
  ActivitiesOption,
  ActivityType,
  StudentActivity,
  StudentActivityFilter,
  TeacherActivity,
  TeacherActivityFilter,
} from "@/types/activity";
import { useUserContext } from "@/utils/storage/userContext";
import {
  getCourseStudentActivities,
  getCourseTeacherActivities,
} from "@/services/activityManagement";
import { FlatList } from "react-native";

export default function CoursePage() {
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

  const [submitteedActivitiesOption, setSubmitteedActivitiesOption] = useState(
    StudentActivityFilter.ALL
  );

  const [isOwner, setIsOwner] = useState(null);

  const [studentActivities, setStudentActivities] =
    useState<StudentActivity[]>(null);

  const [teacherActivities, setTeacherActivities] =
    useState<TeacherActivity[]>(null);

  const [filteredStudentActivities, setFilteredStudentActivities] =
    useState<StudentActivity[]>(null);

  const [filteredTeacherActivities, setFilteredTeacherActivities] =
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
      if (isOwner) {
        const activities = await getCourseTeacherActivities(
          courseId,
          activitiesOption
        );

        setTeacherActivities(activities);
      } else {
        const activities = await getCourseStudentActivities(
          courseId,
          activitiesOption
        );

        setStudentActivities(activities);
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const filterStudentActivities = async () => {
    if (!studentActivities) return;

    const filterByType = studentActivities.filter((activity) => {
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

    setFilteredStudentActivities(filterByStatus);
  };

  const filterTeacherActivities = async () => {
    if (!teacherActivities) return;

    const filterByType = teacherActivities.filter((activity) => {
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

    setFilteredTeacherActivities(filterByStatus);
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

  const handlePublishedActivitiesOptionChange = (
    value: TeacherActivityFilter
  ) => {
    setPublishedActivitiesOption(
      publishedActivitiesOption === value ? TeacherActivityFilter.ALL : value
    );
  };

  const handleFavoritePress = async () => {
    if (!courseContext.course) return;
    setIsLoading(true);

    try {
      if (courseContext.course.isFavorite) {
        await removeCourseFromFavorites(courseContext.course.courseId);
      } else {
        await addCourseToFavorites(courseContext.course.courseId);
      }

      setCourse({
        ...courseContext.course,
        isFavorite: !courseContext.course.isFavorite,
      });
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInfoPress = () => {
    router.push({
      pathname: "/courses/[courseId]/info",
      params: { courseId },
    });
  };

  const handleStudentActivitiesPress = (activityId: number) => {
    router.push({
      pathname: "/courses/[courseId]/activities/student/[activityId]",
      params: { courseId, activityId },
    });
  };

  const handleTeacherActivitiesPress = (activityId: number) => {
    router.push({
      pathname: "/courses/[courseId]/activities/teacher/[activityId]",
      params: { courseId, activityId },
    });
  };

  const handleCreateActivityPress = (activityType: ActivityType) => {
    setNewActivityModalVisible(false);
    router.push({
      pathname: "/courses/[courseId]/activities/teacher/create",
      params: { courseId, activityType },
    });
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
    if (isOwner) {
      filterTeacherActivities();
    } else {
      filterStudentActivities();
    }
  }, [
    activitiesOption,
    publishedActivitiesOption,
    submitteedActivitiesOption,
    studentActivities,
    teacherActivities,
    isOwner,
  ]);

  useEffect(() => {
    fetchActivities();
  }, [courseId, isOwner]);

  useEffect(() => {
    fetchCourse();
  }, [courseId, userContext.user]);

  return (
    <>
      <View style={{ flex: 1, overflow: "hidden" }}>
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/home");
              }
            }}
          />
          <Appbar.Content title={courseContext.course?.courseDetails.title} />
          <Appbar.Action
            icon={courseContext.course?.isFavorite ? "heart" : "heart-outline"}
            onPress={handleFavoritePress}
            disabled={isLoading || !courseContext.course}
          />
          <Appbar.Action icon="information" onPress={handleInfoPress} />
        </Appbar.Header>
        {isLoading ||
        !courseContext.course ||
        isOwner === null ||
        (isOwner && !filteredTeacherActivities) ||
        (!isOwner && !filteredStudentActivities) ? (
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
          <View style={{ padding: 16, gap: 16, flex: 1 }}>
            {/* Card de curso */}
            <ScrollView
              style={{
                gap: 16,
                flexGrow: 0,
              }}
            >
              <CourseCard
                name={courseContext.course?.courseDetails.title || ""}
                description={
                  courseContext.course?.courseDetails.description || ""
                }
                category={courseContext.course?.courseDetails.category || ""}
              />
            </ScrollView>

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
            {isOwner ? (
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
            ) : (
              <SegmentedButtons
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
            )}
            <View style={{ flex: 1 }}>
              {/* Lista de actividades */}
              {isOwner ? (
                <FlatList
                  data={filteredTeacherActivities}
                  keyExtractor={(item) => item.activity.resourceId.toString()}
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  renderItem={({ item }) => (
                    <ActivityCard
                      activity={item}
                      onPress={() =>
                        handleTeacherActivitiesPress(item.activity.resourceId)
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
              ) : (
                <FlatList
                  data={filteredStudentActivities}
                  keyExtractor={(item) => item.activity.resourceId.toString()}
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  renderItem={({ item }) => (
                    <ActivityCard
                      activity={item}
                      onPress={() =>
                        handleStudentActivitiesPress(item.activity.resourceId)
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
              )}
            </View>
          </View>
        )}
        <View style={{ paddingVertical: 4 }}></View>
      </View>
      {isOwner && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setNewActivityModalVisible(true)}
        />
      )}
      <Modal
        visible={newActivityModalVisible}
        onDismiss={() => {
          setNewActivityModalVisible(false);
        }}
        contentContainerStyle={styles.modalContainer}
        style={styles.modalContent}
      >
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
      </Modal>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
    elevation: 5,
    gap: 16,
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
