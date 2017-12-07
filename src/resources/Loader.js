export default class Loader {
  constructor(item) {
    this._item = item;
  }

  set item(value) {
    this._item = value;
  }

  get item() {
    return this._item;
  }

  get url() {
    return this._item.url;
  }
}