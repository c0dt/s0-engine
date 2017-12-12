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

  _getLocationFromKey(key) {
    return 0;
  }

  prepare() {
    this._vao = gl.createVertexArray();
    gl.bindVertexArray(this._vao);
    for (let key in this._attributes) {
      if (this._attributes.hasOwnProperty(key)) {
        let attribute = this._attributes[key];
        attribute.createBuffer();
        attribute.bindData();
        let location = this._getLocationFromKey(key);
        attribute.prepareVertexAttrib(location);
      }
    }
    gl.bindVertexArray(null);
  }

  draw(context) {
    gl.bindVertexArray(this._vao);
    if (this._indices !== null) {
      gl.drawElements(this._mode, this._indicesLength, this._indicesComponentType, this._indicesOffset);
    } else {
      gl.drawArrays(this._mode, this._drawArraysOffset, this._drawArraysCount);
    }
    gl.bindVertexArray(null);
  }
}