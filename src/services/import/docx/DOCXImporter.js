import { normalizeDOCXImportError } from "./DOCXImportError";
import { DOCXImportResult } from "./DOCXImportResult";
import { DOCXParser } from "./DOCXParser";
import { DOCXStructureAnalyzer } from "./DOCXStructureAnalyzer";
import { DOCXTrainingDocumentMapper } from "./DOCXTrainingDocumentMapper";

const collectStatistics = (parsed, structure) => {
  const blocks = structure.chapters.flatMap((chapter) =>
    chapter.sections.flatMap((section) => section.blocks)
  );
  return {
    elementCount: parsed.elements.length,
    characterCount: parsed.elements.reduce(
      (total, element) =>
        total + (element.text || element.items?.join("") || "").length,
      0
    ),
    chapterCount: structure.chapters.length,
    sectionCount: structure.chapters.reduce(
      (total, chapter) => total + chapter.sections.length,
      0
    ),
    headingCount: structure.headingCount,
    paragraphCount: blocks.filter((block) => block.type === "paragraph").length,
    listCount: blocks.filter((block) => block.type === "list").length,
    tableCount: blocks.filter((block) => block.type === "table").length,
    imageReferenceCount: structure.images.length,
  };
};

export class DOCXImporter {
  constructor(options = {}) {
    this.parser = options.parser || new DOCXParser();
    this.structureAnalyzer =
      options.structureAnalyzer || new DOCXStructureAnalyzer();
    this.mapper = options.mapper || new DOCXTrainingDocumentMapper();
  }

  async import(input, options = {}) {
    let stage = "parsing";
    try {
      const parsed = await this.parser.parse(input);
      stage = "structure";
      const structure = this.structureAnalyzer.analyze(parsed, options);
      stage = "mapping";
      const document = this.mapper.map(parsed, structure, options);
      const unsupportedElements = structure.images.map((image) => ({
        type: "embedded-image-content",
        location: image.location,
        handling: "reference-only",
      }));
      const warnings = [...parsed.warnings];
      if (unsupportedElements.length)
        warnings.push({
          code: "images-referenced-only",
          message:
            "Embedded images were preserved as references and were not extracted.",
        });
      return DOCXImportResult.completed({
        document,
        warnings,
        unsupportedElements,
        detectedStructure: structure,
        statistics: collectStatistics(parsed, structure),
      });
    } catch (error) {
      return DOCXImportResult.failed(normalizeDOCXImportError(error, stage));
    }
  }
}
