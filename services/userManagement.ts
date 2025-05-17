import { userDetailsSchema, userSchema } from "@/validations/users";
import { User, UserInformation } from "@/types/user";
import { handleError } from "./errorHandling";
import {
  createRegisterUserRequest,
  createLoginUserRequest,
  createEditUserProfileRequest,
  createUserRequest,
} from "@/api/user";

/**
 * Registers a new user in the system by sending their information to the server.
 *
 * @param accessToken - The access token for authentication.
 * @param uid - The unique identifier for the user.
 * @param userInformation - An object containing the user's information, including
 * @returns A `UserInformation` object containing the registered user's details.
 * @throws An error if the registration process fails.
 */
export async function registerUser(
  uid: string,
  userInformation: UserInformation,
) {
  try {
    userDetailsSchema.parse(userInformation);
    const request = await createRegisterUserRequest();
    const response = await request.post("", {
      uid: uid,
      role: "user",
      name: userInformation.firstName,
      surname: userInformation.lastName,
      email: userInformation.email,
      country: userInformation.country,
    });
    const user = new User(
      response.data.data.id,
      new UserInformation(
        response.data.data.name,
        response.data.data.surname,
        response.data.data.email,
        response.data.data.country,
      ),
    );
    return user;
  } catch (error) {
    throw handleError(error, "registrar el usuario");
  }
}

/**
 * Logs in a user by their unique identifier (UID) and retrieves their information.
 *
 * @param uid - The unique identifier of the user to log in.
 * @returns A promise that resolves to an instance of `UserInformation` containing
 *          the user's name, surname, email, and country.
 * @throws An error if the login request fails.
 */
export async function loginUser(uid: string): Promise<User | null> {
  try {
    const request = await createLoginUserRequest(uid);
    const response = await request.get("");

    const userInfo = new UserInformation(
      response.data.data.name,
      response.data.data.surname,
      response.data.data.email,
      response.data.data.country,
    );

    const user = {
      id: response.data.data.id,
      userInformation: userInfo,
    };

    return user;
  } catch (error) {
    if (
      error.response?.status === 500 &&
      error.response?.data?.detail === "Error logging in user: user not found"
    ) {
      return null; //TODO: should be another error
    }

    throw handleError(error, "iniciar sesión");
  }
}

/**
 * Edits the profile of a user by sending their updated information to the server.
 *
 * @param accessToken - The access token for authentication.
 * @param uid - The unique identifier for the user.
 * @param user - An object containing the user's updated information.
 * @returns A `UserInformation` object containing the updated user's details.
 * @throws An error if the edit process fails.
 */
export async function editUserProfile(user: User) {
  try {
    userSchema.parse(user);
    const request = await createEditUserProfileRequest(user.id);
    const response = await request.patch("", {
      name: user.userInformation.firstName,
      surname: user.userInformation.lastName,
      email: user.userInformation.email,
      country: user.userInformation.country,
    });
    const updatedUserInfo = new UserInformation(
      response.data.data.name,
      response.data.data.surname,
      response.data.data.email,
      response.data.data.country,
    );
    return updatedUserInfo;
  } catch (error) {
    throw handleError(error, "editar el perfil del usuario");
  }
}

export async function getUser(userId: number): Promise<User> {
  try {
    const request = await createUserRequest(userId);
    const response = await request.get("");
    const userInfo = new UserInformation(
      response.data.data.name,
      response.data.data.surname,
      response.data.data.email,
    );

    const user = {
      id: response.data.data.id,
      userInformation: userInfo,
    };

    return user;
  } catch (error) {
    throw handleError(error, "obtener el usuario");
  }
}
