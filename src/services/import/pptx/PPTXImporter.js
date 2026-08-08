import { normalizePPTXImportError } from "./PPTXImportError";
import { PPTXImportResult } from "./PPTXImportResult";
import { PPTXParser } from "./PPTXParser";
import { PPTXStructureAnalyzer } from "./PPTXStructureAnalyzer";
import { PPTXTrainingDocumentMapper } from "./PPTXTrainingDocumentMapper";

const collectStatistics = (parsed, structure) => ({
  slideCount: parsed.slides.length,
  characterCount: structure.slides.reduce(
    (total, slide) =>
      total +
      slide.blocks.reduce(
        (slideTotal, block) =>
          slideTotal + (block.text || block.items?.join("") || "").length,
        0
      ),
    0
  ),
  paragraphCount: structure.slides
    .flatMap((slide) => slide.blocks)
    .filter((block) => block.type === "paragraph").length,
  listCount: structure.slides
    .flatMap((slide) => slide.blocks)
    .filter((block) => block.type === "list").length,
  tableCount: structure.slides
    .flatMap((slide) => slide.blocks)
    .filter((block) => block.type === "table").length,
  imageReferenceCount: structure.images.length,
});

export class PPTXImporter {
  constructor(options = {}) {
    this.parser = options.parser || new PPTXParser();
    this.structureAnalyzer =
      options.structureAnalyzer || new PPTXStructureAnalyzer();
    this.mapper = options.mapper || new PPTXTrainingDocumentMapper();
  }
  async import(input, options = {}) {
    let stage = "parsing";
    try {
      const parsed = await this.parser.parse(input);
      stage = "structure";
      const structure = this.structureAnalyzer.analyze(parsed, options);
      stage = "mapping";
      const document = this.mapper.map(parsed, structure, options);
      const warnings = structure.unsupportedElements.length
        ? [
            {
              code: "unsupported-elements",
              message:
                "Some presentation elements were not represented in the imported training document.",
            },
          ]
        : [];
      if (structure.images.length)
        warnings.push({
          code: "images-referenced-only",
          message:
            "Embedded images were preserved as references and were not extracted.",
        });
      return PPTXImportResult.completed({
        document,
        warnings,
        unsupportedElements: structure.unsupportedElements,
        detectedStructure: structure,
        statistics: collectStatistics(parsed, structure),
      });
    } catch (error) {
      return PPTXImportResult.failed(normalizePPTXImportError(error, stage));
    }
  }
}
