import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import { ShaderManager } from './Shader';
import IBLManager from '../managers/IBLManager';

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

    this._flag = 0;

    if (normalTexture) {
      this._flag |= ShaderManager.bitMasks.HAS_NORMALMAP;
      this._normalTexture = {
        texture: textures[normalTexture.index],
        index: normalTexture.index,
        scale: normalTexture.scale === undefined ? 1.0 : normalTexture.scale
      };
    }
    if (occlusionTexture) {
      this._flag |= ShaderManager.bitMasks.HAS_OCCLUSIONMAP;
      this._occlusionTexture = {
        texture: textures[occlusionTexture.index],
        index: occlusionTexture.index
      };
    }
    if (emissiveTexture) {
      this._flag |= ShaderManager.bitMasks.HAS_EMISSIVEMAP;
      this._emissiveTexture = {
        texture: textures[emissiveTexture.index],
        index: emissiveTexture.index
      };
    }
    if (pbrMetallicRoughness) {
      if (pbrMetallicRoughness.baseColorTexture) {
        this._flag |= ShaderManager.bitMasks.HAS_BASECOLORMAP;
        this._baseColorTexture = {
          texture: textures[pbrMetallicRoughness.baseColorTexture.index],
          index: pbrMetallicRoughness.baseColorTexture.index
        };
      }
      if (pbrMetallicRoughness.metallicRoughnessTexture) {
        this._flag |= ShaderManager.bitMasks.HAS_METALROUGHNESSMAP;
        this._metallicRoughnessTexture = {
          texture: textures[pbrMetallicRoughness.metallicRoughnessTexture.index],
          index: pbrMetallicRoughness.metallicRoughnessTexture.index
        };
      }
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

  set skinUniformBlockID(value) {
    this._flag |= ShaderManager.bitMasks.HAS_SKIN;
    this._uniformBlockID = value;
  }

  get skinUniformBlockID() {
    return this._uniformBlockID;
  }

  use(context) {
    if (!this._shader) {
      this._shader = ShaderManager.getShader("PBR", this._flag);
    }
    this.shader.use();
    this.shader.setMat4('uM', context.M);
    this.shader.setMat4('uMV', context.MV);
    this.shader.setMat4('uMVP', context.MVP);
    this.shader.set3fv('uCameraPosition', context.cameraPosition);

    this.shader.set4fv('uBaseColorFactor', this._pbrMetallicRoughness.baseColorFactor);

    if (this.shader.hasBaseColorMap()) {
      this.shader.setInt('uBaseColorTexture', this._baseColorTexture.index);
      context.activeAndBindTexture(this._baseColorTexture);
    }
    if (this.shader.hasNormalMap()) {
      this.shader.setInt('uNormalTexture', this._normalTexture.index);
      this.shader.set1f('uNormalTextureScale', this._normalTexture.scale);
      context.activeAndBindTexture(this._normalTexture);
    }
    if (this.shader.hasMetalRoughnessMap()) {
      this.shader.setInt('uMetallicRoughnessTexture', this._metallicRoughnessTexture.index);
      context.activeAndBindTexture(this._metallicRoughnessTexture);
      this.shader.set1f('uRoughnessFactor', this._pbrMetallicRoughness.roughnessFactor);
      this.shader.set1f('uMetallicFactor', this._pbrMetallicRoughness.metallicFactor);
    }
    if (this.shader.hasOcclusionMap()) {
      this.shader.setInt('uOcclusionTexture', this._occlusionTexture.index);
      this.shader.set1f('uOcclusionStrength', this._occlusionTexture.strength);
      context.activeAndBindTexture(this._occlusionTexture);
    }
    if (this.shader.hasEmissiveMap()) {
      this.shader.setInt('uEmissiveTexture', this._emissiveTexture.index);
      // this.shader.setInt('uEmissiveFactor', this._emissiveTexture.strength);
      context.activeAndBindTexture(this._emissiveTexture);
    }

    if (this.shader.hasSkin()) {
      this.shader.setBlockIndex('JointMatrix', this._uniformBlockID);
    }

    IBLManager.activeAndBindTextures();
  }
}