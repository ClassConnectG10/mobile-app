import { View, ScrollView } from "react-native";
import { Avatar, Appbar, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { useState } from "react";
import { globalStyles } from "@/styles/globalStyles";
import { useUserContext } from "@/utils/storage/userContext";
import OptionPicker from "@/components/OptionPicker";
import { countries } from "@/utils/constants/countries";
import { useUserInformation } from "@/hooks/useUserInformation";
import UserInformation from "@/types/userInformation";
import { ToggleableTextInput } from "@/components/ToggleableTextInput";
import { getAuth, signOut } from "firebase/auth";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { editUserProfile } from "@/services/userManagement";

export default function UserProfilePage() {
  const router = useRouter();
  const auth = getAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const userContextHook = useUserContext();
  if (!userContextHook.user) {
    router.replace("/login");
    return;
  }

  const userContext = userContextHook.user;

  const userInformationHook = useUserInformation({
    ...userContext.userInformation,
  });
  const userInformation = userInformationHook.userInformation;

  const handleCancelEdit = () => {
    userInformationHook.setUserInformation({ ...userContext.userInformation });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setButtonDisabled(true);

      const auth = getAuth();
      const accessToken = await auth.currentUser?.getIdToken();

      if (!accessToken) {
        setErrorMessage("Error al obtener el token de acceso");
        return;
      }

      const newUser = {
        id: userContext.id,
        userInformation: {
          ...userInformation,
        },
      };

      await editUserProfile(accessToken, newUser);
      userContextHook.setUser(newUser);

      setIsEditing(false);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    } finally {
      setButtonDisabled(false);
    }
  };

  const handleLogout = async () => {
    try {
      setButtonDisabled(true);

      userContextHook.deleteUser();
      await signOut(auth);

      router.replace("/login");
    } catch {
      setErrorMessage("Error al cerrar sesión");
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={isEditing ? () => handleCancelEdit() : () => router.back()}
        />
        <Appbar.Content title={isEditing ? "Editar perfil" : "Perfil"} />
        <Appbar.Action
          icon={isEditing ? "check" : "pencil"}
          onPress={isEditing ? () => handleSave() : () => setIsEditing(true)}
        />
      </Appbar.Header>
      <View style={globalStyles.mainContainer}>
        <ScrollView contentContainerStyle={globalStyles.courseDetailsContainer}>
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
            items={countries}
            enabled={isEditing}
          />

          {!isEditing && (
            <Button
              mode="contained"
              onPress={handleLogout}
              disabled={buttonDisabled}
              style={{ marginTop: 20 }}
            >
              Cerrar sesión
            </Button>
          )}
        </ScrollView>
        <ErrorMessageSnackbar
          message={errorMessage}
          onDismiss={() => setErrorMessage("")}
        />
      </View>
    </>
  );
}
