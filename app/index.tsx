import { Image, StyleSheet, View, Pressable  } from 'react-native';
import { Link, Stack } from "expo-router";

export default function Index() {

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Link href="/login" asChild>
        <Pressable>
          <Image style={styles.image} 
            source={require('@/assets/images/react-logo.png')}
          ></Image>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  image: {
    width: 200,
    height: 200,
  },
});
