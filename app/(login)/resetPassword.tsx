import { useState } from "react";
import { View, Image, Pressable } from "react-native";
import {
  Button,
  Dialog,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { globalStyles } from "@/styles/globalStyles";
import { ZodError } from "zod";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { resetSchema } from "@/validations/users";
import { useRouter } from "expo-router";
import { passwordReset } from "@/services/auth/authUtils";

export default function ResetPassword() {
  const theme = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleResetPassword = async () => {
    setButtonDisabled(true);
    try {
      resetSchema.parse({ email });
      await passwordReset(email);
      setDialogVisible(true);
    } catch (error) {
      if (error instanceof ZodError) {
        setErrorMessage(error.errors[0].message);
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    } finally {
      setButtonDisabled(false);
    }
  };

  const handleDialogDismiss = () => {
    setDialogVisible(false);
    router.replace("/login");
  };

  return (
    <>
      <View
        style={{
          backgroundColor: theme.colors.onPrimary,
          padding: 20,
          flex: 1,
          justifyContent: "center",
          gap: 20,
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
          />

          <Button
            icon="lock-reset"
            mode="contained"
            onPress={handleResetPassword}
            disabled={buttonDisabled}
          >
            Restablecer contraseña
          </Button>

          <View style={{ gap: 20, marginTop: 10, alignItems: "center" }}>
            <View style={{ flexDirection: "row" }}>
              <Text style={globalStyles.linkText}>Ingresá a tu cuenta: </Text>
              <Pressable
                onPress={() => router.replace("/login")}
                style={{ flexDirection: "row" }}
              >
                <Text
                  style={[globalStyles.link, { color: theme.colors.primary }]}
                >
                  Iniciar sesión
                </Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={globalStyles.linkText}>¿No tenés una cuenta? </Text>
              <Pressable
                onPress={() => router.replace("/register")}
                style={{ flexDirection: "row" }}
              >
                <Text
                  style={[globalStyles.link, { color: theme.colors.primary }]}
                >
                  Registrate
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

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={handleDialogDismiss}>
          <Dialog.Title>Correo enviado</Dialog.Title>
          <Dialog.Content>
            <Text>
              Te enviamos un correo a "{email}" con instrucciones para
              restablecer tu contraseña.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleDialogDismiss}>Aceptar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}
// This code is a React Native component for a password reset screen. It includes a form for the user to enter their email address, and upon submission, it validates the input and sends a password reset request. If successful, it shows a dialog indicating that an email has been sent with instructions to reset the password. The component also includes navigation links to log in or register if the user doesn't have an account.
