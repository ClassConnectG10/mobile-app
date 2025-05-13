import React, { createContext, useState, useContext, ReactNode } from "react";
import { User } from "@/types/user";

interface UserContext {
  user: User | null;
  setUser: (info: User | null) => void;
  deleteUser: () => void;
}

const userContext = createContext<UserContext | null>(null);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const deleteUser = () => {
    setUser(null);
  };

  return (
    <userContext.Provider value={{ user, setUser, deleteUser }}>
      {children}
    </userContext.Provider>
  );
};

export const useUserContext = (): UserContext => {
  const context = useContext(userContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
