export default class Primitive {
  constructor({ attributes, indices, material, mode }, accessors, materials) {
    this._mode = mode !== undefined ? mode : 4; // default: gl.TRIANGLES
    this._material = materials[material];
    if (accessors) {
      this._attributes = {};
      for (let key in attributes) {
        if (attributes.hasOwnProperty(key)) {
          this._attributes[key] = accessors[attributes[key]];
        }
      }
      this._indices = accessors[indices];
    }
  }
}