class ComponentManager {
    
  constructor() {
    this._components = {};
  }

  get(uuid) {
    return this._components[uuid];
  }

  add(component) {
    let uuid = component.uuid;
    this._components[uuid] = component;
  }
}
    
const _instance = new ComponentManager;
    
export default _instance;