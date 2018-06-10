export const TextureFilterMode = {
  "Point": 0,
  "Bilinear": 1,
  "Triliner": 2
};
export default class Texture {
  constructor({ name, source, sampler }) {
    this._name = name;
    this._sampler = sampler;
    this._source = source;
  }
  
  get name() {
    return this._name;
  }
  
  get sampler() {
    return this._sampler;
  }
  
  get source() {
    return this._source;
  }
  
  get index() {
    return this._index;
  }
  
  get texture() {
    return this._texture;
  }
}