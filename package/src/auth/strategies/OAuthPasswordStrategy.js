import { AuthenticationError } from "../../errors.js";

export class OAuthPasswordStrategy {
  constructor(authManager) {
    this.authManager = authManager;
  }

  async login(username, password, options = {}) {
    try {
      const { client, oauthConfig } = this.authManager;
      const refreshTokenMaxAge =
        options.refreshTokenMaxAge || 30 * 24 * 60 * 60; // 30 days in seconds
      const tokenMaxAge = options.tokenMaxAge || 60 * 60; // 1 hour in seconds
      const clientId = options.clientId || oauthConfig.clientId;
      const clientSecret = options.clientSecret || oauthConfig.clientSecret;
      const scope = options.scope || oauthConfig.scope || "";

      if (!clientId || !clientSecret) {
        throw new AuthenticationError("OAuth client credentials are required");
      }

      const params = new URLSearchParams({
        grant_type: "password",
        client_id: clientId,
        client_secret: clientSecret,
        username: username,
        password: password,
      });

      if (scope) {
        params.append("scope", scope);
      }

      const response = await fetch(`${client.baseUrl}/oauth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AuthenticationError(
          errorData.error_description || "Invalid username or password"
        );
      }

      const data = await response.json();
      await this.authManager.setToken(data.access_token, {
        maxAge: data.expires_in || tokenMaxAge,
      });

      // Store refresh token if available
      if (data.refresh_token) {
        await this.authManager.setRefreshToken(data.refresh_token, {
          maxAge: refreshTokenMaxAge,
        });
      }

      // Fetch user details using the access token
      const userDetails = await this.fetchUserDetails(data.access_token);
      await this.authManager.setUserDetails(userDetails, {
        maxAge: data.expires_in || tokenMaxAge,
      });

      return {
        success: true,
        token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in || tokenMaxAge,
        user: userDetails,
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(`OAuth login failed: ${error.message}`);
    }
  }

  async refreshToken(options = {}) {
    try {
      const refreshTokenMaxAge =
        options.refreshTokenMaxAge || 30 * 24 * 60 * 60; // 30 days in seconds
      const tokenMaxAge = options.tokenMaxAge || 60 * 60; // 1 hour in seconds
      const { client, oauthConfig } = this.authManager;
      const refreshToken = await this.authManager.getRefreshToken();
      if (!refreshToken) {
        throw new AuthenticationError("No refresh token available");
      }

      const params = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: oauthConfig.clientId,
        client_secret: oauthConfig.clientSecret,
        refresh_token: refreshToken,
      });

      const response = await fetch(`${client.baseUrl}/oauth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new AuthenticationError("Failed to refresh token");
      }

      const data = await response.json();
      await this.authManager.setToken(data.access_token, {
        maxAge: data.expires_in || tokenMaxAge,
      });

      if (data.refresh_token) {
        await this.authManager.setRefreshToken(data.refresh_token, {
          maxAge: refreshTokenMaxAge,
        });
      }

      const userDetails = await this.fetchUserDetails(data.access_token);
      await this.authManager.setUserDetails(userDetails, {
        maxAge: data.expires_in || tokenMaxAge,
      });

      return {
        success: true,
        token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in || tokenMaxAge,
        user: userDetails,
      };
    } catch (error) {
      throw new AuthenticationError(`Token refresh failed: ${error.message}`);
    }
  }

  async fetchUserDetails(token) {
    try {
      const { client } = this.authManager;
      const response = await fetch(
        `${client.baseUrl}/oauth/userinfo?_format=json`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new AuthenticationError("OAuth user info fetch failed");
      }

      return await response.json();
    } catch (error) {
      throw new AuthenticationError(
        `Failed to fetch user details: ${error.message}`
      );
    }
  }
}
