class IBLManager {   
  constructor() {
    this._textures = {};
  }

  set specularEnvSampler(value) {
    this._specularEnvSampler = value;
  }

  get specularEnvSampler() {
    return this._specularEnvSampler;
  }

  set diffuseEnvSampler(value) {
    this._diffuseEnvSampler = value;
  }

  get diffuseEnvSampler() {
    return this._diffuseEnvSampler;
  }

  set brdfLUT(value) {
    this._brdfLUT = value;
  }
  
  get brdfLUT() {
    return this._brdfLUT;
  }

  get isReady() {
    return this._specularEnvSampler && this._diffuseEnvSampler && this._brdfLUT;
  }

  activeAndBindTextures() {
    gl.activeTexture(gl.TEXTURE0 + 14);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._specularEnvSampler);
    gl.activeTexture(gl.TEXTURE0 + 15);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._diffuseEnvSampler);
    gl.activeTexture(gl.TEXTURE0 + 13);
    gl.bindTexture(gl.TEXTURE_2D, this._brdfLUT);
  }
}
      
const _instance = new IBLManager;
      
export default _instance;