class ShaderManager {

  constructor() {
    this._shaders = {};
  }

  get(id){
    return this._shaders[id];
  }

  add(shader){
    let id = shader.id;
    this._shaders[id] = shader;
  }
    
}

const _instance = new ShaderManager;

export default _instance;