import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";
import { Drawer } from "react-native-paper";
import { DrawerContentScrollView } from "@react-navigation/drawer";

interface SideBarProps {
  visible: boolean;
}

const SideBar: React.FC<SideBarProps> = ({ visible }) => {
  const router = useRouter();

  return (
    <DrawerContentScrollView
      alwaysBounceVertical={false}
      style={{ flex: 1, backgroundColor: "#fff" }}
    >
      {visible && (
        <Drawer.Section showDivider={true}>
          <Drawer.Item
            label="Mis cursos inscriptos"
            icon="book-open-page-variant"
            onPress={() => router.push("/courses/enrolled")}
          />
          <Drawer.Item
            label="Mis cursos impartidos"
            icon="book-open-page-variant"
            onPress={() => router.push("/courses/taught")}
          />
          <Drawer.Item
            label="Crear curso"
            icon="plus"
            onPress={() => router.push("/courses/create")}
          />
        </Drawer.Section>
      )}
    </DrawerContentScrollView>
  );
};

export default SideBar;
