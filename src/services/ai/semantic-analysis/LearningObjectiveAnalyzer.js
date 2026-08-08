import { TrainingDocument } from "../../training-document/TrainingDocument";

const freeze = (value) =>
  Object.freeze(value.map((item) => Object.freeze(item)));

export class LearningObjectiveAnalyzer {
  analyze(value) {
    const document = TrainingDocument.from(value);
    const objectives = [];

    const addObjectives = (items, path, owner) => {
      items.forEach((objective) => {
        objectives.push({
          id: objective.id,
          statement: objective.statement,
          domain: objective.domain,
          taxonomyLevel: objective.taxonomyLevel,
          sourceReference: {
            type: "learning-objective",
            id: objective.id,
            path: `${path}.learningObjectives.${objective.id}`,
            title: owner,
          },
        });
      });
    };

    addObjectives(document.learningObjectives, "document", document.title);
    document.modules.forEach((module) => {
      addObjectives(
        module.learningObjectives,
        `modules.${module.id}`,
        module.title
      );
      module.chapters.forEach((chapter) => {
        addObjectives(
          chapter.learningObjectives,
          `modules.${module.id}.chapters.${chapter.id}`,
          chapter.title
        );
        chapter.sections.forEach((section) => {
          addObjectives(
            section.learningObjectives,
            `modules.${module.id}.chapters.${chapter.id}.sections.${section.id}`,
            section.title
          );
        });
      });
    });

    return Object.freeze({
      objectives: freeze(objectives),
      hasObjectives: objectives.length > 0,
      sourceReferences: freeze(
        objectives.map((objective) => objective.sourceReference)
      ),
    });
  }
}
