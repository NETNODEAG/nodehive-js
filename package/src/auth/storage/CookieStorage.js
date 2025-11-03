export class CookieStorage {
  async get(key) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${key}=`);
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
    return null;
  }

  /**
   * Sets a value in storage.
   * @param {string} key
   * @param {string} value
   * @param {object} [options]
   */
  async set(key, value, options = {}) {
    const {
      maxAge = 31536000,
      path = "/",
      sameSite = "None",
      secure = true,
    } = options;

    let cookie = `${key}=${value}; path=${path}`;
    if (maxAge) cookie += `; max-age=${maxAge}`;
    if (sameSite) cookie += `; SameSite=${sameSite}`;
    if (secure) cookie += `; Secure`;

    document.cookie = cookie;
  }

  async remove(key) {
    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}
