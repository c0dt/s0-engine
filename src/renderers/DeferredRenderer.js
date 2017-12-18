import Renderer from './Renderer';

export default class DeferredRenderer extends Renderer {
  constructor(width, height) {
    super(width, height);

    this.ext = gl.getExtension('WEBGL_draw_buffers');
    if (!this.ext) {
      console.log('WEBGL_draw_buffers not supported');
    }
  }

  initializeGBuffer() {
    let gBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, gBuffer);

    let gPosition = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, gPosition);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RG16F,
        this._viewWith,
        this._viewHeight,
        0,
        gl.RGB,
        gl.FLOAT,
        null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, this.ext.COLOR_ATTACHMENT0_WEBGL, gl.TEXTURE_2D, gPosition, 0);

    let gNormal = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, gNormal);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RG16F,
        this._viewWith,
        this._viewHeight,
        0,
        gl.RGB,
        gl.FLOAT,
        null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, this.ext.COLOR_ATTACHMENT1_WEBGL, gl.TEXTURE_2D, gNormal, 0);

    let gAlbedoSpec = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, gAlbedoSpec);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        this._viewWith,
        this._viewHeight,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, this.ext.COLOR_ATTACHMENT2_WEBGL, gl.TEXTURE_2D, gAlbedoSpec, 0);


    this.ext.drawBuffersWEBGL([
      this.ext.COLOR_ATTACHMENT0_WEBGL,
      this.ext.COLOR_ATTACHMENT1_WEBGL,
      this.ext.COLOR_ATTACHMENT2_WEBGL
    ]);

    let rboDepth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rboDepth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT32F, this._viewWith, this._viewHeight);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rboDepth);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {

    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, 0);

  }
}