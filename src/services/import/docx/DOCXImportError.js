export const DOCXImportErrorCode = Object.freeze({
  INVALID_DOCX: "invalid-docx",
  UNSUPPORTED_DOCX: "unsupported-docx",
  EMPTY_DOCUMENT: "empty-document",
  PARSING_FAILURE: "parsing-failure",
  STRUCTURE_FAILURE: "structure-failure",
  UNEXPECTED_ERROR: "unexpected-error",
});

const messages = Object.freeze({
  [DOCXImportErrorCode.INVALID_DOCX]:
    "The selected file is not a valid DOCX document.",
  [DOCXImportErrorCode.UNSUPPORTED_DOCX]:
    "This DOCX document uses features that the importer does not support.",
  [DOCXImportErrorCode.EMPTY_DOCUMENT]:
    "The DOCX document does not contain importable content.",
  [DOCXImportErrorCode.PARSING_FAILURE]:
    "The DOCX content could not be parsed.",
  [DOCXImportErrorCode.STRUCTURE_FAILURE]:
    "The DOCX content could not be mapped to a training document.",
  [DOCXImportErrorCode.UNEXPECTED_ERROR]:
    "An unexpected error occurred while importing the DOCX document.",
});

export class DOCXImportError extends Error {
  constructor(code, options = {}) {
    super(messages[code] || messages[DOCXImportErrorCode.UNEXPECTED_ERROR]);
    this.name = "DOCXImportError";
    this.code = Object.values(DOCXImportErrorCode).includes(code)
      ? code
      : DOCXImportErrorCode.UNEXPECTED_ERROR;
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

export const normalizeDOCXImportError = (error, stage = "import") => {
  if (error instanceof DOCXImportError) return error;
  return new DOCXImportError(
    stage === "mapping" || stage === "structure"
      ? DOCXImportErrorCode.STRUCTURE_FAILURE
      : stage === "parsing"
        ? DOCXImportErrorCode.PARSING_FAILURE
        : DOCXImportErrorCode.UNEXPECTED_ERROR,
    { stage }
  );
};
