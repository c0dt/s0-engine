import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import Shader, { ShaderManager } from './Shader';

export default class Material {
  constructor({ name, alphaMode, pbrMetallicRoughness }, textures) {
    this._name = name;
    this._alphaMode = alphaMode;
    this._pbrMetallicRoughness = pbrMetallicRoughness;
    this._shader = ShaderManager.getShader("PBR", 0);
    this._baseColorTexture = textures[this._pbrMetallicRoughness.baseColorTexture.index];
  }

  get shader() {
    return this._shader;
  }

  get baseColorTexture() {
    return this._baseColorTexture;
  }
}