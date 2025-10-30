import { AuthenticationError } from "../../errors.js";

export class ApiKeyStrategy {
  constructor(authManager) {
    this.authManager = authManager;
    const apiKey = authManager.authConfig?.apiKey;

    if (apiKey) {
      authManager.setToken(apiKey);
    }
  }

  async login() {
    const token = await this.authManager.getToken();
    if (!token) {
      throw new AuthenticationError("NodeHive API Key is not configured");
    }
    return { success: true, token };
  }
}
