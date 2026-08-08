import { TrainingDocument } from "../training-document";
import { PackagingValidationResult } from "./PackagingValidationResult";
import { TrainingPackageAsset } from "./TrainingPackageAsset";
import { TrainingPackageManifest } from "./TrainingPackageManifest";
import { TrainingPackageMetadata } from "./TrainingPackageMetadata";

export class TrainingPackage {
  constructor(definition) {
    if (!definition?.id) throw new TypeError("TrainingPackage requires an id.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.metadata =
      definition.metadata instanceof TrainingPackageMetadata
        ? definition.metadata
        : new TrainingPackageMetadata(definition.metadata);
    this.manifest =
      definition.manifest instanceof TrainingPackageManifest
        ? definition.manifest
        : new TrainingPackageManifest(definition.manifest);
    this.assets = Object.freeze(
      (definition.assets || []).map((asset) =>
        asset instanceof TrainingPackageAsset
          ? asset
          : new TrainingPackageAsset(asset)
      )
    );
    Object.freeze(this);
  }
  static fromTrainingDocument(value, options = {}) {
    const document = TrainingDocument.from(value);
    const timestamp = (options.clock || (() => new Date()))().toISOString();
    const modules = document.modules;
    const chapters = modules.flatMap((module) => module.chapters);
    const sections = chapters.flatMap((chapter) => chapter.sections);
    const objectives = [
      ...document.learningObjectives,
      ...modules.flatMap((module) => module.learningObjectives),
      ...chapters.flatMap((chapter) => chapter.learningObjectives),
      ...sections.flatMap((section) => section.learningObjectives),
    ];
    const assessments = [
      ...document.assessments,
      ...modules.flatMap((module) => module.assessments),
      ...chapters.flatMap((chapter) => chapter.assessments),
      ...sections.flatMap((section) => section.assessments),
    ];
    const assets = document.media.map(
      (media) =>
        new TrainingPackageAsset({
          id: media.id,
          type: media.type,
          title: media.title,
          artifactId: media.artifactId,
          mimeType: media.mimeType,
          provenance: media.metadata.source,
        })
    );
    return new TrainingPackage({
      id: options.packageId || `package-${document.id}`,
      metadata: {
        title: document.title,
        description: document.description,
        language: document.metadata.language,
        author: document.metadata.authors[0] || null,
        version: document.metadata.documentVersion,
        createdAt: timestamp,
        provenance: document.metadata.source,
      },
      manifest: {
        sourceDocumentId: document.id,
        moduleIds: modules.map((module) => module.id),
        learningObjectiveIds: objectives.map((objective) => objective.id),
        assessmentIds: assessments.map((assessment) => assessment.id),
        assetIds: assets.map((asset) => asset.id),
        sourceProvenance: document.metadata.source,
        capabilities: options.capabilities || [],
      },
      assets,
    });
  }
  validate() {
    return this.manifest.sourceDocumentId && this.metadata.title
      ? PackagingValidationResult.valid()
      : PackagingValidationResult.invalid(["invalid-package"]);
  }
}
