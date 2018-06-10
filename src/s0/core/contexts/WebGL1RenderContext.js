import RenderContext from "./RenderContext";
import GLProgram from "../GLProgram";
import ResourcePipeline from '../../../resources/ResourcePipeline';

export default class WebGL1RenderContext extends RenderContext {
  static init(canvas) {
    canvas = canvas || document.querySelector("canvas");
    let context = canvas.getContext('webgl');
    if (context === null) {
      console.warn('WebGL1 is not available');
      return null;
    } else {
      let ext = context.getExtension('OES_vertex_array_object');
      if (ext === null) {
        console.log('WebGL1 is available, but OES_vertex_array_object is not available');
        return null;
      }
      console.log("%c 😀WebGL1 is available.", 'background: #222; color: #bada55');
      return new WebGL1RenderContext(context, {
        extension: ext,
        canvasSize: {
          width: canvas.width,
          height: canvas.height,
        }
      });
    }
  }

  constructor(context, options) {
    super(context);
    this._extension = options.extension;
    this._viewWith = options.canvasSize.width;
    this._viewHeight = options.canvasSize.height;
  }

  setViewport(x, y, w, h) {
    this._context.viewport(x, y, w, h);
  }

  clear(mask) {
    this._context.clear(mask);
  }

  getProgramLoader(options) {
    let vsURL = options.vsURL;
    let fsURL = options.vsURL;
    return () => ResourcePipeline.loadAllAsync([
      `${vsURL}.vs1.glsl`,
      `${fsURL}.fs1.glsl`,
    ]);
  }

  createProgram([vs, fs]) {
    let program = new GLProgram(vs, fs, '');
    program.create(this._context);
    return program;
  }

  useProgram(program) {
    program.use(this._context);
    this._currentProgram = program;
  }

  prepare(primitive) {
    let context = this._context;
    let VAO = this._extension.createVertexArrayOES();
    let VBO = context.createBuffer();
    this._extension.bindVertexArrayOES(VAO);
    context.bindBuffer(context.ARRAY_BUFFER, VBO);
    context.bufferData(context.ARRAY_BUFFER, primitive.vertexData, context.STATIC_DRAW);
    context.vertexAttribPointer(0, 4, context.FLOAT, false, 32, 0);
    context.enableVertexAttribArray(0);
    context.vertexAttribPointer(1, 4, context.FLOAT, false, 32, 16);
    context.enableVertexAttribArray(1);
    this._extension.bindVertexArrayOES(null);
    return {
      VAO: VAO,
      mode: context.TRIANGLES,
      indices: null,
      drawArrays: {
        offset: 0,
        count: 36
      }
    };
  }

  drawPrimitive(primitive, MVP) {
    this._currentProgram.setMat4fv(this._context, "uMVP", MVP);
    let context = this._context;
    context.enable(context.DEPTH_TEST);
    context.depthFunc(context.LEQUAL);
    context.enable(context.CULL_FACE);
    this._extension.bindVertexArrayOES(primitive.VAO);
    if (primitive.indices !== null) {
      context.drawElements(primitive.mode, primitive.indices.count, primitive.indices.componentType, primitive.indices.byteOffset);
    } else {
      context.drawArrays(primitive.mode, primitive.drawArrays.offset, primitive.drawArrays.count);
    }
  }

  createTexture() {
    this._texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this._source
    );
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  setTextureMode(mode) {
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    switch (mode) {
      case TextureFilterMode.Point:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        break;
      case TextureFilterMode.Bilinear:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        break;
      case TextureFilterMode.Triliner:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        break;
      case 3:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
        break;
    }
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  beginRendering() {
    let context = this._context;
    context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
    context.viewport(0, 0, this._viewWith, this._viewHeight);
  }

  endRendering() {

  }
}