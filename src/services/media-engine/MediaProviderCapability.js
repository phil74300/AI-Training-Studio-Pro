export const MediaProvider = Object.freeze({
  CANVA: "CANVA",
  GENIALLY: "GENIALLY",
  HEYGEN: "HEYGEN",
  IMAGE_GENERATOR: "IMAGE_GENERATOR",
  VIDEO_GENERATOR: "VIDEO_GENERATOR",
  VOICE_GENERATOR: "VOICE_GENERATOR",
});

const providers = new Set(Object.values(MediaProvider));

export class MediaProviderCapability {
  constructor(definition) {
    if (!definition?.id || !providers.has(definition?.provider))
      throw new TypeError(
        "MediaProviderCapability requires id and a supported provider."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.provider = definition.provider;
    this.supportedMediaTypes = Object.freeze([
      ...(definition.supportedMediaTypes || []),
    ]);
    this.capabilities = Object.freeze([...(definition.capabilities || [])]);
    this.languageSupport = Object.freeze([
      ...(definition.languageSupport || []),
    ]);
    this.supportsSubtitles = definition.supportsSubtitles === true;
    this.supportsVoiceSynchronization =
      definition.supportsVoiceSynchronization === true;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
