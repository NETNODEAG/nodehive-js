import { AuthenticationError } from "../../errors.js";

export class ApiKeyStrategy {
  constructor(authManager) {
    this.authManager = authManager;
    this.apiKey = authManager.authConfig?.apiKey;

    if (this.apiKey) {
      authManager.setToken(this.apiKey);
    }
  }

  async login(username, password, options = {}) {
    throw new AuthenticationError("API Key strategy does not support login");
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
