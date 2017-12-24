class LUTManager {   
  constructor() {
    this._textures = {};
  }
  
  set lutTexture(value) {
    this._lutTexture = value;
  }
  
  get lutTexture() {
    return this._lutTexture;
  }
  
  get isReady() {
    return this._lutTexture;
  }
  
  activeAndBindTextures() {
    gl.activeTexture(gl.TEXTURE0 + 14);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._lutTexture);
  }
}
        
const _instance = new LUTManager;
        
export default _instance;