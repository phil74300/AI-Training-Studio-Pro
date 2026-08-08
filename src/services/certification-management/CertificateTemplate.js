import { CertificateDesign } from "./CertificateDesign";
import { CertificateField } from "./CertificateField";

export class CertificateTemplate {
  constructor(definition) {
    if (!definition?.id || !definition?.title || !definition?.version)
      throw new TypeError(
        "CertificateTemplate requires id, title, and version."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.title = definition.title;
    this.version = definition.version;
    this.description = definition.description || null;
    this.design =
      definition.design instanceof CertificateDesign
        ? definition.design
        : new CertificateDesign(definition.design);
    this.backgroundReference = definition.backgroundReference || null;
    this.logoReference = definition.logoReference || null;
    this.fontFamily = definition.fontFamily || null;
    this.fontSize = definition.fontSize ?? null;
    this.textStyle = Object.freeze({ ...(definition.textStyle || {}) });
    this.alignment = definition.alignment || "center";
    this.imageReferences = Object.freeze([
      ...(definition.imageReferences || []),
    ]);
    this.signatureReferences = Object.freeze([
      ...(definition.signatureReferences || []),
    ]);
    this.stampReferences = Object.freeze([
      ...(definition.stampReferences || []),
    ]);
    this.textBlocks = Object.freeze([...(definition.textBlocks || [])]);
    this.fields = Object.freeze(
      (definition.fields || []).map((field) =>
        field instanceof CertificateField ? field : new CertificateField(field)
      )
    );
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    this.updatedAt = new Date(
      definition.updatedAt || this.createdAt
    ).toISOString();
    Object.freeze(this);
  }
}
