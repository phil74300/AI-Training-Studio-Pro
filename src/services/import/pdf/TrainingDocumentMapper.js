import {
  MediaReferenceType,
  TrainingContentBlockType,
  TrainingDocument,
  TrainingDocumentStatus,
  TrainingSectionType,
} from "../../training-document";

const slug = (value) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "imported";

export class TrainingDocumentMapper {
  constructor(options = {}) {
    this.clock = options.clock || (() => new Date());
  }

  map(parsedDocument, structure, options = {}) {
    const timestamp = this.clock().toISOString();
    let sequence = 0;
    const nextId = (type) => `pdf-${type}-${++sequence}`;
    const documentId =
      options.documentId || `pdf-document-${slug(structure.title)}`;

    const chapters = structure.chapters.map((chapter, chapterIndex) => ({
      id: nextId("chapter"),
      title: chapter.title,
      description: null,
      order: chapterIndex,
      learningObjectives: [],
      sections: chapter.sections.map((section, sectionIndex) => ({
        id: nextId("section"),
        title: section.title,
        type: TrainingSectionType.CONTENT,
        order: sectionIndex,
        blocks: section.blocks.map((block) => ({
          id: nextId("block"),
          type: TrainingContentBlockType[block.type.toUpperCase()],
          text: block.text,
          data: {
            source: { type: "pdf", pageNumbers: block.pageNumbers },
            ...(block.type === "list"
              ? { ordered: block.ordered, items: block.items }
              : {}),
            ...(block.type === "table" ? { rows: block.rows } : {}),
            ...(block.type === "heading" ? { level: block.level } : {}),
          },
          marks: [],
          children: [],
        })),
        learningObjectives: [],
        assessments: [],
        activities: [],
        media: [],
        metadata: { source: { type: "pdf", pageNumber: section.pageNumber } },
      })),
      assessments: [],
      activities: [],
      media: [],
      metadata: { source: { type: "pdf", pageNumber: chapter.pageNumber } },
    }));

    const media = structure.images.map((image) => ({
      id: nextId("media"),
      type: MediaReferenceType.IMAGE,
      title: `PDF image on page ${image.pageNumber}`,
      uri: null,
      artifactId: image.id,
      mimeType: null,
      altText: null,
      caption: null,
      transcript: null,
      metadata: {
        source: {
          type: "pdf",
          pageNumber: image.pageNumber,
          operatorIndex: image.operatorIndex,
        },
        extracted: false,
      },
    }));

    const metadataLanguage = parsedDocument.metadata.Language;
    const metadataAuthor = parsedDocument.metadata.Author;

    return new TrainingDocument({
      id: documentId,
      title: structure.title,
      description: null,
      metadata: {
        language:
          options.language ||
          (typeof metadataLanguage === "string" && metadataLanguage.trim()) ||
          "und",
        documentVersion: "1.0",
        status: TrainingDocumentStatus.DRAFT,
        createdAt: timestamp,
        updatedAt: timestamp,
        authors:
          typeof metadataAuthor === "string" && metadataAuthor.trim()
            ? [metadataAuthor]
            : [],
        tags: [],
        source: {
          type: "pdf",
          fileName: options.fileName || null,
          pageCount: parsedDocument.pageCount,
          fingerprints: parsedDocument.fingerprints,
        },
        custom: {},
      },
      learningObjectives: [],
      modules: [
        {
          id: nextId("module"),
          title: structure.title,
          description: null,
          order: 0,
          learningObjectives: [],
          chapters,
          assessments: [],
          activities: [],
          media: [],
          metadata: { source: { type: "pdf" } },
        },
      ],
      assessments: [],
      activities: [],
      media,
    });
  }
}
