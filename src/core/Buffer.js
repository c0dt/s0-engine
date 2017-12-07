export default class Buffer {
  constructor({ byteLength, uri }, data) {
    this._byteLength = byteLength;
    this._uri = uri;
    this._data = data;
  }
}