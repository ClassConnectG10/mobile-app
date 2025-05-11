import { useRouter } from "expo-router";
import { Drawer } from "react-native-paper";
import { DrawerContentScrollView } from "@react-navigation/drawer";

interface SideBarProps {
  visible: boolean;
}

const SideBar: React.FC<SideBarProps> = ({ visible }) => {
  const router = useRouter();

  return (
    <>
      {visible && (
        <DrawerContentScrollView
          alwaysBounceVertical={false}
          style={{ flex: 1, backgroundColor: "#fff" }}
        >
          <Drawer.Section showDivider={true}>
            <Drawer.Item
              label="Mis cursos inscriptos"
              icon="book-open-page-variant"
              onPress={() =>
                router.push({
                  pathname: "/courses/search",
                  params: { ownCourses: "own" },
                })
              }
            />
            <Drawer.Item
              label="Mis cursos impartidos"
              icon="book-open-page-variant"
              onPress={() =>
                router.push({
                  pathname: "/courses/search",
                  params: { ownCourses: "own" },
                })
              }
            />
            <Drawer.Item
              label="Crear curso"
              icon="plus"
              onPress={() => router.push("/courses/create")}
            />
          </Drawer.Section>
        </DrawerContentScrollView>
      )}
    </>
  );
};

export default SideBar;
