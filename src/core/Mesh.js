import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import Primitive from './Primitive';

export default class Mesh {
  constructor({ name, primitives = [] }) {
    this._name = name;
    this._vao = undefined;
    this._material = null;
    this._attributeBuffers = {};
    this._indicesBuffers = undefined;
    this._primitives = [];

    primitives.forEach((primitive) => {
      this._primitives.push(new Primitive(primitive));
    });
    
  }

    // drawPrimitive(primitive, matrix) {
  //   let MVP = mat4.create();
  //   mat4.mul(MVP, this.camera.view, matrix);
  //   mat4.mul(MVP, this.projection, MVP);
  //   if (primitive.material) {
  //     if (primitive.material.pbrMetallicRoughness.baseColorTexture) {
  //       this.activeAndBindTexture(gl.getUniformLocation(this.colorGrogram, "albedo"), primitive.material.pbrMetallicRoughness.baseColorTexture);
  //     }
  //   }
  //   gl.uniformMatrix4fv(this.uniformMvpLocation, false, MVP);
  //   gl.bindVertexArray(primitive.vertexArray);
  //   if (primitive.indices !== null) {
  //     gl.drawElements(primitive.mode, primitive.indicesLength, primitive.indicesComponentType, primitive.indicesOffset);
  //   } else {
  //     gl.drawArrays(primitive.mode, primitive.drawArraysOffset, primitive.drawArraysCount);
  //   }
  //   gl.bindVertexArray(null);
  // }
}