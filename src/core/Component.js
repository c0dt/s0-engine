let __component__id = 0;

export default class Component {
  constructor(node) {
    this._loaded = false;
    this._node = node;
    this._id = __component__id++;
  }
  get node() {
    return this._node;
  }

  get id() {
    return this._id;
  }

  //
  __onload() {
    if (!this._loaded) {
      this.onLoad && this.onLoad();
    }
  }
}