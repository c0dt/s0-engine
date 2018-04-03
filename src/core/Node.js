import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import ObjectFactory from './ObjectFactory';
import ComponentManager from '../managers/ComponentManager';


export default class Node {
  /**
   * 
   * @param {Object} { name, translation, rotation, scale, skin, mesh, children, extras } 
   * @param {String} id 
   */
  constructor({ name, translation, rotation, scale, skin, mesh, children, extras } = {}, id) {
    this._id = id;
    this._components = [];
    this._name = name;
    translation = translation || [0, 0, 0];
    this._translation = vec3.fromValues(translation[0], translation[1], translation[2]);
    rotation = rotation || [0, 0, 0, 0];
    this._rotation = quat.fromValues(rotation[0], rotation[1], rotation[2], rotation[3]);
    scale = scale || [1.0, 1.0, 1.0];
    this._scale = vec3.fromValues(scale[0], scale[1], scale[2]);
    this._localMatrix = mat4.fromRotationTranslationScale(mat4.create(), this._rotation, this._translation, this._scale);
    this._worldMatrix = mat4.copy(mat4.create(), this._localMatrix);
    this._children = [];
    this._skin = skin;
    this._mesh = mesh;
    this._extras = extras;
    if (this._extras && this._extras.components) {
      this._extras.components.forEach((componentInfo) => {
        let componentClass = ObjectFactory.get(componentInfo.id);
        let component = new componentClass(this);
        this._components.push(Object.assign(component, componentInfo.attributes));
      });
    }
  }

  get id() {
    return this._id;
  }

  postprocess(context) {
    this._mesh = context.meshes[this._mesh];
    this._skin = context.skins[this._skin];
    this._components.forEach((component) => {
      ComponentManager.add(component);
      component.__onload();
    });
  }

  set parent(value) {
    this._parent = value;
    if (value) {
      value.addChild(this);
      mat4.multiply(this._worldMatrix, value.worldMatrix, this._localMatrix);
    } else {
      value.removeChild(this);
      mat4.copy(this._worldMatrix, this._localMatrix);
    }
  }

  get parent() {
    return this._parent;
  }

  get translation() {
    return this._translation;
  }

  set translation(value) {
    this._localMatrixDirty = true;
    vec3.copy(this._translation, value);
  }

  get rotation() {
    return this._rotation;
  }

  set rotation(value) {
    this._localMatrixDirty = true;
    quat.copy(this._rotation, value);
  }

  get scale() {
    return this._scale;
  }

  set scale(value) {
    this._localMatrixDirty = true;
    vec3.copy(this._scale, value);
  }

  hasSkin() {
    return this._skin !== undefined;
  }

  get skin() {
    return this._skin;
  }

  set skin(value) {
    this._skin = value;
  }

  addChild(node) {
    let index = this._children.indexOf(node);
    if (index === -1) {
      node._parent = this;
      this._children.push(node);
    }
  }

  removeChild(node) {
    let index = this._children.indexOf(node);
    if (index > -1) {
      node._parent = null;
      this._children.splice(index, 1);
    }
  }

  get worldMatrix() {
    return this._worldMatrix;
  }

  get localMatrix() {
    if (this._localMatrixDirty) {
      this._localMatrixDirty = false;
      mat4.fromRotationTranslationScale(this._localMatrix, this._rotation, this._translation, this._scale);
    }
    return this._localMatrix;
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