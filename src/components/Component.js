let __component__id = 0;

export default class Component {
  constructor() {
    this._id = __component__id++;
  }
  get node() {
    return this._node;
  }

  get id() {
    return this._id;
  }
}