import { AuthenticationError } from "../../errors.js";

export class JwtStrategy {
  constructor(authManager) {
    this.authManager = authManager;
  }

  async login(username, password, options = {}) {
    try {
      const { client, session } = this.authManager;
      // Use btoa for browser compatibility, or Buffer in Node.js
      const loginData =
        typeof Buffer !== "undefined"
          ? Buffer.from(`${username}:${password}`).toString("base64")
          : btoa(`${username}:${password}`);
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
      const maxAge = this.authManager.resolveMaxAge(
        options?.tokenMaxAge,
        session?.tokenMaxAge
      );
      const tokenOptions = maxAge ? { maxAge: maxAge } : undefined;
      await this.authManager.setToken(data.token, tokenOptions);

      const expiresAt = maxAge ? Date.now() + maxAge * 1000 : null;
      await this.authManager.setTokenExpiresAt(expiresAt, tokenOptions);

      let userDetails = null;
      try {
        userDetails = await this.fetchUserDetails(data.token);
        await this.authManager.setUserDetails(userDetails, tokenOptions);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }

      return {
        success: true,
        token: data.token,
        expires_in: maxAge ?? null,
        user: userDetails,
      };
    } catch (error) {
      throw new AuthenticationError(`Login failed: ${error.message}`);
    }
  }

  async refreshToken(options = {}) {
    throw new AuthenticationError(
      "JWT strategy does not support token refresh"
    );
  }

  async fetchUserDetails(token) {
    try {
      const { client } = this.authManager;
      const decodedJwt = this.authManager.decodeJwt(token);
      const uid = decodedJwt?.drupal?.uid;
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
