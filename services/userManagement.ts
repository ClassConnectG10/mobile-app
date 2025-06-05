import { userDetailsSchema, userSchema } from "@/validations/users";
import { NotificationEventPreferences, User, UserInformation, UserPreferences } from "@/types/user";
import { handleError } from "./common";
import {
  createRegisterUserRequest,
  createLoginUserRequest,
  createUserRequest,
  createBulkUserRequest,
  createUsersRequest,
} from "@/api/user";
import { getToken } from "@/services/notifications";
import { deleteToken, getMessaging } from "@react-native-firebase/messaging";
import { NotificationConfig, notificationEventMeta } from "@/types/notification";

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
  userInformation: UserInformation
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

    const responseData = response.data.data;

    const userInfo = new UserInformation(
      responseData.name,
      responseData.surname,
      responseData.email,
      responseData.country
    );

    const userPreferences = new UserPreferences(
      notificationEventMeta.map(
        (eventMeta) =>
          new NotificationEventPreferences(
            eventMeta.event,
            responseData.push_scopes.includes(eventMeta.event),
            responseData.email_scopes.includes(eventMeta.event)
          )
      )
    );

    const user = new User(responseData.id, userInfo, userPreferences);
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

    const responseData = response.data.data;

    const userInfo = new UserInformation(
      responseData.name,
      responseData.surname,
      responseData.email,
      responseData.country
    );

    const userPreferences = new UserPreferences(
      notificationEventMeta.map(
        (eventMeta) =>
          new NotificationEventPreferences(
            eventMeta.event,
            responseData.email_scopes.includes(eventMeta.event),
            responseData.push_scopes.includes(eventMeta.event)
          )
      )
    );

    const user = new User(responseData.id, userInfo, userPreferences);

    const messagingToken = await getToken();
    const requestToken = await createUserRequest(user.id);
    const data = {
      r_token: messagingToken,
    };
    await requestToken.patch("", data);

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

export async function logoutUser(uid: number): Promise<void> {
  try {
    const messaging = getMessaging();
    if (messaging) {
      deleteToken(messaging);
    }

    const request = await createUserRequest(uid);
    const data = {
      r_token: "",
    };
    await request.patch("", data);
  } catch (error) {
    throw handleError(error, "cerrar sesión");
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
export async function editUserProfile(user: User): Promise<void> {
  try {
    userSchema.parse(user);
    const request = await createUserRequest(user.id);
    await request.patch("", {
      name: user.userInformation.firstName,
      surname: user.userInformation.lastName,
      email: user.userInformation.email,
      country: user.userInformation.country,
    });
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
      response.data.data.email
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

export async function getBulkUsers(userIds: number[]): Promise<User[]> {
  try {
    if (userIds.length === 0) {
      return [];
    }

    const request = await createBulkUserRequest();

    const response = await request.post("", {
      Ids: userIds,
    });

    const users = response.data.data.map((user: any) => {
      return new User(
        user.id,
        new UserInformation(user.name, user.surname, user.email)
      );
    });
    return users;
  } catch (error) {
    throw handleError(error, "obtener los usuarios");
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const request = await createUsersRequest();
    const response = await request.get("");
    const users = response.data.data.map((user: any) => {
      return new User(
        user.id,
        new UserInformation(user.name, user.surname, user.email)
      );
    });
    return users;
  } catch (error) {
    throw handleError(error, "obtener los usuarios");
  }
}

export async function updatePreferences(
  userId: number,
  preferences: UserPreferences
): Promise<void> {
  try {
    const request = await createUserRequest(userId);

    const configurableEvents = notificationEventMeta.filter(
      (meta) => meta.configurable === NotificationConfig.CONFIGURABLE
    ).map((meta) => meta.event);

    const pushScopes = preferences.notification_events_configuration
      .filter(
        (event) =>
          event.push &&
          configurableEvents.includes(event.event)
      ).map(
        (event) => event.event
      );

    const emailScopes = preferences.notification_events_configuration
      .filter(
        (event) =>
          event.mail &&
          configurableEvents.includes(event.event)
      ).map(
        (event) => event.event
      );

    const body = {
      push_scopes: pushScopes,
      email_scopes: emailScopes,
    };

    await request.patch("", body);
  } catch (error) {
    throw handleError(error, "actualizar las preferencias del usuario");
  }
}
