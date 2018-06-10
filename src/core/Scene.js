export default class Scene {
  constructor({ buffers, 
    bufferViews, 
    accessors, 
    meshes, 
    nodesHierarchy, 
    textures,
    materials,
    skins,
    animations
  } = {}) {
    this._buffers = buffers || [];
    this._bufferViews = bufferViews || [];
    this._accessors = accessors || [];
    this._meshes = meshes || [];
    this._nodesHierarchy = nodesHierarchy || [];
    this._textures = textures || [];
    this._materials = materials || [];
    this._skins = skins || [];
    this._animations = animations || [];
    this._needRevisit = true;
  }

  get hierarchy() {
    return this._nodesHierarchy;
  }

  get skins() {
    return this._skins;
  }

  get animations() {
    return this._animations;
  }

  add(node) {
    this._needRevisit = true;
    this._nodesHierarchy.push(node);
  }

  get needRevisit() {
    return this._needRevisit;
  }

  set needRevisit(value) {
    this._needRevisit = value;
  }
}