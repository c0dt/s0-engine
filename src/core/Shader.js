// import vsPBRMaster from '../shaders/forward/unlit.vs.glsl';
// import fsPBRMaster from '../shaders/forward/unlit.fs.glsl';

import vsPBRMaster from '../shaders/forward/pbr.vs.glsl';
import fsPBRMaster from '../shaders/forward/pbr.fs.glsl';

// import vsPBRMaster from '../shaders/deferred/pbr.vs.glsl';
// import fsPBRMaster from '../shaders/deferred/pbr.fs.glsl';

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
      let shader = new Shader(vsPBRMaster, fsPBRMaster);
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
    this._shaderVersionLine = '#version 300 es\n';
    this._id = ShaderManager._shaderCounter++;
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
      console.log(log);
    }
    log = gl.getShaderInfoLog(vshader);
    if (log) {
      console.log(log);
    }
    log = gl.getShaderInfoLog(fshader);
    if (log) {
      console.log(log);
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

  compile(flags) {
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
        this._vsCode;
    
    let fragmentShaderSource = 
        this._shaderVersionLine +
        fsDefine +
        this._fsCode;

    // compile
    this._program = this._createProgram(gl, vertexShaderSource, fragmentShaderSource);
    this._uniformLocations = {};
    this._uniformBlockIndices = {};

    // uniform block id
    if (this.hasSkin()) {
      this._program.uniformBlockIndices.JointMatrix = gl.getUniformBlockIndex(this._program, "uJointMatrix");
    }

    this._uniformLocations.MVP = gl.getUniformLocation(this._program, 'uMVP');
    this._uniformLocations.MVNormal = gl.getUniformLocation(this._program, 'uMVNormal');
    this._uniformLocations.MV = gl.getUniformLocation(this._program, 'uMV');

    this._uniformLocations.baseColorFactor = gl.getUniformLocation(this._program, 'uBaseColorFactor');
    this._uniformLocations.metallicFactor = gl.getUniformLocation(this._program, 'uMetallicFactor');
    this._uniformLocations.roughnessFactor = gl.getUniformLocation(this._program, 'uRoughnessFactor');

    if (this.hasBaseColorMap()) {
      this._uniformLocations.baseColorTexture = gl.getUniformLocation(this._program, 'uBaseColorTexture');
    }
    if (this.hasNormalMap()) {
      this._uniformLocations.normalTexture = gl.getUniformLocation(this._program, 'uNormalTexture');
      this._uniformLocations.normalTextureScale = gl.getUniformLocation(this._program, 'uNormalTextureScale');
    }
    if (this.hasMetalRoughnessMap()) {
      this._uniformLocations.metallicRoughnessTexture = gl.getUniformLocation(this._program, 'uMetallicRoughnessTexture');
    }
    if (this.hasOcclusionMap()) {
      this._uniformLocations.occlusionTexture = gl.getUniformLocation(this._program, 'uOcclusionTexture');
      this._uniformLocations.occlusionStrength = gl.getUniformLocation(this._program, 'uOcclusionStrength');
    }
    if (this.hasEmissiveMap()) {
      this._uniformLocations.emissiveTexture = gl.getUniformLocation(this._program, 'uEmissiveTexture');
      this._uniformLocations.emissiveFactor = gl.getUniformLocation(this._program, 'uEmissiveFactor');
    }

    this._uniformLocations.uDiffuseEnvSampler = gl.getUniformLocation(this._program, 'uDiffuseEnvSampler');
    this._uniformLocations.uSpecularEnvSampler = gl.getUniformLocation(this._program, 'uSpecularEnvSampler');
    this._uniformLocations.uBrdfLUT = gl.getUniformLocation(this._program, 'uBrdfLUT');

    // set static uniform values in cubemap
    gl.useProgram(this._program);
    gl.uniform1i(this._uniformLocations.uBrdfLUT, 13);
    gl.uniform1i(this._uniformLocations.uSpecularEnvSampler, 14);
    gl.uniform1i(this._uniformLocations.uDiffuseEnvSampler, 15);
    gl.useProgram(null);

    return this;
  }

  get uniformLocations() {
    return this._uniformLocations;
  }

  setMat4(type, mat4) {
    let location = this._uniformLocations[type];
    if (!location) {
      this._uniformLocations[type] = gl.getUniformLocation(this._program, type);
    }
    gl.uniformMatrix4fv(location, false, mat4);
  }

  setInt(type, value) {
    let location = this._uniformLocations[type];
    if (!location) {
      this._uniformLocations[type] = gl.getUniformLocation(this._program, type);
    }
    gl.uniform1i(location, value);
  }

  set1f(type, value) {
    let location = this._uniformLocations[type];
    if (!location) {
      this._uniformLocations[type] = gl.getUniformLocation(this._program, type);
    }
    gl.uniform1f(location, value);
  }

  set4fv(type, value) {
    let location = this._uniformLocations[type];
    if (!location) {
      this._uniformLocations[type] = gl.getUniformLocation(this._program, type);
    }
    gl.uniform4fv(location, value);
  }

  set3fv(type, value) {
    let location = this._uniformLocations[type];
    if (!location) {
      this._uniformLocations[type] = gl.getUniformLocation(this._program, type);
    }
    gl.uniform3fv(location, value);
  }
}