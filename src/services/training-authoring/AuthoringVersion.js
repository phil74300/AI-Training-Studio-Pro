import { AuthorReference } from "./AuthorReference";
import { ReviewStatus } from "./ReviewStatus";

const reviewStatuses = new Set(Object.values(ReviewStatus));

export class AuthoringVersion {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.versionNumber ||
      !definition?.authorReference ||
      !definition?.createdAt ||
      !definition?.changesReference
    )
      throw new TypeError(
        "AuthoringVersion requires id, versionNumber, authorReference, createdAt, and changesReference."
      );
    const validationState = definition.validationState || ReviewStatus.DRAFT;
    const createdAt = new Date(definition.createdAt);
    if (!reviewStatuses.has(validationState))
      throw new TypeError(
        "AuthoringVersion requires a supported validationState."
      );
    if (Number.isNaN(createdAt.getTime()))
      throw new TypeError("AuthoringVersion requires a valid creation date.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.versionNumber = definition.versionNumber;
    this.authorReference =
      definition.authorReference instanceof AuthorReference
        ? definition.authorReference
        : new AuthorReference(definition.authorReference);
    this.createdAt = createdAt.toISOString();
    this.changesReference = definition.changesReference;
    this.validationState = validationState;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
