import { Activity } from "./Activity";
import { Assessment } from "./Assessment";
import { DocumentMetadata } from "./DocumentMetadata";
import { LearningObjective } from "./LearningObjective";
import { MediaReference } from "./MediaReference";
import { TrainingModule } from "./TrainingModule";
import {
  assertKnownFields,
  normalizeModelArray,
  normalizeSchemaVersion,
  optionalText,
  requireRecord,
  requireText,
  toRecordArray,
} from "./TrainingDocumentValue";

export const TRAINING_DOCUMENT_SCHEMA_VERSION = 1;

const fields = Object.freeze([
  "schemaVersion",
  "id",
  "title",
  "description",
  "metadata",
  "learningObjectives",
  "modules",
  "assessments",
  "activities",
  "media",
]);

const validateDocumentGraph = (document) => {
  const entityPaths = new Map();
  const objectiveIds = new Set();
  const objectiveReferences = [];

  const register = (entity, path) => {
    const existingPath = entityPaths.get(entity.id);

    if (existingPath) {
      throw new Error(
        `Duplicate training document entity id ${entity.id}: ${existingPath}, ${path}`
      );
    }

    entityPaths.set(entity.id, path);
  };

  const registerReferences = (entity, path) => {
    entity.objectiveIds?.forEach((objectiveId) =>
      objectiveReferences.push({ objectiveId, path })
    );
  };

  const visitBlocks = (blocks, path) => {
    blocks.forEach((block, index) => {
      const blockPath = `${path}.blocks[${index}]`;

      register(block, blockPath);
      visitBlocks(block.children, blockPath);
    });
  };

  const visitPedagogicalElements = (container, path) => {
    container.learningObjectives.forEach((objective, index) => {
      register(objective, `${path}.learningObjectives[${index}]`);
      objectiveIds.add(objective.id);
    });
    container.assessments.forEach((assessment, assessmentIndex) => {
      const assessmentPath = `${path}.assessments[${assessmentIndex}]`;

      register(assessment, assessmentPath);
      registerReferences(assessment, assessmentPath);
      assessment.questions.forEach((question, questionIndex) => {
        const questionPath = `${assessmentPath}.questions[${questionIndex}]`;

        register(question, questionPath);
        registerReferences(question, questionPath);
      });
    });
    container.activities.forEach((activity, activityIndex) => {
      const activityPath = `${path}.activities[${activityIndex}]`;

      register(activity, activityPath);
      registerReferences(activity, activityPath);
      activity.media.forEach((media, mediaIndex) =>
        register(media, `${activityPath}.media[${mediaIndex}]`)
      );
    });
    container.media.forEach((media, index) =>
      register(media, `${path}.media[${index}]`)
    );
  };

  register(document, "TrainingDocument");
  visitPedagogicalElements(document, "TrainingDocument");
  document.modules.forEach((module, moduleIndex) => {
    const modulePath = `TrainingDocument.modules[${moduleIndex}]`;

    register(module, modulePath);
    visitPedagogicalElements(module, modulePath);
    module.chapters.forEach((chapter, chapterIndex) => {
      const chapterPath = `${modulePath}.chapters[${chapterIndex}]`;

      register(chapter, chapterPath);
      visitPedagogicalElements(chapter, chapterPath);
      chapter.sections.forEach((section, sectionIndex) => {
        const sectionPath = `${chapterPath}.sections[${sectionIndex}]`;

        register(section, sectionPath);
        visitPedagogicalElements(section, sectionPath);
        visitBlocks(section.blocks, sectionPath);
      });
    });
  });

  objectiveReferences.forEach(({ objectiveId, path }) => {
    if (!objectiveIds.has(objectiveId)) {
      throw new Error(
        `${path} references an unknown learning objective: ${objectiveId}`
      );
    }
  });
};

export class TrainingDocument {
  constructor(definition) {
    const value = requireRecord(definition, "TrainingDocument");

    assertKnownFields(value, fields, "TrainingDocument");

    this.schemaVersion = normalizeSchemaVersion(
      value.schemaVersion ?? TRAINING_DOCUMENT_SCHEMA_VERSION,
      "TrainingDocument.schemaVersion"
    );
    this.id = requireText(value.id, "TrainingDocument.id");
    this.title = requireText(value.title, "TrainingDocument.title");
    this.description = optionalText(
      value.description ?? null,
      "TrainingDocument.description"
    );
    this.metadata = DocumentMetadata.from(value.metadata);
    this.learningObjectives = normalizeModelArray(
      value.learningObjectives || [],
      LearningObjective,
      "TrainingDocument.learningObjectives"
    );
    this.modules = normalizeModelArray(
      value.modules || [],
      TrainingModule,
      "TrainingDocument.modules"
    );
    this.assessments = normalizeModelArray(
      value.assessments || [],
      Assessment,
      "TrainingDocument.assessments"
    );
    this.activities = normalizeModelArray(
      value.activities || [],
      Activity,
      "TrainingDocument.activities"
    );
    this.media = normalizeModelArray(
      value.media || [],
      MediaReference,
      "TrainingDocument.media"
    );

    validateDocumentGraph(this);

    Object.freeze(this);
  }

  static from(value) {
    return value instanceof TrainingDocument
      ? value
      : new TrainingDocument(value);
  }

  toRecord() {
    return {
      schemaVersion: this.schemaVersion,
      id: this.id,
      title: this.title,
      description: this.description,
      metadata: this.metadata.toRecord(),
      learningObjectives: toRecordArray(this.learningObjectives),
      modules: toRecordArray(this.modules),
      assessments: toRecordArray(this.assessments),
      activities: toRecordArray(this.activities),
      media: toRecordArray(this.media),
    };
  }
}
