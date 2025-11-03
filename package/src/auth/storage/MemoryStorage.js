export class MemoryStorage {
  constructor() {
    this.data = new Map();
  }

  async get(key) {
    return this.data.get(key) || null;
  }

  /**
   * Sets a value in storage
   * @param {string} key
   * @param {string} value
   * @param {object} [options] - Options such as { maxAge }, which are ignored.
   */
  async set(key, value, options) {
    this.data.set(key, value);
  }

  async remove(key) {
    this.data.delete(key);
  }
}
