import { getDocument, OPS } from "pdfjs-dist/legacy/build/pdf.mjs";

import {
  PDFImportError,
  PDFImportErrorCode,
  normalizePDFImportError,
} from "./PDFImportError";

const PDF_HEADER = /%PDF-/;
const DEFAULT_MAX_BYTES = 100 * 1024 * 1024;
const DEFAULT_MAX_PAGES = 2000;

const imageOperators = new Set(
  [
    OPS.paintImageXObject,
    OPS.paintJpegXObject,
    OPS.paintInlineImageXObject,
    OPS.paintImageMaskXObject,
  ].filter(Number.isInteger)
);

const toBytes = (input) => {
  if (input instanceof Uint8Array) {
    return new Uint8Array(input);
  }

  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input.slice(0));
  }

  throw new PDFImportError(PDFImportErrorCode.INVALID_PDF, {
    stage: "validation",
  });
};

const safeInfo = (info = {}) =>
  Object.fromEntries(
    Object.entries(info)
      .filter(([, value]) =>
        ["string", "number", "boolean"].includes(typeof value)
      )
      .map(([key, value]) => [key, value])
  );

export class PDFParser {
  constructor(options = {}) {
    this.documentLoader = options.documentLoader || getDocument;
    this.maxBytes = options.maxBytes || DEFAULT_MAX_BYTES;
    this.maxPages = options.maxPages || DEFAULT_MAX_PAGES;
  }

  async parse(input) {
    const bytes = toBytes(input);
    const header = new TextDecoder("latin1").decode(bytes.slice(0, 1024));

    if (!bytes.length || !PDF_HEADER.test(header)) {
      throw new PDFImportError(PDFImportErrorCode.INVALID_PDF, {
        stage: "validation",
      });
    }

    if (bytes.length > this.maxBytes) {
      throw new PDFImportError(PDFImportErrorCode.UNSUPPORTED_PDF, {
        stage: "validation",
      });
    }

    let loadingTask;
    let pdf;

    try {
      loadingTask = this.documentLoader({
        data: bytes,
        disableWorker: true,
        isEvalSupported: false,
        useSystemFonts: true,
      });
      pdf = await loadingTask.promise;

      if (pdf.numPages > this.maxPages) {
        throw new PDFImportError(PDFImportErrorCode.UNSUPPORTED_PDF, {
          stage: "parsing",
        });
      }

      const metadata = await pdf.getMetadata().catch(() => ({ info: {} }));
      const pages = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const [textContent, operatorList] = await Promise.all([
          page.getTextContent({ disableNormalization: false }),
          page.getOperatorList(),
        ]);
        const view = page.getViewport({ scale: 1 });
        let imageIndex = 0;
        const images = [];

        operatorList.fnArray.forEach((operator, operatorIndex) => {
          if (imageOperators.has(operator)) {
            imageIndex += 1;
            images.push({
              id: `page-${pageNumber}-image-${imageIndex}`,
              pageNumber,
              operatorIndex,
            });
          }
        });

        pages.push({
          pageNumber,
          width: view.width,
          height: view.height,
          textItems: textContent.items
            .filter((item) => typeof item.str === "string" && item.str.trim())
            .map((item, index) => ({
              id: `page-${pageNumber}-text-${index + 1}`,
              text: item.str.trim(),
              x: item.transform?.[4] || 0,
              y: item.transform?.[5] || 0,
              width: item.width || 0,
              height: item.height || 0,
              fontSize: Math.max(
                Math.hypot(item.transform?.[0] || 0, item.transform?.[1] || 0),
                Math.hypot(item.transform?.[2] || 0, item.transform?.[3] || 0)
              ),
              fontName: item.fontName || null,
              hasEOL: Boolean(item.hasEOL),
            })),
          images,
        });
        page.cleanup();
      }

      return Object.freeze({
        version: 1,
        pageCount: pdf.numPages,
        fingerprints: Object.freeze([...(pdf.fingerprints || [])]),
        metadata: Object.freeze(safeInfo(metadata.info)),
        pages: Object.freeze(
          pages.map((page) =>
            Object.freeze({
              ...page,
              textItems: Object.freeze(page.textItems.map(Object.freeze)),
              images: Object.freeze(page.images.map(Object.freeze)),
            })
          )
        ),
      });
    } catch (error) {
      throw normalizePDFImportError(error, "parsing");
    } finally {
      if (pdf?.destroy) {
        await Promise.resolve(pdf.destroy()).catch(() => {});
      }
      if (loadingTask?.destroy) {
        await Promise.resolve(loadingTask.destroy()).catch(() => {});
      }
    }
  }
}
