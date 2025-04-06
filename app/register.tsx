import { Button, Divider, TextInput, useTheme } from "react-native-paper";
import { StyleSheet, ScrollView, View, Image } from "react-native";
import { Link, Stack } from "expo-router";

export default function RegisterPage() {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.mainContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View
        style={[
          styles.logoContainer,
          { backgroundColor: theme.colors.primaryContainer },
        ]}
      >
        <Image
          style={styles.logo}
          resizeMode="cover"
          source={require("@/assets/images/logo.png")}
        />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <TextInput label="Nombres"></TextInput>
        <TextInput label="Apellidos"></TextInput>
        <Divider />
        <TextInput label="Correo electrónico"></TextInput>
        <TextInput label="Contraseña" secureTextEntry={true}></TextInput>
        <TextInput
          label="Repetir contraseña"
          secureTextEntry={true}
        ></TextInput>
        <Link href="/home" asChild>
          <Button icon="account-plus" mode="contained">
            Registrar
          </Button>
        </Link>
        <Divider />
        <Button icon="google" mode="outlined">
          Continuar con Google
        </Button>
        <Button icon="microsoft" mode="outlined">
          Continuar con Microsoft
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 20,
    paddingBottom: 40,
    justifyContent: "center",
    gap: 20,
  },
  logo: {
    width: 150,
    height: 150,
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
    textDecorationLine: "underline",
  },
  logoContainer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
});
