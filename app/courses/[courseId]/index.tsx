import { getCourse } from "@/services/courseManagement";
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
import { View, ScrollView, StyleSheet } from "react-native";
import ActivityCard from "@/components/ActivityCard";

import {
  ActivitiesOption,
  ActivityType,
  StudentActivity,
  TeacherActivity,
} from "@/types/activity";
import { useUserContext } from "@/utils/storage/userContext";
import {
  getCourseStudentActivities,
  getCourseTeacherActivities,
} from "@/services/activityManagement";

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
    ActivitiesOption.ALL
  );

  const [isOwner, setIsOwner] = useState(false);

  const [studentActivities, setStudentActivities] = useState<StudentActivity[]>(
    []
  );
  const [teacherActivities, setTeacherActivities] = useState<TeacherActivity[]>(
    []
  );

  const courseContext = useCourseContext();
  const { setCourse } = courseContext;

  async function fetchCourse() {
    try {
      setIsLoading(true);
      const course = await getCourse(courseId);
      setCourse(course);
      const isCourseOwner = course.ownerId !== userContext.user?.id;
      setIsOwner(isCourseOwner); // TODO: fix this

      if (isCourseOwner) {
        const activities = await getCourseTeacherActivities(
          courseId,
          activitiesOption
        );
        console.log(activities);

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
      setCourse(null);
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

  const handleInfoPress = () => {
    router.push({
      pathname: "/courses/[courseId]/info",
      params: { courseId },
    });
  };

  const handleActivitiesPress = (activityId: string) => {
    router.push({
      pathname: "/courses/[courseId]/activities/[activityId]",
      params: { courseId, activityId },
    });
  };

  useEffect(() => {
    fetchCourse();
  });

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
        <View style={{ flexDirection: "column", padding: 16, flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              justifyContent: "space-between",
              paddingBottom: 100,
              gap: 16,
            }}
          >
            <CourseCard
              name={courseContext.course?.courseDetails.title || ""}
              description={
                courseContext.course?.courseDetails.description || ""
              }
              category={courseContext.course?.courseDetails.category || ""}
            />
            <SegmentedButtons
              value={activitiesOption}
              onValueChange={(value) => {
                handleActivitiesOptionChange(
                  (value as ActivitiesOption) || ActivitiesOption.ALL
                );
              }}
              buttons={[
                {
                  value: "tasks",
                  label: "Tareas",
                  icon: "file-document",
                  disabled: isLoading,
                },
                {
                  value: "exams",
                  label: "Exámenes",
                  icon: "test-tube",
                  disabled: isLoading,
                },
              ]}
            />
            {isOwner ? (
              <ScrollView
                contentContainerStyle={{
                  justifyContent: "space-between",
                  paddingBottom: 100,
                  gap: 8,
                }}
              >
                {teacherActivities.length === 0 ? (
                  <Text variant="bodyLarge">No hay actividades</Text>
                ) : (
                  teacherActivities.map((activity) => (
                    <ActivityCard
                      key={activity.activity.resourceId}
                      activity={activity}
                      onPress={() =>
                        handleActivitiesPress(activity.activity.resourceId)
                      }
                    />
                  ))
                )}
              </ScrollView>
            ) : (
              <ScrollView
                contentContainerStyle={{
                  justifyContent: "space-between",
                  paddingBottom: 100,
                  gap: 8,
                }}
              >
                {studentActivities.length === 0 ? (
                  <Text variant="bodyLarge">No hay actividades</Text>
                ) : (
                  studentActivities.map((activity) => (
                    <ActivityCard
                      key={activity.activity.resourceId}
                      activity={activity}
                      onPress={() =>
                        handleActivitiesPress(activity.activity.resourceId)
                      }
                    />
                  ))
                )}
              </ScrollView>
            )}
          </ScrollView>

          {isOwner && (
            <FAB
              icon="plus"
              style={styles.fab}
              onPress={() => setNewActivityModalVisible(true)}
            />
          )}
        </View>
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
            setNewActivityModalVisible(false);
            router.push({
              pathname: "/courses/[courseId]/activities/create",
              params: { courseId, activityType: ActivityType.TASK },
            });
          }}
        >
          Crear una nueva tarea
        </Button>

        <Button
          mode="contained"
          icon="test-tube"
          onPress={() => {
            setNewActivityModalVisible(false);
            router.push({
              pathname: "/courses/[courseId]/activities/create",
              params: { courseId, activityType: ActivityType.EXAM },
            });
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
    margin: 16,
    right: 0,
    bottom: 0,
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
