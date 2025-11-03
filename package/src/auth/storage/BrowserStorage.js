export class BrowserStorage {
  constructor(type = "localStorage") {
    if (typeof window === "undefined") {
      throw new Error(
        "BrowserStorage can only be used in a browser environment."
      );
    }
    if (type === "sessionStorage") {
      this.storage = window.sessionStorage;
    } else if (type === "localStorage") {
      this.storage = window.localStorage;
    } else {
      throw new Error(`Unsupported storage type: ${type}`);
    }
  }

  async get(key) {
    return this.storage.getItem(key);
  }

  /**
   * Sets a value in storage
   * @param {string} key
   * @param {string} value
   * @param {object} [options] - Options such as { maxAge }, which are ignored.
   */
  async set(key, value, options) {
    this.storage.setItem(key, value);
  }

  async remove(key) {
    this.storage.removeItem(key);
  }
}
