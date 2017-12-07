import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import Primitive from './Primitive';

export default class Mesh {
  constructor({ name, primitives = [] }, accessors) {
    this._name = name;
    this._primitives = [];

    primitives.forEach((primitive) => {
      this._primitives.push(new Primitive(primitive, accessors));
    });
  }

  get primitives() {
    return this._primitives;
  }
}