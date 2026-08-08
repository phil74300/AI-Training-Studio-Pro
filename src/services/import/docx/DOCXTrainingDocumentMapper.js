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

export class DOCXTrainingDocumentMapper {
  constructor(options = {}) {
    this.clock = options.clock || (() => new Date());
  }

  map(parsedDocument, structure, options = {}) {
    const timestamp = this.clock().toISOString();
    let sequence = 0;
    const nextId = (type) => `docx-${type}-${++sequence}`;
    const documentId =
      options.documentId || `docx-document-${slug(structure.title)}`;
    const imageById = new Map(
      parsedDocument.images.map((image) => [image.id, image])
    );
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
          text:
            block.type === "list"
              ? block.items.join("\n")
              : block.type === "table"
                ? null
                : block.text,
          data: {
            source: { type: "docx", location: block.location },
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
        metadata: { source: { type: "docx", location: section.location } },
      })),
      assessments: [],
      activities: [],
      media: [],
      metadata: { source: { type: "docx", location: chapter.location } },
    }));
    const media = structure.images.map((image) => {
      const parsedImage = imageById.get(image.imageId);
      return {
        id: nextId("media"),
        type: MediaReferenceType.IMAGE,
        title: "DOCX embedded image",
        uri: null,
        artifactId: `docx-image-${image.imageId}`,
        mimeType: parsedImage?.contentType || null,
        altText: image.altText,
        caption: null,
        transcript: null,
        metadata: {
          source: { type: "docx", location: image.location },
          extracted: false,
        },
      };
    });

    return new TrainingDocument({
      id: documentId,
      title: structure.title,
      description: parsedDocument.metadata.subject,
      metadata: {
        language: options.language || parsedDocument.metadata.language || "und",
        documentVersion: "1.0",
        status: TrainingDocumentStatus.DRAFT,
        createdAt: timestamp,
        updatedAt: timestamp,
        authors: parsedDocument.metadata.author
          ? [parsedDocument.metadata.author]
          : [],
        tags: parsedDocument.metadata.keywords
          ? parsedDocument.metadata.keywords
              .split(/[,;]/)
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        source: {
          type: "docx",
          fileName: options.fileName || null,
          application: parsedDocument.metadata.application,
          createdAt: parsedDocument.metadata.createdAt,
          updatedAt: parsedDocument.metadata.updatedAt,
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
          metadata: { source: { type: "docx" } },
        },
      ],
      assessments: [],
      activities: [],
      media,
    });
  }
}
