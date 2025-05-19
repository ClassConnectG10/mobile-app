import UserCard from "@/components/cards/UserCard";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import {
  addAssistantToCourse,
  getCourse,
  getCourseAssistants,
} from "@/services/courseManagement";
import { getUsers } from "@/services/userManagement";
import { Course } from "@/types/course";
import { User } from "@/types/user";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  useTheme,
  Text,
  IconButton,
  Dialog,
} from "react-native-paper";

export default function AddAssistant() {
  const router = useRouter();
  const theme = useTheme();

  const { courseId: courseIdParam } = useLocalSearchParams();
  const courseId = courseIdParam as string;

  const [course, setCourse] = useState<Course>(null);
  const [assistants, setAssistants] = useState<User[]>(null);
  const [users, setUsers] = useState<User[]>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [showConfirmationAdd, setShowConfirmationAdd] = useState(false);
  const [showConfirmationRemove, setShowConfirmationRemove] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User>(null);

  const userNotAnAssistant = (user: User): boolean => {
    if (!assistants || !course) return false;
    return (
      !assistants.some((assistant) => assistant.id === user.id) &&
      user.id !== course.ownerId
    );
  };

  async function fetchCourse() {
    if (!courseId) return;

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

  async function fetchAssistants() {
    if (!courseId) return;

    setIsLoading(true);
    try {
      const assistants = await getCourseAssistants(courseId);
      setAssistants(assistants);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setCourse(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchUsers() {
    if (!assistants) return;

    setIsLoading(true);
    try {
      const users = await getUsers();
      const filteredUsers = users.filter(userNotAnAssistant);
      setUsers(filteredUsers);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [assistants]);

  useEffect(() => {
    fetchCourse();
    fetchAssistants();
  }, [courseId]);

  const handleAddAssistant = async () => {
    if (!courseId || !selectedUser) return;

    setIsLoading(true);
    try {
      await addAssistantToCourse(courseId, selectedUser.id);
      setShowConfirmationAdd(false);
      setSelectedUser(null);
      setAssistants((prev) => [...(prev || []), selectedUser]);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

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
          <Appbar.Content title={"Adminsitrar asistentes"} />
        </Appbar.Header>
        {isLoading || !course || !assistants || !users ? (
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
          <>
            <View
              style={{
                padding: 16,
                gap: 16,
              }}
            >
              <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View
                    style={{
                      backgroundColor: theme.colors.background,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <UserCard user={item} />
                    <IconButton
                      icon="plus"
                      mode="contained"
                      size={24}
                      onPress={() => {
                        setShowConfirmationAdd(true);
                        setSelectedUser(item);
                      }}
                    />
                  </View>
                )}
                ListEmptyComponent={
                  <View
                    style={{
                      flex: 1,

                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text>No hay usuarios disponibles</Text>
                  </View>
                }
                ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
              />
            </View>
          </>
        )}
        <View style={{ paddingVertical: 4 }}></View>
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />

      <Dialog
        visible={showConfirmationAdd}
        onDismiss={() => setShowConfirmationAdd(false)}
      >
        <Dialog.Title>Atención</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            ¿Está seguro que desea agregar a{" "}
            {selectedUser?.userInformation.firstName}{" "}
            {selectedUser?.userInformation.lastName} como asistente?
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowConfirmationAdd(false)}>
            Cancelar
          </Button>
          <Button onPress={handleAddAssistant}>Agregar</Button>
        </Dialog.Actions>
      </Dialog>
    </>
  );
}
