import { AuthenticationError } from "../../errors.js";

export class JwtStrategy {
  constructor(authManager) {
    this.authManager = authManager;
  }

  async login(email, password) {
    try {
      const { client } = this.authManager;
      // Use btoa for browser compatibility, or Buffer in Node.js
      const loginData =
        typeof Buffer !== "undefined"
          ? Buffer.from(`${email}:${password}`).toString("base64")
          : btoa(`${email}:${password}`);
      const response = await fetch(`${client.baseUrl}/jwt/token?_format=json`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${loginData}`,
        },
      });

      if (!response.ok) {
        throw new AuthenticationError("Invalid username or password");
      }

      const data = await response.json();
      await this.authManager.setToken(data.token);

      const userDetails = await this.fetchUserDetails(data.token);
      await this.authManager.setUserDetails(userDetails);

      return {
        success: true,
        token: data.token,
        user: userDetails,
      };
    } catch (error) {
      throw new AuthenticationError(`Login failed: ${error.message}`);
    }
  }

  async fetchUserDetails(token) {
    try {
      const { client } = this.authManager;
      const decodedJwt = this.authManager.decodeJwt(token);
      if (!decodedJwt?.drupal?.uid) {
        throw new AuthenticationError("Invalid token structure");
      }

      const response = await fetch(
        `${client.baseUrl}/user/${decodedJwt.drupal.uid}?_format=json`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new AuthenticationError("JWT user info fetch failed");
      }

      return await response.json();
    } catch (error) {
      throw new AuthenticationError(
        `Failed to fetch user details: ${error.message}`
      );
    }
  }
}
