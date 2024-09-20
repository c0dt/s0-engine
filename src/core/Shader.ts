import S0 from '../S0';
//@ts-ignore
import vsLegacyMaster from '../shaders/legacy/color.vs.glsl';
//@ts-ignore
import fsLegacyMaster from '../shaders/legacy/color.fs.glsl';
//@ts-ignore
import vsForwardPBRMaster from '../shaders/forward/pbr.vs.glsl';
//@ts-ignore
import fsForwardPBRMaster from '../shaders/forward/pbr.fs.glsl';
//@ts-ignore
import vsDeferredPBRMaster from '../shaders/deferred/pbr.vs.glsl';
//@ts-ignore
import fsDeferredPBRMaster from '../shaders/deferred/pbr.fs.glsl';
import RenderingContextObject from './RenderingContextObject';

export class ShaderManager  {
  static _shaderCounter:number = 0;
  static bitMasks = {
    // vertex shader
    HAS_SKIN: 1 << 0,
    SKIN_VEC8: 1 << 1,

    // fragment shader
    HAS_BASECOLORMAP: 1 << 2,
    HAS_NORMALMAP: 1 << 3,
    HAS_METALROUGHNESSMAP: 1 << 4,
    HAS_OCCLUSIONMAP: 1 << 5,
    HAS_EMISSIVEMAP: 1 << 6
  };

  static _programObjects: { [key:string]:{ [key:number]: Shader}} = {};

  static createShader(type:string, flags:number) {
    if (type === 'PBR') {
      let shader;
      if (S0.isWebGL) {
        shader = new Shader(vsLegacyMaster, fsLegacyMaster);
      } else {
        if (S0.renderType === 'deferred') {
          shader = new Shader(vsDeferredPBRMaster, fsDeferredPBRMaster);
        } else if (S0.renderType === 'forward') {
          shader = new Shader(vsForwardPBRMaster, fsForwardPBRMaster);
        }
      }
      return shader?.compile(flags);
    }
  };

  static getShader(type:string, flags:number) {
    let shaders = this._programObjects[type];
    if (shaders && shaders[flags]) {
      return shaders[flags];
    } else {
      let shader = this.createShader(type, flags);
      if(!shader)
      {
        return;
      }
      if (!shaders) {
        this._programObjects[type] = {};
      }
      this._programObjects[type][flags] = shader;
      return shader;
    }
  }
};

export default class Shader extends RenderingContextObject {
  private _vsCode: string;
  private _shaderVersionLine: string;
  private _id: number;
  private _fsCode: string;
  private _flags: number = 0;
  private _attributeMap: {[key:string]:any};
  private _uniformMap: {[key:string]:any};
  private _uniformBlockIndices: {[key:string]:any};
  private _program: WebGLProgram | undefined = undefined;

  constructor(vsCode:string, fsCode:string, flags:number = 0) {
    super();
    this._vsCode = vsCode;
    this._fsCode = fsCode;
    this._flags = 0;
    this._shaderVersionLine = S0.isWebGL2 ? '#version 300 es\n' : '';
    this._id = ShaderManager._shaderCounter++;

    this._attributeMap = {};
    this._uniformMap = {};
    this._uniformBlockIndices = {};
  }

  _createShader(gl:WebGL2RenderingContext | WebGLRenderingContext, source: string, type: GLenum) {
    let shader = this.RenderingContext.createShader(type);
    if(shader && source)
    {
      this.RenderingContext.shaderSource(shader, source);
      this.RenderingContext.compileShader(shader);
    }
    return shader;
  }

  _createProgram(gl:WebGL2RenderingContext | WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
    let program: WebGLProgram | null = this.RenderingContext.createProgram();
    if(!program)
    {
        return;
    }
    let vshader = this._createShader(gl, vertexShaderSource, this.RenderingContext.VERTEX_SHADER);
    let fshader = this._createShader(gl, fragmentShaderSource, this.RenderingContext.FRAGMENT_SHADER);
    if(vshader)
    {
      this.RenderingContext.attachShader(program, vshader);
    }
    this.RenderingContext.deleteShader(vshader);
    if(fshader)
    {
      this.RenderingContext.attachShader(program, fshader);
    }
    this.RenderingContext.deleteShader(fshader);
    this.RenderingContext.linkProgram(program);

    let log = this.RenderingContext.getProgramInfoLog(program);
    if (log) {
      console.warn(log);
    }
    if(vshader)
    {
      log = this.RenderingContext.getShaderInfoLog(vshader);
      if (log) {
        console.warn(log);
      }
    }
    if(fshader)
    {
      log = this.RenderingContext.getShaderInfoLog(fshader);
      if (log) {
        console.warn(log);
      }
    }
    return program;
  }

  hasSkin() {
    return this._flags & ShaderManager.bitMasks.HAS_SKIN;
  }

  hasSkinVec8() {
    return this._flags & ShaderManager.bitMasks.SKIN_VEC8;
  }

  hasBaseColorMap() {
    return this._flags & ShaderManager.bitMasks.HAS_BASECOLORMAP;
  }

  hasNormalMap() {
    return this._flags & ShaderManager.bitMasks.HAS_NORMALMAP;
  }
  hasMetalRoughnessMap() {
    return this._flags & ShaderManager.bitMasks.HAS_METALROUGHNESSMAP;
  }
  hasOcclusionMap() {
    return this._flags & ShaderManager.bitMasks.HAS_OCCLUSIONMAP;
  }
  hasEmissiveMap() {
    return this._flags & ShaderManager.bitMasks.HAS_EMISSIVEMAP;
  }
  
