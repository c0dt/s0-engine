import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import Shader, { ShaderManager } from './Shader';

export default class Material {
  constructor({ name, alphaMode, pbrMetallicRoughness }) {
    this._name = name;
    this._alphaMode = alphaMode;
    this._pbrMetallicRoughness = pbrMetallicRoughness;
    this._shader = ShaderManager.getShader("PBR", 0);
  }

  get shader() {
    return this._shader;
  }
}