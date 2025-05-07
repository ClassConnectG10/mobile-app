import React from "react";
import { StyleSheet, ImageBackground, View } from "react-native";
import { Card, Text } from "react-native-paper";
import CourseInfo from "@/types/courseInfo";
import bannerMap from "@/utils/constants/banners";

const CourseCard: React.FC<CourseInfo> = ({
  name,
  code,
  description,
  category,
}) => {
  const image = bannerMap[category] || bannerMap["default"];

  return (
    <Card style={styles.card}>
      <ImageBackground
        source={image}
        style={styles.image}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>{`${code}\n${description}`}</Text>
        </View>
      </ImageBackground>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "transparent", // Optional
  },
  image: {
    height: 100,
    justifyContent: "flex-end",
  },
  imageStyle: {
    resizeMode: "cover",
  },
  overlay: {
    padding: 8,
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
