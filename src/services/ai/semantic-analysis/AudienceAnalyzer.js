import { TrainingDocument } from "../../training-document/TrainingDocument";

const audienceKeys = Object.freeze(["audience", "targetAudience", "learners"]);

export class AudienceAnalyzer {
  analyze(value) {
    const document = TrainingDocument.from(value);
    const custom = document.metadata.custom;
    const key = audienceKeys.find(
      (candidate) =>
        typeof custom[candidate] === "string" && custom[candidate].trim()
    );

    return Object.freeze({
      audience: key ? custom[key].trim() : null,
      confidence: key ? 1 : 0,
      sourceReferences: Object.freeze(
        key
          ? [
              Object.freeze({
                type: "document-metadata",
                id: document.id,
                path: `metadata.custom.${key}`,
                title: document.title,
              }),
            ]
          : []
      ),
      warnings: Object.freeze(
        key
          ? []
          : ["Target audience is not explicitly defined in the document."]
      ),
    });
  }
}
