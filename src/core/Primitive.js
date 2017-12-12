import { vec3, vec4, quat, mat4 } from 'gl-matrix';

const AttributePositionMapping = {
  POSITION: 0,
  NORMAL: 1,
  TEXCOORD_0: 2
};

export default class Primitive {
  constructor({ attributes, indices, material, mode }, accessors, materials) {
    this._mode = mode;
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
    this._vao = gl.createVertexArray();
    gl.bindVertexArray(this._vao);
    for (let key in this._attributes) {
      if (this._attributes.hasOwnProperty(key)) {
        let attribute = this._attributes[key];
        attribute.createBuffer();
        attribute.bindData();
        let location = this._getLocationFromKey(key);
        attribute.prepareVertexAttrib(location);
      }
    }

    if (this._indices !== null) {
      this._indices.createBuffer();
      this._indices.bindData();

      this._indicesLength = this._indices._count;
      this._indicesComponentType = this._indices._componentType;
      this._indicesOffset = this._indices._byteOffset;
    }

    gl.bindVertexArray(null);
  }

  draw(context) {
    if (!this._vao) {
      this.prepare();
      return;
    }
    context.useMaterial(this._material);
    gl.bindVertexArray(this._vao);
    if (this._indices !== null) {
      gl.drawElements(this._mode, this._indicesLength, this._indicesComponentType, this._indicesOffset);
    } else {
      gl.drawArrays(this._mode, this._drawArraysOffset, this._drawArraysCount);
    }
    gl.bindVertexArray(null);
  }
}