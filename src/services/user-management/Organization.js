import { OrganizationType } from "./OrganizationType";
import { UserStatus } from "./UserStatus";

const types = new Set(Object.values(OrganizationType));
const statuses = new Set(Object.values(UserStatus));

export class Organization {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.nameReference ||
      !types.has(definition?.type)
    )
      throw new TypeError(
        "Organization requires id, nameReference, and a supported type."
      );
    const status = definition.status || UserStatus.ACTIVE;
    if (!statuses.has(status))
      throw new TypeError("Organization requires a supported status.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.nameReference = definition.nameReference;
    this.type = definition.type;
    this.status = status;
    this.metadata = Object.freeze({ ...(definition.metadata || {}) });
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
