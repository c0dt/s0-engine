import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import { ShaderManager } from './Shader';

export default class Material {
  constructor({ name, alphaMode, pbrMetallicRoughness }, textures) {
    this._name = name;
    this._alphaMode = alphaMode;
    this._pbrMetallicRoughness = pbrMetallicRoughness;
    this._shader = ShaderManager.getShader("PBR", 0);
    if (this._pbrMetallicRoughness.baseColorTexture) {
      this._baseColorTexture = {
        texture: textures[this._pbrMetallicRoughness.baseColorTexture.index],
        index: 0
      };
    }
  }

  get shader() {
    return this._shader;
  }

  get baseColorTextureInfo() {
    return this._baseColorTexture;
  }
}