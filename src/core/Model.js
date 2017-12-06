import { vec3, vec4, quat, mat4 } from 'gl-matrix';

export default class Model {
  constructor({ buffers, bufferViews, accessors, meshes, rootNode, textures }) {
    this._buffers = buffers;
    this._bufferViews = bufferViews;
    this._accessors = accessors;
    this._meshes = meshes;
    this._rootNode = rootNode;
    this._textures = [];
    this._materials = [];
    this._textures = textures;
  }
}