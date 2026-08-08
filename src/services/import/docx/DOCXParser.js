import JSZip from "jszip";
import mammoth from "mammoth/mammoth.browser.js";

import {
  DOCXImportError,
  DOCXImportErrorCode,
  normalizeDOCXImportError,
} from "./DOCXImportError";

const DOCX_SIGNATURE = [0x50, 0x4b, 0x03, 0x04];
const DEFAULT_MAX_BYTES = 25 * 1024 * 1024;
const MAX_ARCHIVE_ENTRIES = 5000;
const MAX_UNCOMPRESSED_BYTES = 100 * 1024 * 1024;
const IMAGE_REFERENCE = /^docx-image-(\d+)$/;
const SUPPORTED_TAGS = new Set([
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "img",
  "br",
]);
const VOID_TAGS = new Set(["img", "br"]);

const toBytes = (input) => {
  if (input instanceof Uint8Array) return new Uint8Array(input);
  if (input instanceof ArrayBuffer) return new Uint8Array(input.slice(0));
  throw new DOCXImportError(DOCXImportErrorCode.INVALID_DOCX, {
    stage: "validation",
  });
};
const isDOCXArchive = (bytes) =>
  DOCX_SIGNATURE.every((value, index) => bytes[index] === value);
const decodeText = (value) =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    );
const normalizeText = (value) => decodeText(value).replace(/\s+/g, " ").trim();

const readAttributes = (value = "") => {
  const attributes = {};
  const expression =
    /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = expression.exec(value)))
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  return attributes;
};
const createNode = (tag, attributes = {}) => ({
  tag,
  attributes,
  children: [],
});

const parseHtmlFragment = (html) => {
  const root = createNode("root");
  const stack = [root];
  const tagExpression = /<\/?([a-z][\w-]*)(?:\s+([^>]*?))?\s*\/?>/gi;
  let cursor = 0;
  let match;
  const appendText = (value) => {
    if (value) stack.at(-1).children.push({ tag: "#text", value });
  };
  while ((match = tagExpression.exec(html))) {
    appendText(html.slice(cursor, match.index));
    cursor = tagExpression.lastIndex;
    const fullTag = match[0];
    const tag = match[1].toLowerCase();
    if (!SUPPORTED_TAGS.has(tag)) continue;
    if (fullTag.startsWith("</")) {
      for (let index = stack.length - 1; index > 0; index -= 1) {
        if (stack[index].tag === tag) {
          stack.length = index;
          break;
        }
      }
      continue;
    }
    const node = createNode(tag, readAttributes(match[2]));
    stack.at(-1).children.push(node);
    if (!VOID_TAGS.has(tag) && !fullTag.endsWith("/>")) stack.push(node);
  }
  appendText(html.slice(cursor));
  return root;
};

const nodeText = (node) =>
  normalizeText(
    node.children
      .map((child) =>
        child.tag === "#text"
          ? child.value
          : child.tag === "br"
            ? " "
            : nodeText(child)
      )
      .join(" ")
  );
const directChildren = (node, tag) =>
  node.children.filter((child) => child.tag === tag);
const tableRows = (node) => {
  const rows = [];
  const visit = (candidate) => {
    if (candidate.tag === "tr") {
      const cells = candidate.children
        .filter((child) => child.tag === "td" || child.tag === "th")
        .map(nodeText)
        .filter(Boolean);
      if (cells.length) rows.push(cells);
      return;
    }
    candidate.children.forEach(visit);
  };
  visit(node);
  return rows;
};
const sourceLocation = (index) => ({
  type: "document-order",
  index,
  pageNumber: null,
});

