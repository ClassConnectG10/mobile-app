import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import UserCard from "@/components/cards/UserCard";
import { getUser } from "@/services/userManagement";
import { User } from "@/types/user";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, View } from "react-native";
import { ActivityIndicator, Appbar, useTheme, Text } from "react-native-paper";
import { AssistantLog } from "@/types/assistantLog";
import { getAssistantLogs } from "@/services/courseManagement";
import AssistantLogCard from "@/components/cards/AssistantLog";

export default function TeacherSubmissionPage() {
  const theme = useTheme();
  const router = useRouter();
  const { courseId: courseIdParam, assistantId: assistantIdParam } =
    useLocalSearchParams();

  const courseId = courseIdParam as string;
  const assistantId = assistantIdParam as string;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [assistant, setAssistant] = useState<User | null>(null);
  const [assistantLogs, setAssistantLogs] = useState<AssistantLog[] | null>(
    null,
  );

  async function fetchAssistant() {
    if (!assistantId) return;
    setIsLoading(true);

    try {
      const assistantData = await getUser(Number(assistantId));
      setAssistant(assistantData);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchAssistantLogs() {
    if (!assistantId) return;
    setIsLoading(true);

    try {
      const logs = await getAssistantLogs(courseId, Number(assistantId));
      setAssistantLogs(logs);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAssistantPress = () => {
    router.push({
      pathname: `/users/[userId]`,
      params: {
        userId: assistantId,
      },
    });
  };

  useFocusEffect(
    useCallback(() => {
      fetchAssistant();
      fetchAssistantLogs();
    }, [courseId, assistantId]),
  );

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content
            title={
              assistant
                ? `${assistant.userInformation.firstName} ${assistant.userInformation.lastName}`
                : "Detalles del asistente"
            }
          />
        </Appbar.Header>
        {isLoading || !assistant || assistantLogs === null ? (
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
          <FlatList
            data={assistantLogs}
            keyExtractor={(item) => item.logId.toString()}
            ListHeaderComponent={
              <UserCard user={assistant} onPress={handleAssistantPress} />
            }
            contentContainerStyle={{ padding: 16, gap: 8 }}
            renderItem={({ item }) => (
              <AssistantLogCard log={item} onPress={() => {}} />
            )}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text>No se encontraron registros para este asistente</Text>
              </View>
            }
          />
        )}
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
