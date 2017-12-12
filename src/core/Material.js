import { vec3, vec4, quat, mat4 } from 'gl-matrix';

export default class Material {
  constructor({ name, alphaMode, pbrMetallicRoughness }) {
    this._name = name;
    this._alphaMode = alphaMode;
    this._pbrMetallicRoughness = pbrMetallicRoughness;
  }
}