export function buildAuthorizeUrl({
  authorizeUrl,
  clientId,
  redirectUri,
  scope,
  state,
  codeChallenge,
  codeChallengeMethod = "S256",
}) {
  if (!authorizeUrl) throw new Error("authorizeUrl is required");
  if (!clientId) throw new Error("clientId is required");
  if (!redirectUri) throw new Error("redirectUri is required");
  if (!state) throw new Error("state is required");
  if (!codeChallenge) throw new Error("codeChallenge is required");

  const url = new URL(authorizeUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", codeChallengeMethod);
  if (scope) {
    url.searchParams.set("scope", scope);
  }
  return url.toString();
}
