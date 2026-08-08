import { parsePresentation } from "@office-open/pptx";
import JSZip from "jszip";

import {
  PPTXImportError,
  PPTXImportErrorCode,
  normalizePPTXImportError,
} from "./PPTXImportError";

const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04];
const DEFAULT_MAX_BYTES = 25 * 1024 * 1024;
const MAX_ARCHIVE_ENTRIES = 5000;
const MAX_UNCOMPRESSED_BYTES = 100 * 1024 * 1024;

const toBytes = (input) => {
  if (input instanceof Uint8Array) return new Uint8Array(input);
  if (input instanceof ArrayBuffer) return new Uint8Array(input.slice(0));
  throw new PPTXImportError(PPTXImportErrorCode.INVALID_PPTX, {
    stage: "validation",
  });
};
const decodeXmlText = (value) =>
  value
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
const xmlText = (xml, localName) => {
  const expression = new RegExp(
    `<(?:(?:\\w+):)?${localName}[^>]*>([\\s\\S]*?)<\\/(?:(?:\\w+):)?${localName}>`,
    "i"
  );
  const match = expression.exec(xml || "");
  return match ? decodeXmlText(match[1]) || null : null;
};
const paragraphText = (paragraph) =>
  paragraph?.text ||
  paragraph?.children
    ?.map((run) => (typeof run === "string" ? run : run.text || ""))
    .join("") ||
  "";
const slideLocation = (slideNumber, elementIndex) => ({
  type: "slide",
  slideNumber,
  elementIndex,
});

const readArchiveMetadata = async (bytes, options) => {
  let archive;
  try {
    archive = await options.zipLoader.loadAsync(bytes, {
      checkCRC32: true,
      createFolders: false,
    });
  } catch {
    throw new PPTXImportError(PPTXImportErrorCode.INVALID_PPTX, {
      stage: "validation",
    });
  }
  const entries = Object.values(archive.files);
  const uncompressedBytes = entries.reduce(
    (total, entry) => total + (entry._data?.uncompressedSize || 0),
    0
  );
  if (
    entries.length > options.maxArchiveEntries ||
    uncompressedBytes > options.maxUncompressedBytes ||
    !archive.file("[Content_Types].xml") ||
    !archive.file("ppt/presentation.xml")
  )
    throw new PPTXImportError(PPTXImportErrorCode.UNSUPPORTED_PPTX, {
      stage: "validation",
    });
  const core = await archive.file("docProps/core.xml")?.async("text");
  const app = await archive.file("docProps/app.xml")?.async("text");
  return Object.freeze({
    title: xmlText(core, "title"),
    author: xmlText(core, "creator"),
    subject: xmlText(core, "subject"),
    language: xmlText(core, "language"),
    keywords: xmlText(core, "keywords"),
    application: xmlText(app, "Application"),
  });
};

const slideElements = (children, slideNumber, state) => {
  const elements = [];
  const add = (element) => {
    state.elementIndex += 1;
    elements.push({
      ...element,
      location: slideLocation(slideNumber, state.elementIndex),
    });
  };
  const visit = (child) => {
    if (child.shape?.textBody) {
      const paragraphs =
        child.shape.textBody.children ||
        (child.shape.textBody.text
          ? [{ text: child.shape.textBody.text }]
          : []);
      paragraphs.forEach((paragraph) => {
        const text = paragraphText(paragraph).trim();
        if (!text) return;
        const bullet = paragraph.properties?.bullet;
        add(
          bullet && bullet.type !== "none"
            ? { type: "list-item", text, ordered: bullet.type === "autoNum" }
            : {
                type: "paragraph",
                text,
                isTitle: child.shape.placeholder === "title",
              }
        );
      });
      return;
    }
    if (child.table) {
      add({
        type: "table",
        rows: child.table.rows.map((row) =>
          row.cells.map(
            (cell) =>
              cell.text || cell.children?.map(paragraphText).join(" ") || ""
          )
        ),
      });
      return;
    }
    if (child.picture) {
      state.imageIndex += 1;
      add({
        type: "image",
        imageId: state.imageIndex,
        mimeType: child.picture.type ? `image/${child.picture.type}` : null,
        title: child.picture.name || null,
      });
      return;
    }
    if (child.group?.children) {
      slideElements(child.group.children, slideNumber, state).forEach(
        (element) => elements.push(element)
      );
      return;
    }
    state.unsupported.push({
      type: Object.keys(child)[0] || "unknown",
      slideNumber,
      handling: "not-imported",
    });
  };
  children.forEach(visit);
  return elements;
};

export class PPTXParser {
  constructor(options = {}) {
    this.presentationParser = options.presentationParser || parsePresentation;
    this.zipLoader = options.zipLoader || JSZip;
    this.maxBytes = options.maxBytes || DEFAULT_MAX_BYTES;
    this.maxArchiveEntries = options.maxArchiveEntries || MAX_ARCHIVE_ENTRIES;
    this.maxUncompressedBytes =
      options.maxUncompressedBytes || MAX_UNCOMPRESSED_BYTES;
  }
  async parse(input) {
    const bytes = toBytes(input);
    if (
      !bytes.length ||
      !ZIP_SIGNATURE.every((value, index) => bytes[index] === value)
    )
      throw new PPTXImportError(PPTXImportErrorCode.INVALID_PPTX, {
        stage: "validation",
      });
    if (bytes.length > this.maxBytes)
      throw new PPTXImportError(PPTXImportErrorCode.UNSUPPORTED_PPTX, {
        stage: "validation",
      });
    try {
      const metadata = await readArchiveMetadata(bytes, this);
      const presentation = this.presentationParser(bytes);
      if (!presentation.slides?.length)
        throw new PPTXImportError(PPTXImportErrorCode.EMPTY_PRESENTATION, {
          stage: "parsing",
        });
      const state = { elementIndex: 0, imageIndex: 0, unsupported: [] };
      const slides = presentation.slides.map((slide, index) => {
        const slideNumber = index + 1;
        const elements = slideElements(
          slide.children || [],
          slideNumber,
          state
        );
        const title =
          elements.find((element) => element.isTitle)?.text ||
          `Slide ${slideNumber}`;
        const notes =
          typeof slide.notes === "string" && slide.notes.trim()
            ? slide.notes.trim()
            : null;
        return { slideNumber, title, elements, notes };
      });
      return Object.freeze({
        version: 1,
        metadata,
        slides: Object.freeze(slides.map(Object.freeze)),
        images: Object.freeze(
          slides
            .flatMap((slide) =>
              slide.elements.filter((element) => element.type === "image")
            )
            .map(Object.freeze)
        ),
        unsupportedElements: Object.freeze(
          state.unsupported.map(Object.freeze)
        ),
      });
    } catch (error) {
      throw normalizePPTXImportError(error, "parsing");
    }
  }
}
