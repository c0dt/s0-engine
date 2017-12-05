export default class Accessor {
  constructor({ bufferView, byteOffset, componentType, count, max, min, type }) {
    this._bufferView = bufferView;
    this._byteOffset = byteOffset;
    this._componentType = componentType;
    this._count = count;
    this._max = max;
    this._min = min;
    this._type = type;
  }
}