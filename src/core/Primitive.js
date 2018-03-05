import S0 from '../S0';
import { vec3, vec4, quat, mat4 } from 'gl-matrix';
// #define POSITION_LOCATION 0
// #define NORMAL_LOCATION 1
// #define TEXCOORD_0_LOCATION 2
// #define JOINTS_0_LOCATION 3
// #define WEIGHTS_0_LOCATION 4
// #define JOINTS_1_LOCATION 5
// #define WEIGHTS_1_LOCATION 6
// #define TANGENT_LOCATION 7
const AttributePositionMapping = {
  POSITION: 0,
  NORMAL: 1,
  TEXCOORD_0: 2,
  JOINTS_0: 3,
  WEIGHTS_0: 4
};

export default class Primitive {
  constructor({ attributes, indices, material, mode }, accessors, materials) {
    this._mode = mode !== undefined ? mode : 4; // default: gl.TRIANGLES
    this._material = materials[material];
    if (accessors) {
      this._attributes = {};
      for (let key in attributes) {
        if (attributes.hasOwnProperty(key)) {
          this._attributes[key] = accessors[attributes[key]];
        }
      }
      this._indices = accessors[indices];
    }
  }

  _getLocationFromKey(key) {
    return AttributePositionMapping[key];
  }

  prepare() {
    let shader = this._material.shader;
    this._vao = S0.isWebGL2 ? gl.createVertexArray() : ext.createVertexArrayOES();
    S0.isWebGL2 ? gl.bindVertexArray(this._vao) : ext.bindVertexArrayOES(this._vao);
    for (let key in this._attributes) {
      if (this._attributes.hasOwnProperty(key)) {
        let attribute = this._attributes[key];
        attribute.createBuffer();
        attribute.bindData();
        let location = shader.getAttributeLocation(key);
        if (location !== undefined) {
          attribute.prepareVertexAttrib(location);
        }
      }
    }

    if (this._indices !== null) {
      this._indices.createBuffer();
      this._indices.bindData();

      this._indicesLength = this._indices._count;
      this._indicesComponentType = this._indices._componentType;
      this._indicesOffset = this._indices._byteOffset;
    }

    // gl.bindVertexArray(null);
    S0.isWebGL2 ? gl.bindVertexArray(null) : ext.bindVertexArrayOES(null);
  }
  
  //@TODO 
  draw(context) {
    context.useMaterial(this._material);

    if (!this._vao && this._material.shader) {
      this.prepare();
      return;
    }

    if (this._vao && this._material.shader) {
      if (context.context.node.skin) {
        this._material.skinUniformBlockID = context.context.node.skin.uniformBlockID;
      }
      context.bindVertexArray(this._vao);
      if (this._indices !== null) {
        context.drawElements(this._mode, this._indices._count, this._indices._componentType, this._indices._byteOffset);
      } else {
        context.drawArrays(this._mode, this._drawArraysOffset, this._drawArraysCount);
      }
    }

  }
}