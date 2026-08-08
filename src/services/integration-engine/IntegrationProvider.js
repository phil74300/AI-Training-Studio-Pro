export const IntegrationProvider = Object.freeze({
  LEARNING_PLATFORMS: Object.freeze({
    LEARNING_360: "360LEARNING",
    MOODLE: "MOODLE",
    GOOGLE_CLASSROOM: "GOOGLE_CLASSROOM",
    MICROSOFT_TEAMS: "MICROSOFT_TEAMS",
  }),
  MEDIA_PLATFORMS: Object.freeze({
    CANVA: "CANVA",
    GENIALLY: "GENIALLY",
    HEYGEN: "HEYGEN",
  }),
  STANDARDS: Object.freeze({
    SCORM: "SCORM",
    XAPI: "XAPI",
    CMI5: "CMI5",
  }),
});

export const IntegrationProviderId = Object.freeze(
  Object.values(IntegrationProvider).flatMap((providers) =>
    Object.values(providers)
  )
);
