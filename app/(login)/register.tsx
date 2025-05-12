import { Button, Divider, TextInput, useTheme, Text } from "react-native-paper";
import { ScrollView, View, Image } from "react-native";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { signUp } from "@/services/auth/authUtils";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { globalStyles } from "@/styles/globalStyles";
import { registerSchema } from "@/validations/users";
import { ZodError } from "zod";

export default function RegisterPage() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const handleRegister = async () => {
    setButtonDisabled(true);

    try {
      registerSchema.parse({
        email,
        password,
        confirmPassword,
      });

      const response = await signUp(email, password);
      console.log("Response data:", response);
      router.replace("/registerDetails");
    } catch (error) {
      if (error instanceof ZodError) {
        setErrorMessage(error.errors[0].message);
      } else if (error instanceof Error) {
        console.error(error);
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Error al registrar el usuario");
      }
    } finally {
      setButtonDisabled(false);
    }
  };

  return (
    <View
      style={[
        globalStyles.mainContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View
        style={[
          globalStyles.logoContainer,
          { backgroundColor: theme.colors.primaryContainer },
        ]}
      >
        <Image
          style={globalStyles.logo}
          resizeMode="cover"
          source={require("@/assets/images/logo.png")}
        />
      </View>

      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={globalStyles.contentContainer}
      >
        <TextInput
          label="Correo electrónico"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        ></TextInput>
        <TextInput
          label="Contraseña"
          autoCapitalize="none"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        ></TextInput>
        <TextInput
          label="Repetir contraseña"
          autoCapitalize="none"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        ></TextInput>
        <Button
          icon="account-plus"
          mode="contained"
          disabled={buttonDisabled}
          onPress={handleRegister}
        >
          Registrar
        </Button>
        <Divider />
        <Button icon="google" mode="outlined">
          Continuar con Google
        </Button>
        <Button icon="microsoft" mode="outlined">
          Continuar con Microsoft
        </Button>
        <Text style={globalStyles.linkText}>
          ¿Ya tenés una cuenta?{" "}
          <Link href="/login">
            <Text style={[globalStyles.link, { color: theme.colors.primary }]}>
              Iniciá sesión
            </Text>
          </Link>
        </Text>
      </ScrollView>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
}
