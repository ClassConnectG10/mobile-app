import UserCard from "@/components/cards/UserCard";
import { getUser } from "@/services/userManagement";
import {
  getCourseAssistants,
  getCourseStudents,
  removeAssistantFromCourse,
  removeStudentFromCourse,
} from "@/services/courseManagement";
import { Course, UserRole } from "@/types/course";
import { User } from "@/types/user";
import { useUserContext } from "@/utils/storage/userContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SectionList, View } from "react-native";
import {
  ActivityIndicator,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import { AlertDialog } from "@/components/AlertDialog";

interface ParticipantsTabProps {
  course: Course;
}

export const ParticipantsTab: React.FC<ParticipantsTabProps> = ({ course }) => {
  const router = useRouter();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [courseOwner, setCourseOwner] = useState<User | null>(null);
  const [assistants, setAssistants] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserRole, setSelectedUserRole] = useState<
    UserRole.STUDENT | UserRole.ASSISTANT | null
  >(null);
  const [showConfirmationRemove, setShowConfirmationRemove] = useState(false);

  const userContext = useUserContext();

  const participantsSections = [
    {
      title: "Docente titular",
      data: [courseOwner],
    },
    {
      title: "Asistentes",
      data: assistants,
    },
    {
      title: "Estudiantes",
      data: students,
    },
  ];

  async function fetchIsOwner() {
    if (!course.ownerId || !userContext.user) return;

    setIsOwner(course.ownerId === userContext.user?.id);
  }

  async function fetchCourseOwner() {
    try {
      setIsLoading(true);
      const courseOwner = await getUser(course.ownerId);
      setCourseOwner(courseOwner);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleUserPress = (user: User) => {
    if (!userContext.user) return;

    if (user.id === userContext.user.id) {
      router.push("/users/me");
    } else {
      router.push({
        pathname: "/users/[userId]",
        params: { userId: user.id },
      });
    }
  };

  async function fetchAssistants() {
    try {
      setIsLoading(true);
      const assistants = await getCourseAssistants(course.courseId);
      setAssistants(assistants);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchStudents() {
    try {
      setIsLoading(true);
      const students = await getCourseStudents(course.courseId);
      setStudents(students);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchIsOwner();
    fetchCourseOwner();
    fetchAssistants();
    fetchStudents();
  }, [course]);

  const handleRemoveAssistant = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      await removeAssistantFromCourse(course.courseId, selectedUser.id);
      setShowConfirmationRemove(false);
      setAssistants((prev) =>
        prev.filter((assistant) => assistant.id !== selectedUser.id)
      );
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveStudent = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      await removeStudentFromCourse(course.courseId, selectedUser.id);
      setShowConfirmationRemove(false);
      setStudents((prev) =>
        prev.filter((student) => student.id !== selectedUser.id)
      );
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ paddingHorizontal: 16, flex: 1 }}>
      {isLoading || !courseOwner ? (
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
            gap: 16,
          }}
        >
          <SectionList
            sections={participantsSections}
            keyExtractor={(item, index) => item?.id.toString() + index}
            renderItem={({ item, section }) => {
              if (!item) return null;

              if (section.title === "Docente titular") {
                return (
                  <UserCard
                    user={item}
                    onPress={() => {
                      handleUserPress(item);
                    }}
                  />
                );
              } else if (section.title === "Asistentes") {
                return (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <UserCard
                      user={item}
                      onPress={() => {
                        handleUserPress(item);
                      }}
                    />
                    {isOwner && (
                      <IconButton
                        icon="account-minus"
                        mode="contained"
                        size={24}
                        onPress={() => {
                          setShowConfirmationRemove(true);
                          setSelectedUserRole(UserRole.ASSISTANT);
                          setSelectedUser(item);
                        }}
                      />
                    )}
                  </View>
                );
              } else if (section.title === "Estudiantes") {
                return (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <UserCard
                      user={item}
                      onPress={() => {
                        handleUserPress(item);
                      }}
                    />
                    {isOwner && (
                      <IconButton
                        icon="account-minus"
                        mode="contained"
                        size={24}
                        onPress={() => {
                          setShowConfirmationRemove(true);
                          setSelectedUserRole(UserRole.STUDENT);
                          setSelectedUser(item);
                        }}
                      />
                    )}
                  </View>
                );
              }
            }}
            renderSectionHeader={({ section: { title } }) => {
              if (title === "Asistentes") {
                return (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text variant="titleMedium">{title}</Text>
                    {isOwner && (
                      <IconButton
                        icon="account-plus"
                        size={24}
                        onPress={() => {
                          router.push({
                            pathname:
                              "/courses/[courseId]/teacher/participants/addAssistants",
                            params: { courseId: course.courseId },
                          });
                        }}
                      />
                    )}
                  </View>
                );
              } else {
                return (
                  <View style={{ paddingVertical: 8 }}>
                    <Text variant="titleMedium">{title}</Text>
                  </View>
                );
              }
            }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text variant="titleMedium">No hay participantes</Text>
              </View>
            }
            renderSectionFooter={({ section }) => {
              if (section.title === "Asistentes" && section.data.length === 0) {
                return (
                  <View style={{ alignItems: "center", marginVertical: 12 }}>
                    <Text variant="bodyMedium">
                      No hay asistentes en este curso.
                    </Text>
                  </View>
                );
              }
              if (
                section.title === "Estudiantes" &&
                section.data.length === 0
              ) {
                return (
                  <View style={{ alignItems: "center", marginVertical: 12 }}>
                    <Text variant="bodyMedium">
                      No hay estudiantes inscriptos.
                    </Text>
                  </View>
                );
              }
              return null;
            }}
          />
        </View>
      )}
      <AlertDialog
        visible={showConfirmationRemove}
        onDismiss={() => setShowConfirmationRemove(false)}
        onConfirm={
          selectedUserRole === UserRole.ASSISTANT
            ? handleRemoveAssistant
            : handleRemoveStudent
        }
        content={`¿Está seguro que desea expulsar a ${
          selectedUser?.userInformation.firstName
        } ${selectedUser?.userInformation.lastName} como ${
          selectedUserRole === UserRole.ASSISTANT ? "asistente" : "estudiante"
        }?`}
        dismissText="Cancelar"
        confirmText="Expulsar"
      />
    </View>
  );
};
