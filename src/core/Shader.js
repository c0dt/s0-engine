export const ShaderManager = {
  shaderVersionLine: '#version 300 es\n',

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

  programObjects: {},

  createShader(gl, source, type) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  },

  createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    let program = gl.createProgram();
    let vshader = ShaderManager.createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    let fshader = ShaderManager.createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
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
};

export default class Shader {
  constructor() {
    this.flags = 0;
    this.programObject = null;
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


  defineMacro(macro) {
    if (ShaderManager.bitMasks[macro] !== undefined) {
      this.flags = ShaderManager.bitMasks[macro] | this.flags;
    } else {
      console.log('WARNING: ' + macro + ' is not a valid macro');
    }
  }

  compile() {
    let existingProgramObject = ShaderManager.programObjects[this.flags];
    if (existingProgramObject) {
      this.programObject = existingProgramObject;
      return;
    }


    // new program

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
        ShaderManager.shaderVersionLine +
        vsDefine +
        ShaderManager.vsMasterCode;
    
    let fragmentShaderSource = 
        ShaderManager.shaderVersionLine +
        fsDefine +
        ShaderManager.fsMasterCode;

    // compile
    this._program = ShaderManager.createProgram(gl, vertexShaderSource, fragmentShaderSource);
    this._uniformLocations = {};
    this._uniformBlockIndices = {};

    // uniform block id
    if (this.hasSkin()) {
      this._program.uniformBlockIndices.JointMatrix = gl.getUniformBlockIndex(this._program, "JointMatrix");
    }

    this._uniformLocations.MVP = gl.getUniformLocation(this._program, 'u_MVP');
    this._uniformLocations.MVNormal = gl.getUniformLocation(this._program, 'u_MVNormal');
    this._uniformLocations.MV = gl.getUniformLocation(this._program, 'u_MV');
    this._uniformLocations.baseColorFactor = gl.getUniformLocation(this._program, 'u_baseColorFactor');
    this._uniformLocations.metallicFactor = gl.getUniformLocation(this._program, 'u_metallicFactor');
    this._uniformLocations.roughnessFactor = gl.getUniformLocation(this._program, 'u_roughnessFactor');

    if (this.hasBaseColorMap()) {
      this._uniformLocations.baseColorTexture = gl.getUniformLocation(this._program, 'u_baseColorTexture');
    }
    if (this.hasNormalMap()) {
      this._uniformLocations.normalTexture = gl.getUniformLocation(this._program, 'u_normalTexture');
      this._uniformLocations.normalTextureScale = gl.getUniformLocation(this._program, 'u_normalTextureScale');
    }
    if (this.hasMetalRoughnessMap()) {
      this._uniformLocations.metallicRoughnessTexture = gl.getUniformLocation(this._program, 'u_metallicRoughnessTexture');
    }
    if (this.hasOcclusionMap()) {
      this._uniformLocations.occlusionTexture = gl.getUniformLocation(this._program, 'u_occlusionTexture');
      this._uniformLocations.occlusionStrength = gl.getUniformLocation(this._program, 'u_occlusionStrength');
    }
    if (this.hasEmissiveMap()) {
      this._uniformLocations.emissiveTexture = gl.getUniformLocation(this._program, 'u_emissiveTexture');
      this._uniformLocations.emissiveFactor = gl.getUniformLocation(this._program, 'u_emissiveFactor');
    }

    this._uniformLocations.diffuseEnvSampler = gl.getUniformLocation(this._program, 'u_DiffuseEnvSampler');
    this._uniformLocations.specularEnvSampler = gl.getUniformLocation(this._program, 'u_SpecularEnvSampler');
    this._uniformLocations.brdfLUT = gl.getUniformLocation(this._program, 'u_brdfLUT');

    // set static uniform values in cubemap
    gl.useProgram(this._program);
    // gl.uniform1i(us.brdfLUT, BRDF_LUT.textureIndex);
    // gl.uniform1i(us.specularEnvSampler, CUBE_MAP.textureIndex);
    // gl.uniform1i(us.diffuseEnvSampler, CUBE_MAP.textureIBLDiffuseIndex);
    gl.useProgram(null);
  }

}