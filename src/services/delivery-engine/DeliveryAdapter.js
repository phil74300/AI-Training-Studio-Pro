export class DeliveryAdapter {
  get id() {
    throw new Error("DeliveryAdapter.id must be implemented.");
  }

  get supportedFormat() {
    throw new Error("DeliveryAdapter.supportedFormat must be implemented.");
  }

  get capabilities() {
    throw new Error("DeliveryAdapter.capabilities must be implemented.");
  }

  validate() {
    throw new Error("DeliveryAdapter.validate must be implemented.");
  }

  prepare() {
    throw new Error("DeliveryAdapter.prepare must be implemented.");
  }

  getStatus() {
    throw new Error("DeliveryAdapter.getStatus must be implemented.");
  }
}
