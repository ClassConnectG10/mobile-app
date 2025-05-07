import { View, ScrollView } from "react-native";
import { Avatar, Appbar, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { useState } from "react";
import { globalStyles } from "@/styles/globalStyles";
import { useUserInformationContext } from "@/utils/storage/userInformationContext";
import OptionPicker from "@/components/OptionPicker";
import { countries } from "@/utils/constants/countries";
import { useUserInformation } from "@/hooks/useUserInformation";
import UserInformation from "@/types/userInformation";
import { ToggleableTextInput } from "@/components/ToggleableTextInput";
import { getAuth, signOut } from "firebase/auth";

export default function UserProfilePage() {
  const router = useRouter();
  const auth = getAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const userInformationContextHook = useUserInformationContext();
  const userInformationContext =
    userInformationContextHook.userInformation as UserInformation;

  const userInformationHook = useUserInformation({ ...userInformationContext });
  const userInformation = userInformationHook.userInformation;

  const handleCancelEdit = () => {
    userInformationHook.setUserInformation({ ...userInformationContext });
    setIsEditing(false);
  };

  const handleSave = () => {
    // TODO: llamar a la API
    userInformationContextHook.setUserInformation({ ...userInformation });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      setButtonDisabled(true);
      userInformationContextHook.deleteUserInformation();
      await signOut(auth);
      router.replace("/login");
    } catch {
      console.error("Error al cerrar sesión");
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
      </View>
    </>
  );
}
