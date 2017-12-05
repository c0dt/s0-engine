export default class BufferView {
  constructor({ buffer, byteLength, byteOffset, byteStride, target, extensions, extras }) {
    this._byteLength = byteLength;
    this._byteOffset = byteOffset !== undefined ? byteOffset : 0;
    this._byteStride = byteStride !== undefined ? byteStride : 0;
    this._target = target !== undefined ? target : null;
    // this._data = bufferData.slice(this.byteOffset, this.byteOffset + this.byteLength);
    this._extensions = extensions !== undefined ? extensions : null;
    this._extras = extras !== undefined ? extras : null;
    this._buffer = null;
  }

  createBuffer(gl) {
    this._buffer = gl.createBuffer();
  }

  bindData(gl) {
    if (this._target) {
      gl.bindBuffer(this._target, this._buffer);
      gl.bufferData(this._target, this._data, gl.STATIC_DRAW);
      gl.bindBuffer(this._target, null);
      return true;
    }
    return false;
  }
}