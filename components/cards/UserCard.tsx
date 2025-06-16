import React from "react";
import { Card, Text, useTheme } from "react-native-paper";
import { View, StyleSheet } from "react-native";
import { User } from "@/types/user";
import { ToggleableProfilePicture } from "../forms/ToggleableProfilePicture";

interface UserCardProps {
  user: User;
  onPress?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onPress }) => {
  const theme = useTheme();
  const { firstName, lastName, email } = user.userInformation;

  return (
    <Card
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.onPrimary }]}
    >
      <View style={styles.row}>
        <ToggleableProfilePicture
          file={user.userInformation.profilePicture}
          size={48}
          pressable={false}
          isBlocked={user.isBlocked}
        />

        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.colors.onSurface }]}>
            {firstName} {lastName}
          </Text>
          <Text style={[styles.email, { color: theme.colors.onSurface }]}>
            {email}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  email: {
    fontSize: 14,
    marginTop: 2,
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  countryText: {
    fontSize: 14,
  },
});

export default UserCard;
