export class NodeHiveError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = "NodeHiveError";
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class NetworkError extends NodeHiveError {
  constructor(message, status, response, url) {
    super(message, "NETWORK_ERROR", { status, response, url });
    this.name = "NetworkError";
    this.status = status;
    this.response = response;
    this.url = url;
  }
}

export class ApiError extends NodeHiveError {
  constructor(message, error, response = null) {
    super(message, "API_ERROR", { error, response });
    this.name = "ApiError";
    this.error = error;
    this.response = response;
  }
}

export class AuthenticationError extends NodeHiveError {
  constructor(message, details = {}) {
    super(message, "AUTH_ERROR", details);
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends NodeHiveError {
  constructor(message, field, value) {
    super(message, "VALIDATION_ERROR", { field, value });
    this.name = "ValidationError";
    this.field = field;
    this.value = value;
  }
}

export class ConfigurationError extends NodeHiveError {
  constructor(message, config) {
    super(message, "CONFIG_ERROR", { config });
    this.name = "ConfigurationError";
  }
}
