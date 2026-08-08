export class MediaMetadata {
  constructor(definition = {}) {
    this.schemaVersion = 1;
    this.dimensions = Object.freeze({ ...(definition.dimensions || {}) });
    this.durationSeconds = definition.durationSeconds ?? null;
    this.format = definition.format || null;
    this.language = definition.language || null;
    this.accessibility = Object.freeze({
      subtitlesReference: definition.accessibility?.subtitlesReference || null,
      transcriptReference:
        definition.accessibility?.transcriptReference || null,
      alternativeText: definition.accessibility?.alternativeText || null,
      language:
        definition.accessibility?.language || definition.language || null,
      status: definition.accessibility?.status || "not-reviewed",
    });
    this.copyright = Object.freeze({ ...(definition.copyright || {}) });
    Object.freeze(this);
  }
}
