import { AuthenticationError } from "../../errors.js";

export class OAuthPasswordStrategy {
  constructor(authManager) {
    this.authManager = authManager;
  }

  async login(username, password, options = {}) {
    try {
      const { client, oauthConfig, session } = this.authManager;
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
          errorData.error_description || "Invalid username or password",
          { status: response.status }
        );
      }

      const data = await response.json();
      const maxAge = this.authManager.resolveMaxAge(
        options?.tokenMaxAge,
        session?.tokenMaxAge,
        data?.expires_in
      );
      const tokenOptions = maxAge ? { maxAge: maxAge } : undefined;
      await this.authManager.setToken(data.access_token, tokenOptions);

      if (data.refresh_token) {
        const refreshTokenMaxAge = this.authManager.resolveMaxAge(
          options?.refreshTokenMaxAge,
          session?.refreshTokenMaxAge
        );
        const refreshTokenOptions = refreshTokenMaxAge
          ? { maxAge: refreshTokenMaxAge }
          : undefined;
        await this.authManager.setRefreshToken(
          data.refresh_token,
          refreshTokenOptions
        );
      }

      const expiresAt = maxAge ? Date.now() + maxAge * 1000 : null;
      await this.authManager.setTokenExpiresAt(expiresAt, tokenOptions);

      let userDetails = null;
      try {
        userDetails = await this.fetchUserDetails(data.access_token);
        await this.authManager.setUserDetails(userDetails, tokenOptions);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }

      return {
        success: true,
        token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: maxAge ?? null,
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
      const { client, oauthConfig, session } = this.authManager;
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
        const errorData = await response.json().catch(() => ({}));
        throw new AuthenticationError(
          errorData.error_description || "Failed to refresh token",
          { status: response.status }
        );
      }

      const data = await response.json();
      const maxAge = this.authManager.resolveMaxAge(
        options?.tokenMaxAge,
        session?.tokenMaxAge,
        data?.expires_in
      );
      const tokenOptions = maxAge ? { maxAge: maxAge } : undefined;
      await this.authManager.setToken(data.access_token, tokenOptions);

      if (data.refresh_token) {
        const refreshTokenMaxAge = this.authManager.resolveMaxAge(
          options?.refreshTokenMaxAge,
          session?.refreshTokenMaxAge
        );
        const refreshTokenOptions = refreshTokenMaxAge
          ? { maxAge: refreshTokenMaxAge }
          : undefined;
        await this.authManager.setRefreshToken(
          data.refresh_token,
          refreshTokenOptions
        );
      }

      const expiresAt = maxAge ? Date.now() + maxAge * 1000 : null;
      await this.authManager.setTokenExpiresAt(expiresAt, tokenOptions);

      let userDetails = null;
      try {
        userDetails = await this.fetchUserDetails(data.access_token);
        await this.authManager.setUserDetails(userDetails, tokenOptions);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }

      return {
        success: true,
        token: data.access_token,
        token_type: data.token_type,
        refresh_token: data.refresh_token,
        expires_in: maxAge ?? null,
        user: userDetails,
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(`Token refresh failed: ${error.message}`);
    }
  }

  async fetchUserDetails(token) {
    try {
      const { client } = this.authManager;
      const decodedJwt = this.authManager.decodeJwt(token);
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
}
