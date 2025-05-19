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
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onPress,
  small = false,
}) => {
  const front_category = CATEGORIES.getFrontValue(
    course.courseDetails.category
  );
  const image = bannerMap[front_category] || bannerMap["default"];

  return (
    <Card style={styles.card} onPress={onPress}>
      <ImageBackground
        source={image}
        style={styles.image}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay}>
          {/* Contenedor para el título y la categoría */}
          <View style={styles.topContent}>
            <Text style={styles.title}>{course.courseDetails.title}</Text>
            <Text style={styles.subtitle}>{front_category}</Text>
          </View>

          {/* Contenedor para la descripción */}
          {!small && (
            <View style={styles.bottomContent}>
              <Text numberOfLines={1} style={styles.subtitle}>
                {course.courseDetails.description}
              </Text>
            </View>
          )}
        </View>
      </ImageBackground>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "transparent", // Optional
  },
  image: {
    justifyContent: "space-between", // Distribuye los elementos en la parte superior e inferior
  },
  imageStyle: {
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between", // Asegura que los elementos estén separados
    padding: 8,
    gap: 16,
  },
  topContent: {
    alignItems: "flex-start", // Alinea el título y la categoría a la izquierda
  },
  bottomContent: {
    alignItems: "flex-start", // Alinea la descripción a la izquierda
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
