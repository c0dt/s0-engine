import Primitive from './Primitive';

export default class Mesh {
  constructor({ name, primitives = [] }, accessors, materials) {
    this._name = name;
    this._primitives = [];
    this._materials = materials;

    primitives.forEach((primitive) => {
      this._primitives.push(new Primitive(primitive, accessors, materials));
    });
  }

  get primitives() {
    return this._primitives;
  }
}