import { AuthenticationError } from "../../errors.js";
import { fetchUserDetails } from "../helpers/user-details.js";

export class OAuthAuthorizationCodeStrategy {
  constructor(authManager) {
    this.authManager = authManager;
  }

  async exchangeCode({ code, codeVerifier, redirectUri, ...options } = {}) {
    if (!code) throw new AuthenticationError("Authorization code is required");
    if (!codeVerifier) throw new AuthenticationError("Code verifier is required");

    try {
      const { client, oauthConfig } = this.authManager;
      const clientId = options.clientId || oauthConfig.clientId;
      const clientSecret = options.clientSecret || oauthConfig.clientSecret;
      const effectiveRedirectUri = redirectUri || oauthConfig.redirectUri;

      if (!effectiveRedirectUri) {
        throw new AuthenticationError("Redirect URI is required");
      }
      if (!clientId || !clientSecret) {
        throw new AuthenticationError("OAuth client credentials are required");
      }

      const tokenUrl =
        oauthConfig.tokenUrl || `${client.baseUrl}/oauth/token`;

      const params = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: effectiveRedirectUri,
        code_verifier: codeVerifier,
      });

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AuthenticationError(
          errorData.error_description || "Authorization code exchange failed",
          { status: response.status }
        );
      }

      const data = await response.json();
      return this._persistTokenResponse(data, options);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        `OAuth authorization code exchange failed: ${error.message}`
      );
    }
  }

  async refreshToken(options = {}) {
    try {
      const { client, oauthConfig } = this.authManager;
      const refreshToken = await this.authManager.getRefreshToken();
      if (!refreshToken) {
        throw new AuthenticationError("No refresh token available");
      }

      if (!oauthConfig.clientId || !oauthConfig.clientSecret) {
        throw new AuthenticationError("OAuth client credentials are required");
      }

      const tokenUrl =
        oauthConfig.tokenUrl || `${client.baseUrl}/oauth/token`;

      const params = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: oauthConfig.clientId,
        client_secret: oauthConfig.clientSecret,
        refresh_token: refreshToken,
      });

      const response = await fetch(tokenUrl, {
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
      return this._persistTokenResponse(data, options);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(`Token refresh failed: ${error.message}`);
    }
  }

  async fetchUserDetails(token) {
    return fetchUserDetails(this.authManager, token);
  }

  async login() {
    throw new AuthenticationError(
      "Direct login is not supported for authorization_code grant — use exchangeCode() after redirect callback"
    );
  }

  async _persistTokenResponse(data, options = {}) {
    const session = this.authManager.session;
    const maxAge = this.authManager.resolveMaxAge(
      options?.tokenMaxAge,
      session?.tokenMaxAge,
      data?.expires_in
    );
    const tokenOptions = maxAge ? { maxAge } : undefined;

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
  }
}
