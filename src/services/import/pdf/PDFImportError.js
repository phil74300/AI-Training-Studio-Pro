export const PDFImportErrorCode = Object.freeze({
  INVALID_PDF: "invalid-pdf",
  ENCRYPTED_PDF: "encrypted-pdf",
  UNSUPPORTED_PDF: "unsupported-pdf",
  PARSING_FAILURE: "parsing-failure",
  STRUCTURE_FAILURE: "structure-failure",
  UNEXPECTED_ERROR: "unexpected-error",
});

const messages = Object.freeze({
  [PDFImportErrorCode.INVALID_PDF]:
    "The selected file is not a valid PDF document.",
  [PDFImportErrorCode.ENCRYPTED_PDF]:
    "Password-protected PDF documents are not supported.",
  [PDFImportErrorCode.UNSUPPORTED_PDF]:
    "This PDF uses features that the importer does not support.",
  [PDFImportErrorCode.PARSING_FAILURE]: "The PDF content could not be parsed.",
  [PDFImportErrorCode.STRUCTURE_FAILURE]:
    "The PDF content could not be mapped to a training document.",
  [PDFImportErrorCode.UNEXPECTED_ERROR]:
    "An unexpected error occurred while importing the PDF.",
});

export class PDFImportError extends Error {
  constructor(code, options = {}) {
    super(messages[code] || messages[PDFImportErrorCode.UNEXPECTED_ERROR]);
    this.name = "PDFImportError";
    this.code = Object.values(PDFImportErrorCode).includes(code)
      ? code
      : PDFImportErrorCode.UNEXPECTED_ERROR;
    this.stage = options.stage || "import";
    this.retryable = false;
    Object.freeze(this);
  }

  toRecord() {
    return {
      code: this.code,
      message: this.message,
      stage: this.stage,
      retryable: this.retryable,
    };
  }
}

export const normalizePDFImportError = (error, stage = "import") => {
  if (error instanceof PDFImportError) {
    return error;
  }

  const parserName = error?.name;

  if (parserName === "PasswordException") {
    return new PDFImportError(PDFImportErrorCode.ENCRYPTED_PDF, { stage });
  }

  if (
    parserName === "InvalidPDFException" ||
    parserName === "MissingPDFException"
  ) {
    return new PDFImportError(PDFImportErrorCode.INVALID_PDF, { stage });
  }

  if (parserName === "UnexpectedResponseException") {
    return new PDFImportError(PDFImportErrorCode.UNSUPPORTED_PDF, { stage });
  }

  return new PDFImportError(
    stage === "mapping" || stage === "structure"
      ? PDFImportErrorCode.STRUCTURE_FAILURE
      : stage === "parsing"
        ? PDFImportErrorCode.PARSING_FAILURE
        : PDFImportErrorCode.UNEXPECTED_ERROR,
    { stage }
  );
};
