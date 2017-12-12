export default class BufferView {
  constructor({ buffer, 
    byteLength, byteOffset, byteStride, 
    target, extensions, extras }) {

    this._byteLength = byteLength;
    this._byteOffset = byteOffset !== undefined ? byteOffset : 0;
    this._byteStride = byteStride !== undefined ? byteStride : 0;
    this._target = target !== undefined ? target : null;
    this._extensions = extensions !== undefined ? extensions : null;
    this._extras = extras !== undefined ? extras : null;
    this._buffer = buffer;
    
  }

  get byteLength() {
    return this._byteLength;
  }

  get byteOffset() {
    return this._byteOffset;
  }

  get byteStride() {
    return this._byteStride;
  }

  get target() {
    return this._target;
  }

  get extensions() {
    return this._extensions;
  }

  get extras() {
    return this._extras;
  }

  get buffer() {
    return this._buffer.data;
  }
}