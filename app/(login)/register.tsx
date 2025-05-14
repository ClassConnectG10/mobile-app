import { Button, Divider, TextInput, useTheme, Text } from "react-native-paper";
import { View, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
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

      await signUp(email, password);
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
    <>
      <View
        style={{
          backgroundColor: theme.colors.onPrimary,
          padding: 20,
          flex: 1,
          gap: 20,
          justifyContent: "center",
        }}
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

        <View style={{ gap: 16 }}>
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

          <View style={{ gap: 20, marginTop: 10, alignItems: "center" }}>
            <View style={{ flexDirection: "row" }}>
              <Text style={globalStyles.linkText}>¿Ya tenés una cuenta? </Text>
              <Pressable
                onPress={() => router.replace("/login")}
                style={{ flexDirection: "row" }}
              >
                <Text
                  style={[globalStyles.link, { color: theme.colors.primary }]}
                >
                  Iniciá sesión
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
