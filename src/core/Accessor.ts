import BufferView from "./BufferView";
import RenderingContextObject from "./RenderingContextObject";
import { Type2NumOfComponent, ComponentType2ArrayType, ComponentType2ByteSize } from "./Utils";

export default class Accessor extends RenderingContextObject {
  
  private _bufferView: BufferView;
  private _byteOffset: number;
  private _byteStride: number;
  private _componentType: number;
  private _normalized: boolean;
  private _count: number;
  private _max: number;
  private _min: number;
  private _type: string;
  private _size: any;
  private _data: AllowSharedBufferSource | null = null;
  private _buffer: WebGLBuffer | null = null;

  constructor(params: { bufferView:BufferView , 
    byteOffset:number, 
    componentType:number, 
    normalized:boolean,
    count:number, 
    max:number, min:number, 
    type:string }) {
    super();
    const { bufferView, 
      byteOffset, 
      componentType, 
      normalized,
      count, 
      max, min, 
      type } = params;
    this._bufferView = bufferView;
    this._byteOffset = byteOffset || 0;
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

  get data() {
    return this._data;
  }

  createBuffer() {
    this._buffer = this.RenderingContext.createBuffer();
  }

  bindData() {
    let target = this._bufferView.target;
    if (target) {
      this.RenderingContext.bindBuffer(target, this._buffer);
      this.RenderingContext.bufferData(target, this._data, this.RenderingContext.STATIC_DRAW);
      return true;
    }
    return false;
  }

  prepareVertexAttrib(location:number) {
    if (location >= 0) {
      this.RenderingContext.vertexAttribPointer(location,
        this._size,
        this._componentType,
        this._normalized,
        this._byteStride,
        this._byteOffset);
        this.RenderingContext.enableVertexAttribArray(location); 
    }
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

  get size() {
    return this._size;
  }

  get type() {
    return this._type;
  }

  get componentType() {
    return this._componentType;
  }
}