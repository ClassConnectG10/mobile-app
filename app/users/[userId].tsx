import { Avatar, Appbar, Button, useTheme } from "react-native-paper";
import { COUNTRIES } from "@/utils/constants/countries";
import { editUserProfile, getUser } from "@/services/userManagement";
import { globalStyles } from "@/styles/globalStyles";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useUserContext } from "@/utils/storage/userContext";
import { useUserInformation } from "@/hooks/useUserInformation";
import { View, ScrollView, ActivityIndicator } from "react-native";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import OptionPicker from "@/components/forms/OptionPicker";
import { signOut } from "@/services/auth/authUtils";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { getAuth } from "@react-native-firebase/auth";
import { useNavigation, CommonActions } from "@react-navigation/native";

export default function UserProfilePage() {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const { userId: userIdParam } = useLocalSearchParams();
  const userId = userIdParam as string | undefined;

  const userContextHook = useUserContext();
  const userContext = userContextHook.user;

  const isMe = !userId || userId === String(userContext?.id);

  // Para edición y campos controlados
  const userInformationHook = useUserInformation();
  const userInformation = userInformationHook.userInformation;

  // Para mostrar datos de otro usuario
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Cargar datos si es otro usuario
  const fetchUser = async () => {
    if (!userId || isMe) return;
    setIsLoading(true);

    try {
      const userFetched = await getUser(Number(userId));
      userInformationHook.setUserInformation({
        ...userFetched.userInformation,
      });
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [userId]),
  );

  // Inicializar datos propios en el hook de edición
  useEffect(() => {
    if (isMe && userContext) {
      userInformationHook.setUserInformation({
        ...userContext.userInformation,
      });
    }
  }, [isMe, userContext]);

  // Guardar cambios en perfil propio
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const newUser = {
        id: userContext.id,
        userInformation: { ...userInformation },
      };
      await editUserProfile(newUser);
      userContextHook.setUser(newUser);
      setIsEditing(false);
    } catch (error) {
      setErrorMessage((error as Error).message);
      handleCancelEdit();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    userInformationHook.setUserInformation({ ...userContext.userInformation });
    setIsEditing(false);
  };

  // Logout solo para perfil propio
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      const providerId = user?.providerData[0].providerId;
      if (providerId === "google.com") {
        await GoogleSignin.signOut();
      }
      await signOut();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "(login)/login" }],
        }),
      );
    } catch (error) {
      setErrorMessage(`Error al cerrar sesión: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction
            onPress={isEditing ? handleCancelEdit : () => router.back()}
          />
          <Appbar.Content title={isMe ? "Mi Perfil" : "Perfil de usuario"} />
          {isMe && (
            <Appbar.Action
              icon={isEditing ? "check" : "pencil"}
              onPress={isEditing ? handleSave : () => setIsEditing(true)}
            />
          )}
        </Appbar.Header>

        {isLoading ? (
          <View
            style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
          >
            <ActivityIndicator
              animating={true}
              size="large"
              color={theme.colors.primary}
            />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{
              padding: 16,
              flex: 1,
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                gap: 16,
              }}
            >
              <View style={globalStyles.userIconContainer}>
                <Avatar.Icon size={96} icon="account" />
              </View>

              <ToggleableTextInput
                label="Nombre"
                placeholder="Nombre"
                editable={isMe && isEditing}
                onChange={userInformationHook.setFirstName}
                value={userInformation.firstName}
              />

              <ToggleableTextInput
                label="Apellido"
                placeholder="Apellido"
                editable={isMe && isEditing}
                onChange={userInformationHook.setLastName}
                value={userInformation.lastName}
              />

              <ToggleableTextInput
                label="Email"
                placeholder="Email"
                editable={false}
                onChange={userInformationHook.setEmail}
                value={userInformation.email}
              />

              {isMe && (
                <OptionPicker
                  label="País de residencia"
                  value={userInformation.country}
                  setValue={userInformationHook.setCountry}
                  items={COUNTRIES}
                  editable={isMe && isEditing}
                />
              )}
            </View>

            <View>
              {isMe && !isEditing && (
                <Button
                  mode="contained"
                  onPress={handleLogout}
                  disabled={isLoading}
                  style={{ marginTop: 20 }}
                >
                  Cerrar sesión
                </Button>
              )}
            </View>
          </ScrollView>
        )}
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
