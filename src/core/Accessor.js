
// TODO: get from gl context
export const ComponentType2ByteSize = {
  5120: 1, // BYTE
  5121: 1, // UNSIGNED_BYTE
  5122: 2, // SHORT
  5123: 2, // UNSIGNED_SHORT
  5126: 4  // FLOAT
};

export const ComponentType2ArrayType = {
  5120: Int8Array, // BYTE
  5121: Uint8Array, // UNSIGNED_BYTE
  5122: Int16Array, // SHORT
  5123: Uint16Array, // UNSIGNED_SHORT
  5126: Float32Array  // FLOAT
};

export const Type2NumOfComponent = {
  'SCALAR': 1,
  'VEC2': 2,
  'VEC3': 3,
  'VEC4': 4,
  'MAT2': 4,
  'MAT3': 9,
  'MAT4': 16
};

export default class Accessor {
  constructor({ bufferView, 
                byteOffset, 
                componentType, 
                normalized,
                count, 
                max, min, 
                type }) {
    this._bufferView = bufferView;
    this._byteOffset = byteOffset;
    this._byteStride = bufferView.byteStride;
    this._componentType = componentType;
    this._normalized = normalized;
    this._count = count;
    this._max = max;
    this._min = min;
    this._type = type;
    this._size = Type2NumOfComponent[type];
    let typedArray = ComponentType2ArrayType[componentType];
    let offset = this._byteOffset + bufferView.byteOffset;
    let length = count * this._size;
    if (bufferView.byteLength !== length * ComponentType2ByteSize[componentType]) {
      console.error("bufferView.byteLength !== length");
    }
    this._data = new typedArray(this._bufferView.buffer, offset, length);
  }

  createBuffer() {
    this._buffer = gl.createBuffer();
  }

  bindData() {
    let target = this._bufferView.target;
    if (target) {
      gl.bindBuffer(target, this._buffer);
      gl.bufferData(target, this._data, gl.STATIC_DRAW);
      gl.bindBuffer(target, null);
      return true;
    }
    return false;
  }

  prepareVertexAttrib(location) {
    gl.vertexAttribPointer(location,
        this._size,
        this._componentType,
        this._normalized,
        this._byteStride,
        this._byteOffset);
    gl.enableVertexAttribArray(location);
  }
}