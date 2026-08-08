import { normalizePDFImportError } from "./PDFImportError";
import { PDFImportResult } from "./PDFImportResult";
import { PDFParser } from "./PDFParser";
import { PDFStructureAnalyzer } from "./PDFStructureAnalyzer";
import { TrainingDocumentMapper } from "./TrainingDocumentMapper";

const collectStatistics = (parsed, structure) => {
  const blocks = structure.chapters.flatMap((chapter) =>
    chapter.sections.flatMap((section) => section.blocks)
  );
  return {
    pageCount: parsed.pageCount,
    textItemCount: parsed.pages.reduce(
      (total, page) => total + page.textItems.length,
      0
    ),
    characterCount: parsed.pages.reduce(
      (total, page) =>
        total +
        page.textItems.reduce(
          (pageTotal, item) => pageTotal + item.text.length,
          0
        ),
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

export class PDFImporter {
  constructor(options = {}) {
    this.parser = options.parser || new PDFParser();
    this.structureAnalyzer =
      options.structureAnalyzer || new PDFStructureAnalyzer();
    this.mapper = options.mapper || new TrainingDocumentMapper();
  }

  async import(input, options = {}) {
    let stage = "parsing";

    try {
      const parsed = await this.parser.parse(input);
      stage = "structure";
      const structure = this.structureAnalyzer.analyze(parsed);
      stage = "mapping";
      const document = this.mapper.map(parsed, structure, options);
      const hasExtractableText = parsed.pages.some(
        (page) => page.textItems.length > 0
      );
      const unsupportedElements = structure.images.map((image) => ({
        type: "embedded-image-content",
        pageNumber: image.pageNumber,
        handling: "reference-only",
      }));
      const warnings = [];

      if (unsupportedElements.length) {
        warnings.push({
          code: "images-referenced-only",
          message:
            "Embedded images were preserved as references and were not extracted.",
        });
      }

      if (!hasExtractableText) {
        warnings.push({
          code: "no-extractable-text",
          message:
            "No extractable text was found; OCR was not performed and the document may be incomplete.",
        });
        unsupportedElements.push({
          type: "scanned-or-textless-content",
          handling: "not-extracted",
        });
      }

      return PDFImportResult.completed({
        document,
        warnings,
        unsupportedElements,
        detectedStructure: structure,
        statistics: collectStatistics(parsed, structure),
      });
    } catch (error) {
      return PDFImportResult.failed(normalizePDFImportError(error, stage));
    }
  }
}
