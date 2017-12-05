import { vec3, vec4, quat, mat4 } from 'gl-matrix';

export default class Primitive{
  constructor({ attributes, indices, material, mode }) {
    this._mode = mode;
    this._attributes = attributes;
    this._indices = indices;
    this._material = material;
  }
}