import { AuthenticationError } from "../../errors.js";

export class OAuthClientCredentialsStrategy {
  constructor(authManager) {
    this.authManager = authManager;
  }

  async login(options = {}) {
    try {
      const refreshTokenMaxAge =
        options.refreshTokenMaxAge || 30 * 24 * 60 * 60; // 30 days in seconds
      const tokenMaxAge = options.tokenMaxAge || 60 * 60; // 1 hour in seconds
      const { client, oauthConfig } = this.authManager;
      const clientId = options.clientId || oauthConfig.clientId;
      const clientSecret = options.clientSecret || oauthConfig.clientSecret;
      const scope = options.scope || oauthConfig.scope || "";

      if (!clientId || !clientSecret) {
        throw new AuthenticationError("OAuth client credentials are required");
      }

      const params = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
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
          errorData.error_description ||
            "Client credentials authentication failed"
        );
      }

      const data = await response.json();
      await this.authManager.setToken(data.access_token, {
        maxAge: data.expires_in || tokenMaxAge,
      });

      // Client credentials typically don't have refresh tokens
      // But store it if provided
      if (data.refresh_token) {
        await this.authManager.setRefreshToken(data.refresh_token, {
          maxAge: refreshTokenMaxAge,
        });
      }

      return {
        success: true,
        token: data.access_token,
        expires_in: data.expires_in || tokenMaxAge,
        refresh_token: data.refresh_token || null,
        token_type: data.token_type, // TODO use this somewhere?
        scope: data.scope,
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        `Client credentials authentication failed: ${error.message}`
      );
    }
  }

  async refreshToken() {
    throw new AuthenticationError(
      "Token refresh is not supported for client credentials grant"
    );
  }
}
