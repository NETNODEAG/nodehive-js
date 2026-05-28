import { AuthenticationError } from "../../errors.js";

export async function fetchUserDetails(authManager, token) {
  try {
    const { client } = authManager;
    const decodedJwt = authManager.decodeJwt(token);
    const uid = decodedJwt?.sub;
    if (!uid) {
      throw new AuthenticationError("Invalid token structure");
    }

    const response = await fetch(
      `${client.baseUrl}/user/${uid}?_format=json`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new AuthenticationError("OAuth user info fetch failed", {
        status: response.status,
      });
    }

    return await response.json();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError(
      `Failed to fetch user details: ${error.message}`
    );
  }
}
