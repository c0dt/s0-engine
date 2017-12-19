import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import { ShaderManager } from './Shader';

export default class Material {
  constructor({ name, alphaMode, normalTexture, pbrMetallicRoughness }, textures) {
    this._name = name;
    this._alphaMode = alphaMode;
    this._pbrMetallicRoughness = pbrMetallicRoughness;
    this._shader = ShaderManager.getShader("PBR", 0);
    this._normalTexture = normalTexture;

    if (this._normalTexture) {
      this._normalTexture = {
        texture: textures[this._normalTexture.index],
        index: this._normalTexture.index
      };
    }

    if (this._pbrMetallicRoughness.baseColorTexture) {
      this._baseColorTexture = {
        texture: textures[this._pbrMetallicRoughness.baseColorTexture.index],
        index: this._pbrMetallicRoughness.baseColorTexture.index
      };
    }

    if (this._pbrMetallicRoughness.metallicRoughnessTexture) {
      this._metallicRoughnessTexture = {
        texture: textures[this._pbrMetallicRoughness.metallicRoughnessTexture.index],
        index: this._pbrMetallicRoughness.metallicRoughnessTexture.index
      };
    }
  }

  get shader() {
    return this._shader;
  }

  get baseColorTextureInfo() {
    return this._baseColorTexture;
  }

  get normalTextureInfo() {
    return this._normalTexture;
  }

  get metallicRoughnessTextureInfo() {
    return this._metallicRoughnessTexture;
  }
}