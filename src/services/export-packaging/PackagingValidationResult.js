const freeze = (value) => Object.freeze(value);
export class PackagingValidationResult {
  constructor({ valid, errors = [], warnings = [] }) {
    this.schemaVersion = 1;
    this.valid = Boolean(valid);
    this.errors = freeze([...errors]);
    this.warnings = freeze([...warnings]);
    freeze(this);
  }
  static valid(warnings = []) {
    return new PackagingValidationResult({ valid: true, warnings });
  }
  static invalid(errors, warnings = []) {
    return new PackagingValidationResult({ valid: false, errors, warnings });
  }
}
