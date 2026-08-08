import { TrainingDocument } from "../../training-document/TrainingDocument";

export class PedagogicalIssueAnalyzer {
  analyze(value, structure, objectives, assessments) {
    const document = TrainingDocument.from(value);
    const missingElements = [];
    const inconsistencies = [];
    const warnings = [];

    if (!objectives.hasObjectives) {
      missingElements.push("No learning objectives are defined.");
    }

    if (structure.modules.length === 0) {
      missingElements.push("No training modules are defined.");
    }

    if (structure.chapters.length === 0) {
      missingElements.push("No training chapters are defined.");
    }

    if (assessments.existingAssessmentCount === 0) {
      missingElements.push("No assessment method is defined.");
    }

    structure.modules
      .filter((module) => module.chapterCount === 0)
      .forEach((module) => {
        inconsistencies.push(`Module "${module.title}" has no chapters.`);
      });
    structure.chapters
      .filter((chapter) => chapter.sectionCount === 0)
      .forEach((chapter) => {
        inconsistencies.push(`Chapter "${chapter.title}" has no sections.`);
      });

    if (!document.description) {
      warnings.push(
        "The document has no description to explain its training scope."
      );
    }

    return Object.freeze({
      missingElements: Object.freeze(missingElements),
      potentialInconsistencies: Object.freeze(inconsistencies),
      warnings: Object.freeze(warnings),
    });
  }
}
