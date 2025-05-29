import React from "react";
import { StyleSheet, ImageBackground, View } from "react-native";
import { Card, Text } from "react-native-paper";
import bannerMap from "@/utils/constants/banners";
import { CATEGORIES } from "@/utils/constants/courseDetails";
import { Course } from "@/types/course";

interface CourseCardProps {
  course: Course;
  onPress?: () => void;
  small?: boolean;
  horizontal?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onPress,
  small = false,
  horizontal = false,
}) => {
  const front_category = CATEGORIES.getFrontValue(
    course.courseDetails.category,
  );
  const image = bannerMap[front_category] || bannerMap["default"];

  return (
    <View
      style={{
        flex: horizontal ? 1 : undefined,
      }}
    >
      <Card style={styles.card} onPress={onPress}>
        <ImageBackground source={image}>
          <View style={styles.overlay}>
            {/* Contenedor para el título y la categoría */}
            <View>
              <Text style={styles.title}>{course.courseDetails.title}</Text>
              <Text style={styles.subtitle}>{front_category}</Text>
            </View>

            {/* Contenedor para la descripción */}
            {!small && (
              <View>
                <Text numberOfLines={1} style={styles.subtitle}>
                  {course.courseDetails.description}
                </Text>
              </View>
            )}
          </View>
        </ImageBackground>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
  },
  overlay: {
    padding: 8,
    gap: 16,
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  subtitle: {
    color: "white",
    fontSize: 12,
  },
});

export default CourseCard;
