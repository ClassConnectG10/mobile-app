import { UserInformation } from "@/types/user";
import { useState } from "react";
import { File } from "@/types/file";

export interface UserHook {
  userInformation: UserInformation;
  setUserInformation: (userInformation: UserInformation) => void;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
  setEmail: (email: string) => void;
  setCountry: (country: string) => void;
  setProfilePicture: (profilePicture: File | null) => void;
}

export function useUserInformation(): UserHook {
  const defaultUserInformation: UserInformation = {
    firstName: "",
    lastName: "",
    email: "",
    country: "",
  };

  const [userInformation, setUserInformation] = useState<UserInformation>(
    defaultUserInformation
  );

  const setFirstName = (firstName: string) => {
    setUserInformation((prev) => ({ ...prev, firstName }));
  };

  const setLastName = (lastName: string) => {
    setUserInformation((prev) => ({ ...prev, lastName }));
  };

  const setEmail = (email: string) => {
    setUserInformation((prev) => ({ ...prev, email }));
  };

  const setCountry = (country: string) => {
    setUserInformation((prev) => ({ ...prev, country }));
  };

  const setProfilePicture = (profilePicture: File | null) => {
    setUserInformation((prev) => ({ ...prev, profilePicture }));
  };

  return {
    userInformation,
    setUserInformation,
    setFirstName,
    setLastName,
    setEmail,
    setCountry,
    setProfilePicture,
  };
}
