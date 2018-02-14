class ComponentManager {
    
  constructor() {
    this._lastFreeIndex = 0;
    this._components = [];
    this._componentsMap = {};
  }

  get(uuid) {
    let index = this._componentsMap[uuid];
    return this._components[index];
  }

  add(component) {
    let uuid = component.uuid;
    if (this._components.length === this._lastFreeIndex) {
      this._components.push(component);
      this._componentsMap[uuid] = this._lastFreeIndex;
      this._lastFreeIndex++;
    } else {
      this._components[this._lastFreeIndex] = component;
      this._componentsMap[uuid] = this._lastFreeIndex;
    }
  }

  update(dt) {
    this._components.forEach((component) => {
      component.update && component.update(dt);
    });
  }
}
    
const _instance = new ComponentManager;
    
export default _instance;