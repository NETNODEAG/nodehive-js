import { AuthenticationError } from "../../errors.js";

export class ApiKeyStrategy {
  constructor(authManager) {
    this.authManager = authManager;

    if (!this.authManager.apiKey) {
      throw new AuthenticationError("API key is required for API Key strategy");
    }

    this.ready = this.login().catch((err) => {
      this.ready = Promise.reject(err);
      throw err;
    });
  }

  async login(username, password, options = {}) {
    try {
      await this.authManager.setToken(this.authManager.apiKey);
      return {
        success: true,
        token: this.authManager.apiKey,
      };
    } catch (error) {
      throw new AuthenticationError("Failed to set API key token in storage");
    }
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
