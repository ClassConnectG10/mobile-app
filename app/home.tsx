import { Text } from "react-native-paper";
import { View } from "react-native";
import { Stack } from "expo-router";

export default function HomePage() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Stack.Screen
                name="home"
                // i want to show the header with the title "Home" but NO back button
                options={{
                    title: "Home",
                    headerShown: true,
                    headerBackVisible: false,
                    headerTitleAlign: "center",
                    headerStyle: {
                        backgroundColor: "#6200ee",
                    },
                    headerTintColor: "#fff",
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                    
                }}
            ></Stack.Screen>
            <Text>Home</Text>
        </View>
    );
}