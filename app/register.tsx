import { Button, Divider, Surface, Text, TextInput, useTheme } from "react-native-paper";
import { StyleSheet, ScrollView, View } from 'react-native';
import { Link, Stack } from "expo-router";

export default function RegisterPage() {
  // const theme = useTheme();

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <Surface style={styles.logo} elevation={4}>
        <Text variant="displaySmall">Class Connect Logo</Text>
      </Surface>


      <ScrollView style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <TextInput label="Nombres"></TextInput>
        <TextInput label="Apellidos"></TextInput>
        <TextInput label="Teléfono"></TextInput>
        <Divider />
        <TextInput label="Correo electrónico"></TextInput>
        <TextInput label="Contraseña" secureTextEntry={true}></TextInput>
        <TextInput label="Repetir contraseña" secureTextEntry={true}></TextInput>
        <Link href="/home" asChild>
          <Button icon="account-plus" mode='contained'>Registrar</Button>
        </Link>
        <Divider />
        <Button icon="google" mode='outlined'>Continuar con Google</Button>
        <Button icon="microsoft" mode='outlined'>Continuar con Microsoft</Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 40,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    justifyContent: "center",
    gap: 20,
  },
  logo: {
    marginTop: 40,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 40,
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
