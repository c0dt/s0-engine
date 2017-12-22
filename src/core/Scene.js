import { vec3, vec4, quat, mat4 } from 'gl-matrix';

export default class Scene {
  constructor({ buffers, 
    bufferViews, 
    accessors, 
    meshes, 
    rootNode, 
    textures,
    materials,
    skins 
    }) {
    this._buffers = buffers;
    this._bufferViews = bufferViews;
    this._accessors = accessors;
    this._meshes = meshes;
    this._rootNode = rootNode;
    this._textures = textures;
    this._materials = materials;
    this._skins = skins;
  }

  get root() {
    return this._rootNode;
  }

  get skins() {
    return this._skins;
  }
}