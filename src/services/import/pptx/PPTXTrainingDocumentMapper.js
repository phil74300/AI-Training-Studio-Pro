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

export class PPTXTrainingDocumentMapper {
  constructor(options = {}) {
    this.clock = options.clock || (() => new Date());
  }
  map(parsedPresentation, structure, options = {}) {
    const timestamp = this.clock().toISOString();
    let sequence = 0;
    const nextId = (type) => `pptx-${type}-${++sequence}`;
    const documentId =
      options.documentId || `pptx-document-${slug(structure.title)}`;
    const chapters = structure.slides.map((slide, index) => ({
      id: nextId("chapter"),
      title: slide.title,
      description: null,
      order: index,
      learningObjectives: [],
      sections: [
        {
          id: nextId("section"),
          title: "Content",
          type: TrainingSectionType.CONTENT,
          order: 0,
          blocks: slide.blocks.map((block) => ({
            id: nextId("block"),
            type: TrainingContentBlockType[block.type.toUpperCase()],
            text:
              block.type === "list"
                ? block.items.join("\n")
                : block.type === "table"
                  ? null
                  : block.text,
            data: {
              source: {
                type: "pptx",
                slideNumber: slide.slideNumber,
                location: block.location,
                ...(block.sourceRole ? { role: block.sourceRole } : {}),
              },
              ...(block.type === "list"
                ? { ordered: block.ordered, items: block.items }
                : {}),
              ...(block.type === "table" ? { rows: block.rows } : {}),
            },
            marks: [],
            children: [],
          })),
          learningObjectives: [],
          assessments: [],
          activities: [],
          media: [],
          metadata: {
            source: { type: "pptx", slideNumber: slide.slideNumber },
          },
        },
      ],
      assessments: [],
      activities: [],
      media: [],
      metadata: { source: { type: "pptx", slideNumber: slide.slideNumber } },
    }));
    const media = structure.images.map((image) => ({
      id: nextId("media"),
      type: MediaReferenceType.IMAGE,
      title: image.title || `PPTX image on slide ${image.location.slideNumber}`,
      uri: null,
      artifactId: `pptx-image-${image.imageId}`,
      mimeType: image.mimeType,
      altText: null,
      caption: null,
      transcript: null,
      metadata: {
        source: {
          type: "pptx",
          slideNumber: image.location.slideNumber,
          location: image.location,
        },
        extracted: false,
      },
    }));
    return new TrainingDocument({
      id: documentId,
      title: structure.title,
      description: parsedPresentation.metadata.subject,
      metadata: {
        language:
          options.language || parsedPresentation.metadata.language || "und",
        documentVersion: "1.0",
        status: TrainingDocumentStatus.DRAFT,
        createdAt: timestamp,
        updatedAt: timestamp,
        authors: parsedPresentation.metadata.author
          ? [parsedPresentation.metadata.author]
          : [],
        tags: parsedPresentation.metadata.keywords
          ? parsedPresentation.metadata.keywords
              .split(/[,;]/)
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        source: {
          type: "pptx",
          fileName: options.fileName || null,
          application: parsedPresentation.metadata.application,
          slideCount: structure.slides.length,
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
          metadata: { source: { type: "pptx" } },
        },
      ],
      assessments: [],
      activities: [],
      media,
    });
  }
}
