import { getStudentActivity } from "@/services/activityManagement";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Appbar, Button, Text } from "react-native-paper";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { StudentActivity } from "@/types/activity";

export default function ActivityDetails() {
  const router = useRouter();
  const [studentActivity, setStudentActivity] =
    useState<StudentActivity | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { courseId: courseIdParam, activityId: activityIdParam } =
    useLocalSearchParams();
  const courseId = courseIdParam as string;
  const activityId = activityIdParam as string;

  const fetchStudentActivity = async () => {
    try {
      const activity = await getStudentActivity(courseId, activityId);
      setStudentActivity(activity);
    } catch (error) {
      setErrorMessage(`Error al obtener la actividad: ${error}`);
    }
  };

  useEffect(() => {
    fetchStudentActivity();
  }, []);

  return (
    <View>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={"Información de la actividad"} />
        <Appbar.Action icon="information-outline" />
      </Appbar.Header>
      <Text>Detalles de la actividad</Text>
      {studentActivity && (
        <View>
          <Text>{studentActivity.activity.activityDetails.title}</Text>
          <Text>{studentActivity.activity.activityDetails.description}</Text>
          <Text>{studentActivity.activity.activityDetails.instruction}</Text>
          <Text>{studentActivity.status}</Text>
        </View>
      )}
    </View>
  );
}
