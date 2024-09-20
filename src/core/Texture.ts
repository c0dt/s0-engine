import RenderingContextObject from "./RenderingContextObject";
import { TextureFilterMode } from "./Utils";

export default class Texture extends RenderingContextObject {
  private _texture: WebGLTexture | null = null;
  private _source: TexImageSource;
  private _name: string;
  private _sampler: any;
  private _index: any;
  
  constructor(params: { name: string, source:TexImageSource, sampler:any }) {
    super();
    const  { name, source, sampler } = params;
    this._name = name;
    this._sampler = sampler;
    this._source = source;
    this.createTexture();
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

  createTexture() {
    this._texture = this.RenderingContext.createTexture();
    this.RenderingContext.bindTexture(this.RenderingContext.TEXTURE_2D, this._texture);
    this.RenderingContext.texImage2D(
      this.RenderingContext.TEXTURE_2D,
        0,
        this.RenderingContext.RGBA,
        this.RenderingContext.RGBA,
        this.RenderingContext.UNSIGNED_BYTE,
        this._source
    );
    // this.RenderingContext.texParameteri(this.RenderingContext.TEXTURE_2D, this.RenderingContext.TEXTURE_MAG_FILTER, this.RenderingContext.NEAREST);
    // this.RenderingContext.texParameteri(this.RenderingContext.TEXTURE_2D, this.RenderingContext.TEXTURE_MIN_FILTER, this.RenderingContext.NEAREST);
    
    this.RenderingContext.texParameteri(this.RenderingContext.TEXTURE_2D, this.RenderingContext.TEXTURE_MAG_FILTER, this.RenderingContext.LINEAR);
    this.RenderingContext.texParameteri(this.RenderingContext.TEXTURE_2D, this.RenderingContext.TEXTURE_MIN_FILTER, this.RenderingContext.LINEAR_MIPMAP_LINEAR);
    this.RenderingContext.generateMipmap(this.RenderingContext.TEXTURE_2D);

    this.RenderingContext.bindTexture(this.RenderingContext.TEXTURE_2D, null);
  }

  setTextureMode(mode:number) {
    this.RenderingContext.bindTexture(this.RenderingContext.TEXTURE_2D, this._texture);
    switch (mode) {
      case TextureFilterMode.Point:
        this.RenderingContext.texParameteri(this.RenderingContext.TEXTURE_2D, this.RenderingContext.TEXTURE_MAG_FILTER, this.RenderingContext.NEAREST);
        this.RenderingContext.texParameteri(this.RenderingContext.TEXTURE_2D, this.RenderingContext.TEXTURE_MIN_FILTER, this.RenderingContext.NEAREST);
        break;
      case TextureFilterMode.Bilinear:
        this.RenderingContext.texParameteri(this.RenderingContext.TEXTURE_2D, this.RenderingContext.TEXTURE_MAG_FILTER, this.RenderingContext.LINEAR);
        this.RenderingContext.texParameteri(this.RenderingContext.TEXTURE_2D, this.RenderingContext.TEXTURE_MIN_FILTER, this.RenderingContext.LINEAR);
        break;
      case TextureFilterMode.Triliner:
        this.RenderingContext.texParameteri(this.RenderingContext.TEXTURE_2D, this.RenderingContext.TEXTURE_MAG_FILTER, this.RenderingContext.LINEAR);
        this.RenderingContext.texParameteri(this.RenderingContext.TEXTURE_2D, this.RenderingContext.TEXTURE_MIN_FILTER, this.RenderingContext.LINEAR_MIPMAP_LINEAR);
        break;
    }
    this.RenderingContext.generateMipmap(this.RenderingContext.TEXTURE_2D);
    this.RenderingContext.bindTexture(this.RenderingContext.TEXTURE_2D, null);
  }
}