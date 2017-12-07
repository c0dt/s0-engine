import { vec3, vec4, quat, mat4 } from 'gl-matrix';

export default class Primitive {
  constructor({ attributes, indices, material, mode }, accessors) {
    this._mode = mode;
    if (accessors) {
      this._attributes = {};
      for (let key in attributes) {
        if (attributes.hasOwnProperty(key)) {
          this._attributes[key] = accessors[attributes[key]];
        }
      }
      this._indices = accessors[indices];
    }
    this._material = material;
  }

  draw(context) {
    // gl.bindVertexArray(this._vao);
    // if (this._indices !== null) {
    //   gl.drawElements(this._mode, this._indicesLength, this._indicesComponentType, this._indicesOffset);
    // } else {
    //   gl.drawArrays(this._mode, this._drawArraysOffset, this._drawArraysCount);
    // }
    // gl.bindVertexArray(null);
  }
}