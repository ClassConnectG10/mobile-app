import { Button, Divider, Surface, Text, TextInput, useTheme } from "react-native-paper";
import { Pressable, StyleSheet, View } from 'react-native';
import { Link, Stack } from "expo-router";

export default function LoginPage() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Surface style={styles.logo} elevation={4}>
        <Text variant="displaySmall">Class Connect Logo</Text>
      </Surface>
      <TextInput label="Correo electrónico"></TextInput>
      <TextInput label="Contraseña" secureTextEntry={true}></TextInput>
      <Link href="/home" asChild>
        <Button icon="login" mode='contained'>Ingresar</Button>
      </Link>
      <Divider />
      <Button icon="google" mode='outlined'>Continuar con Google</Button>
      <Button icon="microsoft" mode='outlined'>Continuar con Microsoft</Button>
      <Text style={styles.linkText}>
        ¿No tenés una cuenta?{" "}
        <Link href="/register">
          <Text
            style={[styles.link, { color: theme.colors.primary }]}
          >
            Registrate
          </Text>
        </Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 20,
  },
  logo: {
    paddingVertical: 40,
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  loginContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  linkText: {
    textAlign: "center",
    marginTop: 20,
  },
  link: {
    textDecorationLine: "underline"
  },
});