const contentFromTree = (root) => {
  const elements = [];
  let locationIndex = 0;
  const add = (definition) => {
    locationIndex += 1;
    elements.push({ ...definition, location: sourceLocation(locationIndex) });
  };
  const visit = (node) => {
    if (node.tag === "#text" || node.tag === "br") return;
    if (/^h[1-6]$/.test(node.tag)) {
      const text = nodeText(node);
      if (text) add({ type: "heading", level: Number(node.tag[1]), text });
      return;
    }
    if (node.tag === "p") {
      const text = nodeText(node);
      if (text) add({ type: "paragraph", text });
      node.children.filter((child) => child.tag === "img").forEach(visit);
      return;
    }
    if (node.tag === "ul" || node.tag === "ol") {
      const items = directChildren(node, "li").map(nodeText).filter(Boolean);
      if (items.length)
        add({ type: "list", ordered: node.tag === "ol", items });
      return;
    }
    if (node.tag === "table") {
      const rows = tableRows(node);
      if (rows.length) add({ type: "table", rows });
      return;
    }
    if (node.tag === "img") {
      const imageId = IMAGE_REFERENCE.exec(node.attributes.src || "")?.[1];
      if (imageId)
        add({
          type: "image",
          imageId: Number(imageId),
          altText: normalizeText(node.attributes.alt || "") || null,
        });
      return;
    }
    node.children.forEach(visit);
  };
  root.children.forEach(visit);
  return elements;
};

const xmlText = (xml, localName) => {
  const expression = new RegExp(
    `<(?:(?:\\w+):)?${localName}[^>]*>([\\s\\S]*?)<\\/(?:(?:\\w+):)?${localName}>`,
    "i"
  );
  const match = expression.exec(xml || "");
  return match ? normalizeText(match[1]) || null : null;
};

const readCoreMetadata = async (bytes, options) => {
  let archive;
  try {
    archive = await options.zipLoader.loadAsync(bytes, {
      checkCRC32: true,
      createFolders: false,
    });
  } catch {
    throw new DOCXImportError(DOCXImportErrorCode.INVALID_DOCX, {
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
    !archive.file("word/document.xml")
  )
    throw new DOCXImportError(DOCXImportErrorCode.UNSUPPORTED_DOCX, {
      stage: "validation",
    });
  const coreProperties = await archive.file("docProps/core.xml")?.async("text");
  const appProperties = await archive.file("docProps/app.xml")?.async("text");
  return Object.freeze({
    title: xmlText(coreProperties, "title"),
    author: xmlText(coreProperties, "creator"),
    language: xmlText(coreProperties, "language"),
    subject: xmlText(coreProperties, "subject"),
    keywords: xmlText(coreProperties, "keywords"),
    createdAt: xmlText(coreProperties, "created"),
    updatedAt: xmlText(coreProperties, "modified"),
    application: xmlText(appProperties, "Application"),
  });
};

export class DOCXParser {
  constructor(options = {}) {
    this.converter = options.converter || mammoth;
    this.zipLoader = options.zipLoader || JSZip;
    this.maxBytes = options.maxBytes || DEFAULT_MAX_BYTES;
    this.maxArchiveEntries = options.maxArchiveEntries || MAX_ARCHIVE_ENTRIES;
    this.maxUncompressedBytes =
      options.maxUncompressedBytes || MAX_UNCOMPRESSED_BYTES;
  }

  async parse(input) {
    const bytes = toBytes(input);
    if (!bytes.length || !isDOCXArchive(bytes))
      throw new DOCXImportError(DOCXImportErrorCode.INVALID_DOCX, {
        stage: "validation",
      });
    if (bytes.length > this.maxBytes)
      throw new DOCXImportError(DOCXImportErrorCode.UNSUPPORTED_DOCX, {
        stage: "validation",
      });
    try {
      const metadata = await readCoreMetadata(bytes, this);
      const images = [];
      const result = await this.converter.convertToHtml(
        {
          arrayBuffer: bytes.buffer.slice(
            bytes.byteOffset,
            bytes.byteOffset + bytes.byteLength
          ),
        },
        {
          convertImage: this.converter.images.imgElement((image) => {
            const id = images.length + 1;
            images.push({ id, contentType: image.contentType || null });
            return { src: `docx-image-${id}` };
          }),
        }
      );
      const elements = contentFromTree(parseHtmlFragment(result.value));
      if (!elements.length)
        throw new DOCXImportError(DOCXImportErrorCode.EMPTY_DOCUMENT, {
          stage: "parsing",
        });
      return Object.freeze({
        version: 1,
        metadata,
        elements: Object.freeze(elements.map(Object.freeze)),
        images: Object.freeze(images.map(Object.freeze)),
        warnings: Object.freeze(
          result.messages.length
            ? [
                {
                  code: "conversion-warnings",
                  message:
                    "Some DOCX formatting could not be represented in the imported training document.",
                },
              ]
            : []
        ),
      });
    } catch (error) {
      throw normalizeDOCXImportError(error, "parsing");
    }
  }
}