  use() {
    if(this._program)
    {
      this.RenderingContext.useProgram(this._program);
    }
  }

  _precompile(flags:number) {
    this._flags = flags;
    let vsDefine = '';
    let fsDefine = '';
    // define macros
    if (this.hasSkin()) {
      vsDefine += '#define HAS_SKIN\n';
    }
    if (this.hasSkinVec8()) {
      vsDefine += '#define SKIN_VEC8\n';
    }
    if (this.hasBaseColorMap()) {
      fsDefine += '#define HAS_BASECOLORMAP\n';
    }
    if (this.hasNormalMap()) {
      fsDefine += '#define HAS_NORMALMAP\n';
    }
    if (this.hasMetalRoughnessMap()) {
      fsDefine += '#define HAS_METALROUGHNESSMAP\n';
    }
    if (this.hasOcclusionMap()) {
      fsDefine += '#define HAS_OCCLUSIONMAP\n';
    }
    if (this.hasEmissiveMap()) {
      fsDefine += '#define HAS_EMISSIVEMAP\n';
    }

    // concat
    let vertexShaderSource = 
        this._shaderVersionLine +
        vsDefine +
        this._vsCode.replace(/aPosition/ig, 'POSITION')
          .replace(/aTexCoord/ig, 'TEXCOORD_0')
          .replace(/aNormal/ig, 'NORMAL')
          .replace(/aJoint0/ig, 'JOINTS_0')
          .replace(/aWeight0/ig, 'WEIGHTS_0');
    
    let fragmentShaderSource = 
        this._shaderVersionLine +
        fsDefine +
        this._fsCode;
    return [vertexShaderSource, fragmentShaderSource];
  }

  _postcompile() {
    if(!this._program)
    {
      return;
    }
    //post    
    let attributesCount = this.RenderingContext.getProgramParameter(this._program, this.RenderingContext.ACTIVE_ATTRIBUTES);

    for (let i = 0; i < attributesCount; i++) {
      const attributeInfo = this.RenderingContext.getActiveAttrib(this._program, i); 
      if(attributeInfo)
      {
        console.log('name:', attributeInfo.name, 'type:', attributeInfo.type, 'size:', attributeInfo.size); 
        this._attributeMap[attributeInfo.name] = this.RenderingContext.getAttribLocation(this._program, attributeInfo.name);
      }
    }

    let uniformsCount = this.RenderingContext.getProgramParameter(this._program, this.RenderingContext.ACTIVE_UNIFORMS);

    for (let i = 0; i < uniformsCount; i++) {
      const uniformInfo = this.RenderingContext.getActiveUniform(this._program, i);
      if(uniformInfo)
      {
        console.log('name:', uniformInfo.name, 'type:', uniformInfo.type, 'size:', uniformInfo.size); 
        this._uniformMap[uniformInfo.name] = this.RenderingContext.getUniformLocation(this._program, uniformInfo.name);
      }
    }

    if (S0.isWebGL2) {
      //@ts-ignore
      let uniformBlocksCount = this.RenderingContext.getProgramParameter(this._program, this.RenderingContext.ACTIVE_UNIFORM_BLOCKS);
      for (let i = 0; i < uniformBlocksCount; i++) {
        //@ts-ignore
        const blockName = this.RenderingContext.getActiveUniformBlockName(this._program, i);
        console.log('uniform block name: ', blockName);
        //@ts-ignore
        this._uniformBlockIndices[blockName] = this.RenderingContext.getUniformBlockIndex(this._program, blockName);
      }
    }

  }

  compile(flags:number) {
    let [vertexShaderSource, fragmentShaderSource] = this._precompile(flags);
    // compile
    this._program = this._createProgram(this.RenderingContext, vertexShaderSource, fragmentShaderSource);
    if(!this._program)
    {
      return;
    }
    this._postcompile();
    // set static uniform values in cubemap
    this.RenderingContext.useProgram(this._program);
    this.RenderingContext.uniform1i(this.uniformLocations.uBrdfLUT, 13);
    this.RenderingContext.uniform1i(this.uniformLocations.uSpecularEnvSampler, 14);
    this.RenderingContext.uniform1i(this.uniformLocations.uDiffuseEnvSampler, 15);
    this.RenderingContext.useProgram(null);

    return this;
  }

  get attributeLocations() {
    return this._attributeMap;
  }

  get uniformLocations() {
    return this._uniformMap;
  }

  //# helpers

  setMat4(type:string, value:any) {
    let location = this._uniformMap[type];
    if (location) {
      this.RenderingContext.uniformMatrix4fv(location, false, value); 
    }
  }

  setInt(type:string, value:any) {
    let location = this._uniformMap[type];
    if (location) {
      this.RenderingContext.uniform1i(location, value);
    }
    
  }

  set1f(type:string, value:any) {
    let location = this._uniformMap[type];
    if (location) {
      this.RenderingContext.uniform1f(location, value);
    }
  }

  set4fv(type:string, value:any) {
    let location = this._uniformMap[type];
    if (location) {
      this.RenderingContext.uniform4fv(location, value);
    }
  }

  set3fv(type:string, value:any) {
    let location = this._uniformMap[type];
    if (location) {
      this.RenderingContext.uniform3fv(location, value);
    }
  }

  setBlockIndex(type:string, value:any) {
    let location = this._uniformBlockIndices[type];
    if (location && this._program) {
      //@ts-ignore
      this.RenderingContext.uniformBlockBinding(this._program, location, value);
    }
  }
}