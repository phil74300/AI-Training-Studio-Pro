import { MembershipStatus } from "./MembershipStatus";
import { UserRole } from "./UserRole";

const roles = new Set(Object.values(UserRole));
const statuses = new Set(Object.values(MembershipStatus));

export class Membership {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.userId ||
      !definition?.organizationId ||
      !roles.has(definition?.role)
    )
      throw new TypeError(
        "Membership requires id, userId, organizationId, and a supported role."
      );
    const status = definition.status || MembershipStatus.ACTIVE;
    if (!statuses.has(status))
      throw new TypeError("Membership requires a supported status.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.userId = definition.userId;
    this.organizationId = definition.organizationId;
    this.role = definition.role;
    this.status = status;
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
