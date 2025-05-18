import { Avatar, Appbar, Button } from "react-native-paper";
import { COUNTRIES } from "@/utils/constants/countries";
import { editUserProfile } from "@/services/userManagement";
import { globalStyles } from "@/styles/globalStyles";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useUserContext } from "@/utils/storage/userContext";
import { useUserInformation } from "@/hooks/useUserInformation";
import { View, ScrollView } from "react-native";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import OptionPicker from "@/components/forms/OptionPicker";
import { signOut } from "@/services/auth/authUtils";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { getAuth } from "@react-native-firebase/auth";

export default function UserProfilePage() {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setisLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const userContextHook = useUserContext();
  const userInformationHook = useUserInformation();

  const userContext = userContextHook.user;
  const userInformation = userInformationHook.userInformation;

  useEffect(() => {
    if (userContext) {
      userInformationHook.setUserInformation({
        ...userContext.userInformation,
      });
    }
  }, []);

  const handleCancelEdit = () => {
    userInformationHook.setUserInformation({ ...userContext.userInformation });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setisLoading(true);
    try {
      const newUser = {
        id: userContext.id,
        userInformation: {
          ...userInformation,
        },
      };

      await editUserProfile(newUser);
      userContextHook.setUser(newUser);
      setIsEditing(false);
    } catch (error) {
      setErrorMessage((error as Error).message);
      handleCancelEdit();
    } finally {
      setisLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setisLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      const providerId = user?.providerData[0].providerId;
      if (providerId === "google.com") {
        await GoogleSignin.signOut();
      }

      await signOut();
      // userContextHook.deleteUser();

      router.replace("/login");
    } catch (error) {
      setErrorMessage(`Error al cerrar sesión: ${error}`);
    }
  };

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction
            onPress={isEditing ? () => handleCancelEdit() : () => router.back()}
          />
          <Appbar.Content title="Mi Perfil" />
          <Appbar.Action
            icon={isEditing ? "check" : "pencil"}
            onPress={isEditing ? () => handleSave() : () => setIsEditing(true)}
          />
        </Appbar.Header>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          <View style={globalStyles.userIconContainer}>
            <Avatar.Icon size={96} icon="account" />
          </View>

          <ToggleableTextInput
            label="Nombre"
            placeholder="Nombre"
            editable={isEditing}
            onChange={userInformationHook.setFirstName}
            value={userInformation.firstName}
          />

          <ToggleableTextInput
            label="Apellido"
            placeholder="Apellido"
            editable={isEditing}
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

          <OptionPicker
            label="País de residencia"
            value={userInformation.country}
            setValue={userInformationHook.setCountry}
            items={COUNTRIES}
            editable={isEditing}
          />

          {!isEditing && (
            <Button
              mode="contained"
              onPress={handleLogout}
              disabled={isLoading}
              style={{ marginTop: 20 }}
            >
              Cerrar sesión
            </Button>
          )}
        </ScrollView>
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
