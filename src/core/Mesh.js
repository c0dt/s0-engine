import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import Primitive from './Primitive';

export default class Mesh{
  constructor({ name, primitives = [] }) {
    this._vao = undefined;
    this._material = null;
    this._parentMatrix = mat4.create(); 
    this._localMatrix = mat4.create();
    this._worldMatrix = mat4.create();
    this._attributeBuffers = {};
    this._indicesBuffers = undefined;
    this._primitives = [];

    primitives.forEach(primitive=>{
      this._primitives.push(new Primitive(primitive));
    });
    
  }
}