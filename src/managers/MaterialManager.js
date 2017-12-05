class MaterialManager {
    
  constructor() {
    this._materials = {};
  }

  get(id){
    return this._materials[id];
  }

  add(material){
    let id = material.id;
    this._materials[id] = material;
  }
}
    
const _instance = new MaterialManager;
    
export default _instance;