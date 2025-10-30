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

  async set(key, value) {
    this.storage.setItem(key, value);
  }

  async remove(key) {
    this.storage.removeItem(key);
  }
}
