import { ConfigurationError, AuthenticationError } from "../errors.js";
import { MemoryStorage } from "./storage/MemoryStorage.js";
import { ApiKeyStrategy } from "./strategies/ApiKeyStrategy.js";
import { JwtStrategy } from "./strategies/JwtStrategy.js";
import { OAuthClientCredentialsStrategy } from "./strategies/OAuthClientCredentialsStrategy.js";
import { OAuthPasswordStrategy } from "./strategies/OAuthPasswordStrategy.js";

export class AuthManager {
  constructor(client, storageAdapter = null, authConfig = {}) {
    this.client = client;
    this.authConfig = authConfig;
    this.storage = storageAdapter || new MemoryStorage();
    this.authMethod = authConfig.method || "oauth";
    this.oauthConfig = authConfig.oauth || {};
    this.apiKey = authConfig.apiKey || null;
    this.token = null;
    this.tokenExpiresAt = null;
    this.refreshTokenValue = null;
    this.userDetails = null;
    this.strategy = this._setStrategy(this.authMethod);
    this.session = authConfig.session || null;
  }

  async setToken(token, options = {}) {
    this.token = token ?? null;
    if (token) {
      await this.storage.set("token", token, options);
    } else {
      await this.storage.remove("token");
    }
  }

  async getToken() {
    if (this.token) {
      return this.token;
    }
    const stored = await this.storage.get("token");
    if (stored) {
      this.token = stored;
    }
    return this.token;
  }

  async setTokenExpiresAt(timestamp, options = {}) {
    this.tokenExpiresAt = timestamp ?? null;
    if (timestamp) {
      await this.storage.set("token_expires_at", String(timestamp), options);
    } else {
      await this.storage.remove("token_expires_at");
    }
  }

  async getTokenExpiresAt() {
    if (this.tokenExpiresAt) {
      return this.tokenExpiresAt;
    }
    const stored = await this.storage.get("token_expires_at");
    if (stored) {
      const numeric = Number(stored);
      if (Number.isFinite(numeric)) {
        this.tokenExpiresAt = numeric;
      }
    }
    return this.tokenExpiresAt;
  }

  async setRefreshToken(refreshToken, options = {}) {
    this.refreshTokenValue = refreshToken ?? null;
    if (refreshToken) {
      await this.storage.set("refresh_token", refreshToken, options);
    } else {
      await this.storage.remove("refresh_token");
    }
  }

  async getRefreshToken() {
    if (this.refreshTokenValue) {
      return this.refreshTokenValue;
    }
    const stored = await this.storage.get("refresh_token");
    if (stored) {
      this.refreshTokenValue = stored;
    }
    return this.refreshTokenValue;
  }

  async setUserDetails(userDetails, options = {}) {
    this.userDetails = userDetails ?? null;
    if (userDetails) {
      const userDetailsString =
        typeof userDetails === "string"
          ? userDetails
          : JSON.stringify(userDetails);
      await this.storage.set("user_details", userDetailsString, options);
    } else {
      await this.storage.remove("user_details");
    }
  }

  async getUserDetails() {
    if (this.userDetails) {
      return this.userDetails;
    }
    const stored = await this.storage.get("user_details");
    if (stored) {
      try {
        this.userDetails = JSON.parse(stored);
      } catch {
        this.userDetails = stored;
      }
    }
    return this.userDetails;
  }

  async login(username, password, options = {}) {
    return this.strategy.login(username, password, options);
  }

  async refreshToken(options = {}) {
    return this.strategy.refreshToken(options);
  }

  async logout() {
    await this.setToken(null);
    await this.setTokenExpiresAt(null);
    await this.setRefreshToken(null);
    await this.setUserDetails(null);
  }

  async isLoggedIn() {
    const token = await this.getToken();
    if (!token) return false;

    return !!token;
  }

  async isTokenExpired() {
    const expiresAt = await this.getTokenExpiresAt();
    if (!expiresAt) return false;

    const numeric = Number(expiresAt);
    if (!Number.isFinite(numeric)) return false;

    return Date.now() >= numeric;
  }

  decodeJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new AuthenticationError("Failed to decode JWT token");
    }
  }

  async fetchUserDetails(token) {
    return this.strategy.fetchUserDetails(token);
  }

  async hasValidSession() {
    try {
      const token = await this.getToken();
      if (!token) return false;

      const response = await fetch(
        `${this.client.baseUrl}/user/login_status?_format=json`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) return false;
      const sessionData = await response.json();
      return sessionData === 1;
    } catch {
      return false;
    }
  }

  isClientCredentialsGrant() {
    return (
      this.authMethod === "oauth" &&
      this.oauthConfig.grantType === "client_credentials"
    );
  }

  resolveMaxAge(...candidates) {
    for (const ttl of candidates) {
      const numeric = Number(ttl);
      if (Number.isFinite(numeric) && numeric > 0) return numeric;
    }
    return null;
  }

  _setStrategy(authMethod) {
    switch (authMethod) {
      case "nodehive-api-key":
        return new ApiKeyStrategy(this);
      case "jwt":
        return new JwtStrategy(this);
      case "oauth":
        return this.isClientCredentialsGrant()
          ? new OAuthClientCredentialsStrategy(this)
          : new OAuthPasswordStrategy(this);
      default:
        throw new ConfigurationError(
          `Authentication method '${authMethod}' is not supported.`
        );
    }
  }
}
