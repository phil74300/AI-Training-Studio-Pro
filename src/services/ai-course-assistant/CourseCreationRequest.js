import { CourseCreationOutputType } from "./CourseCreationOutputType";
import { cloneValue } from "./ProposalValue";

const outputTypes = new Set(Object.values(CourseCreationOutputType));

export class CourseCreationRequest {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.trainingIdeaReference ||
      !definition?.authorReference ||
      !definition?.language
    )
      throw new TypeError(
        "CourseCreationRequest requires id, trainingIdeaReference, authorReference, and language."
      );
    const requestedOutputTypes = definition.requestedOutputTypes || [];
    if (
      !requestedOutputTypes.length ||
      requestedOutputTypes.some((type) => !outputTypes.has(type))
    )
      throw new TypeError(
        "CourseCreationRequest requires supported requested output types."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.trainingIdeaReference = definition.trainingIdeaReference;
    this.requestedOutputTypes = Object.freeze([...requestedOutputTypes]);
    this.authorReference = definition.authorReference;
    this.language = definition.language;
    this.constraints = cloneValue(definition.constraints || {});
    this.promptDefinitionReference =
      definition.promptDefinitionReference || null;
    this.executionCoordinatorReference =
      definition.executionCoordinatorReference || null;
    this.resultReviewReference = definition.resultReviewReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
