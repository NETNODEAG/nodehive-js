import { AuthenticationError } from "../../errors.js";

export class OAuthClientCredentialsStrategy {
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
      const maxAge = this.authManager.resolveMaxAge(
        options?.tokenMaxAge,
        session?.tokenMaxAge,
        data?.expires_in
      );
      const tokenOptions = maxAge ? { maxAge: maxAge } : undefined;
      await this.authManager.setToken(data.access_token, tokenOptions);

      const expiresAt = maxAge ? Date.now() + maxAge * 1000 : null;
      await this.authManager.setTokenExpiresAt(expiresAt, tokenOptions);

      return {
        success: true,
        token: data.access_token,
        expires_in: maxAge ?? null,
        token_type: data.token_type,
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

  async refreshToken(options = {}) {
    return this.login(undefined, undefined, options);
  }

  async fetchUserDetails() {
    throw new AuthenticationError(
      "Fetching user details is not supported for client credentials grant"
    );
  }
}
