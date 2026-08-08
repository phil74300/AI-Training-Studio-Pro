import { TrainingDocument } from "../../training-document/TrainingDocument";

const freeze = (value) => {
  if (Array.isArray(value)) {
    return Object.freeze(value.map(freeze));
  }

  if (value && typeof value === "object") {
    return Object.freeze(
      Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, freeze(item)])
      )
    );
  }

  return value;
};

const sectionReference = (module, chapter, section) => ({
  type: "section",
  id: section.id,
  path: `modules.${module.id}.chapters.${chapter.id}.sections.${section.id}`,
  title: section.title,
});

export class DocumentStructureAnalyzer {
  analyze(value) {
    const document = TrainingDocument.from(value);
    const modules = [];
    const chapters = [];
    const sections = [];

    document.modules.forEach((module) => {
      modules.push({
        id: module.id,
        title: module.title,
        order: module.order,
        chapterCount: module.chapters.length,
        sourceReference: {
          type: "module",
          id: module.id,
          path: `modules.${module.id}`,
          title: module.title,
        },
      });

      module.chapters.forEach((chapter) => {
        chapters.push({
          id: chapter.id,
          moduleId: module.id,
          title: chapter.title,
          order: chapter.order,
          sectionCount: chapter.sections.length,
          sourceReference: {
            type: "chapter",
            id: chapter.id,
            path: `modules.${module.id}.chapters.${chapter.id}`,
            title: chapter.title,
          },
        });

        chapter.sections.forEach((section) => {
          sections.push({
            id: section.id,
            chapterId: chapter.id,
            title: section.title,
            type: section.type,
            order: section.order,
            blockCount: section.blocks.length,
            sourceReference: sectionReference(module, chapter, section),
          });
        });
      });
    });

    return freeze({
      title: document.title,
      description: document.description,
      modules,
      chapters,
      sections,
      sourceReferences: [
        {
          type: "training-document",
          id: document.id,
          path: "document",
          title: document.title,
        },
        ...modules.map((module) => module.sourceReference),
        ...chapters.map((chapter) => chapter.sourceReference),
        ...sections.map((section) => section.sourceReference),
      ],
    });
  }
}
