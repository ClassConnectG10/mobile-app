import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 16,
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
  userIconContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
  },
  courseDetailsContainer: {
    gap: 20,
  },
  numStudentsContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 10,
  },
});
