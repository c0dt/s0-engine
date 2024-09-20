import RenderingContextObject from "./RenderingContextObject";

export default class Cubemap extends RenderingContextObject {
  private _texture: WebGLTexture | null = null;
  private _right: TexImageSource;
  private _left: TexImageSource;
  private _top: TexImageSource;
  private _bottom: TexImageSource;
  private _front: TexImageSource;
  private _back: TexImageSource;

  constructor(params:{
      right: TexImageSource, left: TexImageSource, top: TexImageSource, bottom: TexImageSource, front: TexImageSource, back: TexImageSource,
      facesize:number,
      mipmaps:boolean,
    }) {
    super();
    const {
      right, left, top, bottom, front, back,
      facesize,
      mipmaps = true,
    } = params;
    this._right = right;
    this._left = left;
    this._top = top;
    this._bottom = bottom;
    this._front = front;
    this._back = back;

    this._texture = this.RenderingContext.createTexture();
    this.RenderingContext.bindTexture(this.RenderingContext.TEXTURE_CUBE_MAP, this._texture);

    this.RenderingContext.texParameteri(this.RenderingContext.TEXTURE_CUBE_MAP, this.RenderingContext.TEXTURE_MAG_FILTER, this.RenderingContext.LINEAR);
    this.RenderingContext.texParameteri(this.RenderingContext.TEXTURE_CUBE_MAP, this.RenderingContext.TEXTURE_MIN_FILTER, this.RenderingContext.LINEAR);
    
    // this.RenderingContext.texParameteri(this.RenderingContext.TEXTURE_CUBE_MAP, this.RenderingContext.TEXTURE_COMPARE_MODE, this.RenderingContext.NONE); webgl 1.0 not support
    // this.RenderingContext.texParameteri(this.RenderingContext.TEXTURE_CUBE_MAP, this.RenderingContext.TEXTURE_COMPARE_FUNC, this.RenderingContext.LEQUAL); webgl 1.0 not support

    this.RenderingContext.texImage2D(this.RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X, 0, this.RenderingContext.RGBA, this.RenderingContext.RGBA, this.RenderingContext.UNSIGNED_BYTE, this._right);
    this.RenderingContext.texImage2D(this.RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, this.RenderingContext.RGBA, this.RenderingContext.RGBA, this.RenderingContext.UNSIGNED_BYTE, this._left);
    this.RenderingContext.texImage2D(this.RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, this.RenderingContext.RGBA, this.RenderingContext.RGBA, this.RenderingContext.UNSIGNED_BYTE, this._top);
    this.RenderingContext.texImage2D(this.RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, this.RenderingContext.RGBA, this.RenderingContext.RGBA, this.RenderingContext.UNSIGNED_BYTE, this._bottom);
    this.RenderingContext.texImage2D(this.RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, this.RenderingContext.RGBA, this.RenderingContext.RGBA, this.RenderingContext.UNSIGNED_BYTE, this._front);
    this.RenderingContext.texImage2D(this.RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, this.RenderingContext.RGBA, this.RenderingContext.RGBA, this.RenderingContext.UNSIGNED_BYTE, this._back);
    
    if(mipmaps)
    {
        this.RenderingContext.generateMipmap(this.RenderingContext.TEXTURE_CUBE_MAP);
    }
    this.RenderingContext.bindTexture(this.RenderingContext.TEXTURE_CUBE_MAP, null);
  }

  get texture() {
    return this._texture;
  }
}