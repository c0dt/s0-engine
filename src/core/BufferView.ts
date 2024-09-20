import Buffer from "./Buffer";
export default class BufferView {
  private _byteLength: number;
  private _byteOffset: number;
  private _byteStride: number;
  private _target: any;
  private _extensions: any;
  private _extras: any;
  private _buffer: Buffer;
  constructor(params:{ buffer: Buffer, 
    byteLength:number, byteOffset:number, byteStride:number, 
    target:any, extensions:any, extras:any }) {
    const { buffer, 
      byteLength, byteOffset, byteStride, 
      target, extensions, extras } = params;
      
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

  get data() {
    return this._buffer.data.slice(this.byteOffset, this.byteLength + this.byteOffset);
  }
}