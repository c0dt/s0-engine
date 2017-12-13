import { vec3, vec4, quat, mat4 } from 'gl-matrix';

export default class Node {
  constructor({ name, translation, rotation, scale }, parentWorldMatrix) {
    this._components = [];
    this._name = name;
    this._translation = vec3.fromValues(translation[0], translation[1], translation[2]);
    this._rotation = quat.fromValues(rotation[0], rotation[1], rotation[2], rotation[3]);
    this._scale = vec3.fromValues(scale[0], scale[1], scale[2]);
    
    this._localMatrix = mat4.fromRotationTranslationScale(mat4.create(), this._rotation, this._translation, this._scale);

    this._parentWorldMatrix = parentWorldMatrix;
    this._worldMatrix = mat4.multiply(mat4.create(), this._parentWorldMatrix, this._localMatrix);
    this._children = [];
  }

  addChild(node) {
    this._children.push(node);
  }

  get worldMatrix() {
    return this._worldMatrix;
  }

  get mesh() {
    return this._mesh;
  }

  set mesh(value) {
    this._mesh = value;
  }

  get children() {
    return this._children;
  }
}