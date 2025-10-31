import { AuthenticationError } from "../../errors.js";

export class ApiKeyStrategy {
  constructor(authManager) {
    this.authManager = authManager;
    this.apiKey = authManager.authConfig?.apiKey;

    if (this.apiKey) {
      authManager.setToken(this.apiKey).catch((error) => {
        console.error("Failed to set API key token in storage", error);
        throw error;
      });
    }
  }

  async login(username, password, options = {}) {
    if (!this.apiKey) {
      throw new AuthenticationError("API key is required for API Key strategy");
    }

    return {
      success: true,
      token: this.apiKey,
    };
  }

  async refreshToken(options = {}) {
    throw new AuthenticationError(
      "API Key strategy does not support token refresh"
    );
  }

  async fetchUserDetails(token) {
    throw new AuthenticationError(
      "API Key strategy does not support fetching user details"
    );
  }
}
