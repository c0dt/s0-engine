import { Type2NumOfComponent, ComponentType2ArrayType, ComponentType2ByteSize } from "./Utils";

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

  get bufferView() {
    return this._bufferView;
  }

  get byteOffset() {
    return this._byteOffset;
  }

  get count() {
    return this._count;
  }

  get type() {
    return this._type;
  }

  get componentType() {
    return this._componentType;
  }
}