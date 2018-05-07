class PostProcessingManager {
    
  constructor() {
    this._materials = {};
    this._postProcessingMaterialsStack = [];
  }
  
  get(id) {
    return this._materials[id];
  }
  
  add(material) {
    let id = material.id;
    this._materials[id] = material;
    this._postProcessingMaterialsStack.push(material);
  }

  get activated() {
    return this._postProcessingMaterialsStack.length > 0; 
  }

  get stack() {
    return this._postProcessingMaterialsStack;
  }
}
      
const _instance = new PostProcessingManager;
      
export default _instance;