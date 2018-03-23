import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import Node from './Node';

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
    this._nodesHierarchy.push(node);
  }
}