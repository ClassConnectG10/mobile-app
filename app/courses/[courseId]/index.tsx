import { getCourse } from "@/services/courseManagement";
import { useCourseContext } from "@/utils/storage/courseContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { FlatList } from "react-native";

export default function CoursePage() {
  const router = useRouter();
  const theme = useTheme();

  const { courseId: courseIdParam } = useLocalSearchParams();
  const courseId = courseIdParam as string;
  const [newActivityModalVisible, setNewActivityModalVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const userContext = useUserContext();

  const [activitiesOption, setActivitiesOption] = useState(
    ActivitiesOption.ALL,
  );

  const [publishedActivitiesOption, setPublishedActivitiesOption] = useState(
    TeacherActivityFilter.ALL,
  );

  const [submitteedActivitiesOption, setSubmitteedActivitiesOption] = useState(
    StudentActivityFilter.ALL,
  );

  const [isOwner, setIsOwner] = useState(false);

  const [studentActivities, setStudentActivities] = useState<StudentActivity[]>(
    [],
  );
  const [teacherActivities, setTeacherActivities] = useState<TeacherActivity[]>(
    [],
  );

  const courseContext = useCourseContext();
  const { setCourse } = courseContext;

  async function fetchCourse() {
    try {
      setIsLoading(true);
      const course = await getCourse(courseId);
      setCourse(course);
      setIsOwner(course.ownerId === userContext.user?.id);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setCourse(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchActivities() {
    try {
      if (isOwner) {
        const activities = await getCourseTeacherActivities(
          courseId,
          activitiesOption,
        );

        if (publishedActivitiesOption === TeacherActivityFilter.PUBLISHED) {
          setTeacherActivities(
            activities.filter((activity) => activity.visible),
          );
        } else if (
          publishedActivitiesOption === TeacherActivityFilter.UNPUBLISHED
        ) {
          setTeacherActivities(
            activities.filter((activity) => !activity.visible),
          );
        } else {
          setTeacherActivities(activities);
        }
      } else {
        const activities = await getCourseStudentActivities(
          courseId,
          activitiesOption,
        );

        if (submitteedActivitiesOption === StudentActivityFilter.SUBMITTED) {
          setStudentActivities(
            activities.filter((activity) => activity.submited),
          );
        } else if (
          submitteedActivitiesOption === StudentActivityFilter.PENDING
        ) {
          setStudentActivities(
            activities.filter((activity) => !activity.submited),
          );
        } else {
          setStudentActivities(activities);
        }
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleActivitiesOptionChange = (value: ActivitiesOption) => {
    if (activitiesOption === value) {
      setActivitiesOption(ActivitiesOption.ALL);
    } else {
      setActivitiesOption(value);
    }
  };

  const handleSubmitteedActivitiesOptionChange = (
    value: StudentActivityFilter,
  ) => {
    if (submitteedActivitiesOption === value) {
      setSubmitteedActivitiesOption(StudentActivityFilter.ALL);
    } else {
      setSubmitteedActivitiesOption(value);
    }
  };

  const handlePublishedActivitiesOptionChange = (
    value: TeacherActivityFilter,
  ) => {
    if (publishedActivitiesOption === value) {
      setPublishedActivitiesOption(TeacherActivityFilter.ALL);
    } else {
      setPublishedActivitiesOption(value);
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

  useEffect(() => {
    if (!courseContext.course || courseContext.course.courseId !== courseId) {
      fetchCourse();
    } else {
      setIsLoading(false);
      setIsOwner(courseContext.course.ownerId === userContext.user?.id);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchActivities();
    }, []),
  );

  useEffect(() => {
    fetchActivities();
  }, [
    activitiesOption,
    publishedActivitiesOption,
    submitteedActivitiesOption,
    isOwner,
  ]);

  return (
    <>
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
        <Appbar.Action icon="information-outline" onPress={handleInfoPress} />
      </Appbar.Header>
      {isLoading ? (
        <ActivityIndicator
          animating={true}
          size="large"
          color={theme.colors.primary}
        />
      ) : (
        <View style={{ flexDirection: "column", padding: 16, gap: 16 }}>
          {/* Card de curso */}
          <ScrollView style={{ gap: 16 }}>
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
          {/* Lista de actividades */}
          {isOwner ? (
            <FlatList
              data={teacherActivities}
              keyExtractor={(item) => item.activity.resourceId.toString()}
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
              data={studentActivities}
              keyExtractor={(item) => item.activity.resourceId.toString()}
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
      )}
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
