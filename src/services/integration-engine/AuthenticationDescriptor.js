export const AuthenticationMethodDescriptor = Object.freeze({
  API_KEY: "API_KEY",
  OAUTH2: "OAUTH2",
  SSO: "SSO",
  TOKEN: "TOKEN",
  CERTIFICATE: "CERTIFICATE",
});

const methods = new Set(Object.values(AuthenticationMethodDescriptor));

export class AuthenticationDescriptor {
  constructor(definition) {
    if (!definition?.id || !methods.has(definition?.method))
      throw new TypeError(
        "AuthenticationDescriptor requires id and a supported method."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.method = definition.method;
    this.credentialReference = definition.credentialReference || null;
    this.credentialIsolationReference =
      definition.credentialIsolationReference || null;
    this.tenantScopeReference = definition.tenantScopeReference || null;
    this.consentReference = definition.consentReference || null;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
