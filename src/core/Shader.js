import S0 from '../S0';
import vsLegacyMaster from '../shaders/legacy/color.vs.glsl';
import fsLegacyMaster from '../shaders/legacy/color.fs.glsl';

import vsForwardPBRMaster from '../shaders/forward/pbr.vs.glsl';
import fsForwardPBRMaster from '../shaders/forward/pbr.fs.glsl';

import vsDeferredPBRMaster from '../shaders/deferred/pbr.vs.glsl';
import fsDeferredPBRMaster from '../shaders/deferred/pbr.fs.glsl';

export const ShaderManager = {
  _shaderCounter: 0,
  bitMasks: {
    // vertex shader
    HAS_SKIN: 1 << 0,
    SKIN_VEC8: 1 << 1,

    // fragment shader
    HAS_BASECOLORMAP: 1 << 2,
    HAS_NORMALMAP: 1 << 3,
    HAS_METALROUGHNESSMAP: 1 << 4,
    HAS_OCCLUSIONMAP: 1 << 5,
    HAS_EMISSIVEMAP: 1 << 6
  },

  _programObjects: {

  },

  createShader(type, flags) {
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
      return shader.compile(flags);
    }
  },

  getShader(type, version) {
    let shaders = this._programObjects[type];
    if (shaders && shaders[version]) {
      return shaders[version];
    } else {
      let shader = this.createShader(type, version);
      if (!shaders) {
        this._programObjects[type] = {};
      }
      this._programObjects[type][version] = shader;
      return shader;
    }
  }
};

export default class Shader {
  constructor(vsCode, fsCode, flags) {
    this._vsCode = vsCode;
    this._fsCode = fsCode;
    this._shaderVersionLine = S0.isWebGL2 ? '#version 300 es\n' : '';
    this._id = ShaderManager._shaderCounter++;

    this._attributeMap = {};
    this._uniformMap = {};
    this._uniformBlockIndices = {};
  }

  _createShader(gl, source, type) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  _createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    let program = gl.createProgram();
    let vshader = this._createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    let fshader = this._createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    gl.attachShader(program, vshader);
    gl.deleteShader(vshader);
    gl.attachShader(program, fshader);
    gl.deleteShader(fshader);
    gl.linkProgram(program);

    let log = gl.getProgramInfoLog(program);
    if (log) {
      console.warn(log);
    }
    log = gl.getShaderInfoLog(vshader);
    if (log) {
      console.warn(log);
    }
    
    log = gl.getShaderInfoLog(fshader);
    if (log) {
      console.warn(log);
    }
    return program;
  }

  hasSkin() {
    return this.flags & ShaderManager.bitMasks.HAS_SKIN;
  }

  hasSkinVec8() {
    return this.flags & ShaderManager.bitMasks.SKIN_VEC8;
  }

  hasBaseColorMap() {
    return this.flags & ShaderManager.bitMasks.HAS_BASECOLORMAP;
  }

  hasNormalMap() {
    return this.flags & ShaderManager.bitMasks.HAS_NORMALMAP;
  }
  hasMetalRoughnessMap() {
    return this.flags & ShaderManager.bitMasks.HAS_METALROUGHNESSMAP;
  }
  hasOcclusionMap() {
    return this.flags & ShaderManager.bitMasks.HAS_OCCLUSIONMAP;
  }
  hasEmissiveMap() {
    return this.flags & ShaderManager.bitMasks.HAS_EMISSIVEMAP;
  }
  
  use() {
    gl.useProgram(this._program);
  }

  _precompile(flags) {
    this.flags = flags;
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
    //post    
    let attributesCount = gl.getProgramParameter(this._program, gl.ACTIVE_ATTRIBUTES);

    for (let i = 0; i < attributesCount; i++) {
      const attributeInfo = gl.getActiveAttrib(this._program, i); 
      console.log('name:', attributeInfo.name, 'type:', attributeInfo.type, 'size:', attributeInfo.size); 
      this._attributeMap[attributeInfo.name] = gl.getAttribLocation(this._program, attributeInfo.name);
    }

    let uniformsCount = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);

    for (let i = 0; i < uniformsCount; i++) {
      const uniformInfo = gl.getActiveUniform(this._program, i);
      console.log('name:', uniformInfo.name, 'type:', uniformInfo.type, 'size:', uniformInfo.size); 
      this._uniformMap[uniformInfo.name] = gl.getUniformLocation(this._program, uniformInfo.name);
    }

    if (S0.isWebGL2) {
      let uniformBlocksCount = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORM_BLOCKS);
      for (let i = 0; i < uniformBlocksCount; i++) {
        const blockName = gl.getActiveUniformBlockName(this._program, i);
        console.log('uniform block name: ', blockName);
        this._uniformBlockIndices[blockName] = gl.getUniformBlockIndex(this._program, blockName);
      }
    }

  }

  compile(flags) {
    let [vertexShaderSource, fragmentShaderSource] = this._precompile(flags);
    // compile
    this._program = this._createProgram(gl, vertexShaderSource, fragmentShaderSource);
    
    this._postcompile();
    // set static uniform values in cubemap
    gl.useProgram(this._program);
    gl.uniform1i(this.uniformLocations.uBrdfLUT, 13);
    gl.uniform1i(this.uniformLocations.uSpecularEnvSampler, 14);
    gl.uniform1i(this.uniformLocations.uDiffuseEnvSampler, 15);
    gl.useProgram(null);

    return this;
  }

  get attributeLocations() {
    return this._attributeMap;
  }

  get uniformLocations() {
    return this._uniformMap;
  }

  //# helpers

  setMat4(type, mat4) {
    let location = this._uniformMap[type];
    if (location) {
      gl.uniformMatrix4fv(location, false, mat4); 
    }
  }

  setInt(type, value) {
    let location = this._uniformMap[type];
    if (location) {
      gl.uniform1i(location, value);
    }
    
  }

  set1f(type, value) {
    let location = this._uniformMap[type];
    if (location) {
      gl.uniform1f(location, value);
    }
  }


  set2fv(type, value) {
    let location = this._uniformMap[type];
    if (location) {
      gl.uniform2fv(location, value);
    }
  }

  set4fv(type, value) {
    let location = this._uniformMap[type];
    if (location) {
      gl.uniform4fv(location, value);
    }
  }

  set3fv(type, value) {
    let location = this._uniformMap[type];
    if (location) {
      gl.uniform3fv(location, value);
    }
  }

  setBlockIndex(type, value) {
    let location = this._uniformBlockIndices[type];
    if (location) {
      gl.uniformBlockBinding(this._program, location, value);
    }
  }
}