import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import { ShaderManager } from './Shader';

export default class Material {
  constructor({ name, 
    alphaMode, 
    normalTexture, // {scale,index,texCoord}
    occlusionTexture, // {strength,index,texCoord}
    emissiveTexture, //{index,texCoord}
    emissiveFactor, // [r,g,b]
    pbrMetallicRoughness // {baseColorTexture, baseColorFactor, metallicRoughnessTexture, metallicFactor, roughnessFactor}
    }, textures) {
    this._name = name;
    this._alphaMode = alphaMode;
    this._pbrMetallicRoughness = pbrMetallicRoughness;

    let flag = 0;

    if (normalTexture) {
      flag |= ShaderManager.bitMasks.HAS_NORMALMAP;
      this._normalTexture = {
        texture: textures[normalTexture.index],
        index: normalTexture.index
      };
    }
    if (occlusionTexture) {
      flag |= ShaderManager.bitMasks.HAS_OCCLUSIONMAP;
      this._occlusionTexture = {
        texture: textures[occlusionTexture.index],
        index: occlusionTexture.index
      };
    }
    if (emissiveTexture) {
      flag |= ShaderManager.bitMasks.HAS_EMISSIVEMAP;
      this._emissiveTexture = {
        texture: textures[emissiveTexture.index],
        index: emissiveTexture.index
      };
    }
    if (pbrMetallicRoughness) {
      if (pbrMetallicRoughness.baseColorTexture) {
        flag |= ShaderManager.bitMasks.HAS_BASECOLORMAP;
        this._baseColorTexture = {
          texture: textures[pbrMetallicRoughness.baseColorTexture.index],
          index: pbrMetallicRoughness.baseColorTexture.index
        };
      }
      if (pbrMetallicRoughness.metallicRoughnessTexture) {
        flag |= ShaderManager.bitMasks.HAS_METALROUGHNESSMAP;
        this._metallicRoughnessTexture = {
          texture: textures[pbrMetallicRoughness.metallicRoughnessTexture.index],
          index: pbrMetallicRoughness.metallicRoughnessTexture.index
        };
      }
    }
    this._shader = ShaderManager.getShader("PBR", flag);
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

  use(context) {
    this.shader.use();
    this.shader.setMat4('uMVP', context.MVP);

    if (this.shader.hasBaseColorMap()) {
      this.shader.setInt('uBaseColorTexture', this._baseColorTexture.index);
      context.activeAndBindTexture(this._baseColorTexture);
    }
    if (this.shader.hasNormalMap()) {
      this.shader.setInt('uNormalTexture', this._normalTexture.index);
      // this.shader.setInt('uNormalTextureScale', this._normalTexture.scale);
      context.activeAndBindTexture(this._normalTexture);
    }
    if (this.shader.hasMetalRoughnessMap()) {
      this.shader.setInt('uMetallicRoughnessTexture', this._metallicRoughnessTexture.index);
      context.activeAndBindTexture(this._metallicRoughnessTexture);
    }
    if (this.shader.hasOcclusionMap()) {
      this.shader.setInt('uOcclusionTexture', this._occlusionTexture.index);
      // this.shader.setInt('uOcclusionStrength', this._occlusionTexture.strength);
      context.activeAndBindTexture(this._occlusionTexture);
    }
    if (this.shader.hasEmissiveMap()) {
      this.shader.setInt('uEmissiveTexture', this._emissiveTexture.index);
      // this.shader.setInt('uEmissiveFactor', this._emissiveTexture.strength);
      context.activeAndBindTexture(this._emissiveTexture);
    }
  }
}