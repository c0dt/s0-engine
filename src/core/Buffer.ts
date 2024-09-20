export default class Buffer {
  private _byteLength: any;
  private _uri: any;
  private _data: ArrayBuffer;

  constructor(param:{ byteLength:number, uri:string }, data:ArrayBuffer) {
    const {byteLength, uri } = param;
    this._byteLength = byteLength;
    this._uri = uri;
    this._data = data
  }

  get byteLength():number{
    return this._byteLength;
  }

  get uri():string {
    return this._uri;
  }

  get data():ArrayBuffer {
    return this._data;
  }
}