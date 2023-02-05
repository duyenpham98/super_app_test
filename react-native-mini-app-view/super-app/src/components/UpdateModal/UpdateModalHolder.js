export default class UpdateModalHolder {
  static _modal = null;

  static getModal() {
    return UpdateModalHolder._modal;
  }

  static setModal(modal) {
    UpdateModalHolder._modal = modal;
  }
}
