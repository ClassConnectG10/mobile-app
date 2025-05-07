import React, { createContext, useState, useContext, ReactNode } from "react";
import UserInformation from "@/types/userInformation";

interface UserInformationContext {
  userInformation: UserInformation | null;
  setUserInformation: (info: UserInformation | null) => void;
  deleteUserInformation: () => void;
}

const UserInformationContext = createContext<UserInformationContext | null>(
  null
);

export const UserInformationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userInformation, setUserInformation] =
    useState<UserInformation | null>(null);

  const deleteUserInformation = () => {
    setUserInformation(null);
  };

  return (
    <UserInformationContext.Provider
      value={{ userInformation, setUserInformation, deleteUserInformation }}
    >
      {children}
    </UserInformationContext.Provider>
  );
};

export const useUserInformationContext = (): UserInformationContext => {
  const context = useContext(UserInformationContext);
  if (!context) {
    throw new Error(
      "useUserInformation must be used within a UserInformationProvider"
    );
  }
  return context;
};
