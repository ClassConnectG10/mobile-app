import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native-paper";
import { UserRole } from "@/types/course";

export default function CourseLayout() {
  const router = useRouter();
  const { courseId, role } = useLocalSearchParams<{
    courseId: string;
    role: UserRole;
  }>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectIfOnIndex = async () => {
      if (role === UserRole.STUDENT) {
        router.replace({
          pathname: "/courses/[courseId]/student",
          params: {
            courseId,
          },
        });
      } else if (role === UserRole.OWNER || role === UserRole.ASSISTANT) {
        router.replace({
          pathname: "/courses/[courseId]/teacher",
          params: {
            courseId,
          },
        });
      } else if (role === UserRole.NON_PARTICIPANT) {
        router.replace({
          pathname: "/courses/[courseId]/inscription",
          params: {
            courseId,
          },
        });
      }

      setLoading(false);
    };

    redirectIfOnIndex();
  }, [courseId, role]);

  if (loading) return <ActivityIndicator animating />;

  return <Stack />;
}
