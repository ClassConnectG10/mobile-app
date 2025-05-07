import UserInformation from "@/types/userInformation";
import { useState } from "react";
import { defaultCountry } from "@/utils/constants/countries";

export interface UserInformationHook {
  userInformation: UserInformation;
  setUserInformation: (userInformation: UserInformation) => void;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
  setEmail: (email: string) => void;
  setCountry: (country: string) => void;
}

export function useUserInformation(
  initialUserInformation: UserInformation
): UserInformationHook {
  const [userInformation, setUserInformation] = useState<UserInformation>({
    ...initialUserInformation,
  });

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

  return {
    userInformation,
    setUserInformation,
    setFirstName,
    setLastName,
    setEmail,
    setCountry,
  };
}
