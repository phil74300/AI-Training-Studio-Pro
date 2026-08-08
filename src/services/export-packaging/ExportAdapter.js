export class ExportAdapter {
  get id() {
    throw new Error("ExportAdapter.id must be implemented.");
  }
  get format() {
    throw new Error("ExportAdapter.format must be implemented.");
  }
  validate() {
    throw new Error("ExportAdapter.validate must be implemented.");
  }
  export() {
    throw new Error("ExportAdapter.export must be implemented.");
  }
}
