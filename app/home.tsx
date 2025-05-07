import { ScrollView, StyleSheet, View } from "react-native";
import { Appbar, FAB } from "react-native-paper";
import { router } from "expo-router";
import CourseCard from "@/components/CourseCard";
import { getCoursesByUser } from "@/services/courses";
import { useEffect, useState } from "react";
import CourseInfo from "@/types/courseInfo";

export default function HomePage() {
  const [courses, setCourses] = useState<CourseInfo[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getCoursesByUser();
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => {}} />
        <Appbar.Content title="Class Connect" />
        <Appbar.Action
          icon="account"
          onPress={() => router.push("/userProfile")}
        />
      </Appbar.Header>

      {/* Main scrollable content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {courses.map((course, index) => (
          <CourseCard
            key={index}
            name={course.name}
            description={course.description}
            code={course.code}
            category={course.category}
          />
        ))}
      </ScrollView>

      {/* Floating action button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/createCourse")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
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
});
