export const PPTXImportErrorCode = Object.freeze({
  INVALID_PPTX: "invalid-pptx",
  UNSUPPORTED_PPTX: "unsupported-pptx",
  EMPTY_PRESENTATION: "empty-presentation",
  PARSING_FAILURE: "parsing-failure",
  STRUCTURE_FAILURE: "structure-failure",
  UNEXPECTED_ERROR: "unexpected-error",
});

const messages = Object.freeze({
  [PPTXImportErrorCode.INVALID_PPTX]:
    "The selected file is not a valid PPTX presentation.",
  [PPTXImportErrorCode.UNSUPPORTED_PPTX]:
    "This PPTX presentation uses features that the importer does not support.",
  [PPTXImportErrorCode.EMPTY_PRESENTATION]:
    "The PPTX presentation does not contain any slides.",
  [PPTXImportErrorCode.PARSING_FAILURE]:
    "The PPTX content could not be parsed.",
  [PPTXImportErrorCode.STRUCTURE_FAILURE]:
    "The PPTX content could not be mapped to a training document.",
  [PPTXImportErrorCode.UNEXPECTED_ERROR]:
    "An unexpected error occurred while importing the PPTX presentation.",
});

export class PPTXImportError extends Error {
  constructor(code, options = {}) {
    super(messages[code] || messages[PPTXImportErrorCode.UNEXPECTED_ERROR]);
    this.name = "PPTXImportError";
    this.code = Object.values(PPTXImportErrorCode).includes(code)
      ? code
      : PPTXImportErrorCode.UNEXPECTED_ERROR;
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

export const normalizePPTXImportError = (error, stage = "import") => {
  if (error instanceof PPTXImportError) return error;
  return new PPTXImportError(
    stage === "mapping" || stage === "structure"
      ? PPTXImportErrorCode.STRUCTURE_FAILURE
      : stage === "parsing"
        ? PPTXImportErrorCode.PARSING_FAILURE
        : PPTXImportErrorCode.UNEXPECTED_ERROR,
    { stage }
  );
};
