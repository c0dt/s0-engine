class TextureManager {
    
  constructor() {
    this._textures = {};
  }
    
  get(id){
    return this._textures[id];
  }
    
  add(texture){
    let id = texture.id;
    this._textures[id] = texture;
  }
        
    }
    
const _instance = new TextureManager;
    
export default _instance;