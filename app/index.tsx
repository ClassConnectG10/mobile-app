import { Image, StyleSheet, View, Pressable } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View style={styles.background}>
      <Link href="/login" asChild>
        <Pressable>
          <Image
            style={styles.logo}
            resizeMode="cover"
            source={require("@/assets/images/logo.png")}
          />
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#DBC1FF",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 250,
    height: 250,
  },
});
