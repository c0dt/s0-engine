export const ShaderStatic = {
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

  programObjects: {},    // < flags, Shader Object >

  getShaderSource(id) {
    return document.getElementById(id).textContent.replace(/^\s+|\s+$/g, '');
  },

  createShader(gl, source, type) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  },

  createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    let program = gl.createProgram();
    let vshader = ShaderStatic.createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    let fshader = ShaderStatic.createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
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
    return this.flags & ShaderStatic.bitMasks.HAS_SKIN;
  }

  hasBaseColorMap() {
    return this.flags & ShaderStatic.bitMasks.HAS_BASECOLORMAP;
  }

  hasNormalMap() {
    return this.flags & ShaderStatic.bitMasks.HAS_NORMALMAP;
  }
  hasMetalRoughnessMap() {
    return this.flags & ShaderStatic.bitMasks.HAS_METALROUGHNESSMAP;
  }
  hasOcclusionMap() {
    return this.flags & ShaderStatic.bitMasks.HAS_OCCLUSIONMAP;
  }
  hasEmissiveMap() {
    return this.flags & ShaderStatic.bitMasks.HAS_EMISSIVEMAP;
  }


  defineMacro(macro) {
    if (ShaderStatic.bitMasks[macro] !== undefined) {
      this.flags = ShaderStatic.bitMasks[macro] | this.flags;
    } else {
      console.log('WARNING: ' + macro + ' is not a valid macro');
    }
  }

  compile() {
    let existingProgramObject = ShaderStatic.programObjects[this.flags];
    if (existingProgramObject) {
      this.programObject = existingProgramObject;
      return;
    }


    // new program

    let vsDefine = '';
    let fsDefine = '';

    // define macros

    if (this.flags & ShaderStatic.bitMasks.HAS_SKIN) {
      vsDefine += '#define HAS_SKIN\n';
    }
    if (this.flags & ShaderStatic.bitMasks.SKIN_VEC8) {
      vsDefine += '#define SKIN_VEC8\n';
    }

    if (this.flags & ShaderStatic.bitMasks.HAS_BASECOLORMAP) {
      fsDefine += '#define HAS_BASECOLORMAP\n';
    }
    if (this.flags & ShaderStatic.bitMasks.HAS_NORMALMAP) {
      fsDefine += '#define HAS_NORMALMAP\n';
    }
    if (this.flags & ShaderStatic.bitMasks.HAS_METALROUGHNESSMAP) {
      fsDefine += '#define HAS_METALROUGHNESSMAP\n';
    }
    if (this.flags & ShaderStatic.bitMasks.HAS_OCCLUSIONMAP) {
      fsDefine += '#define HAS_OCCLUSIONMAP\n';
    }
    if (this.flags & ShaderStatic.bitMasks.HAS_EMISSIVEMAP) {
      fsDefine += '#define HAS_EMISSIVEMAP\n';
    }


    // concat
    let vertexShaderSource = 
        ShaderStatic.shaderVersionLine +
        vsDefine +
        ShaderStatic.vsMasterCode;
    
    let fragmentShaderSource = 
        ShaderStatic.shaderVersionLine +
        fsDefine +
        ShaderStatic.fsMasterCode;

    // compile
    let program = ShaderStatic.createProgram(gl, vertexShaderSource, fragmentShaderSource);
    this.programObject = {
      program: program,

      uniformLocations: {},

      uniformBlockIndices: {}
    };

    // uniform block id
    if (this.flags & ShaderStatic.bitMasks.HAS_SKIN) {
      this.programObject.uniformBlockIndices.JointMatrix = gl.getUniformBlockIndex(program, "JointMatrix");
    }

    // uniform locations
    let us = this.programObject.uniformLocations;

    us.MVP = gl.getUniformLocation(program, 'u_MVP');
    us.MVNormal = gl.getUniformLocation(program, 'u_MVNormal');
    us.MV = gl.getUniformLocation(program, 'u_MV');
    us.baseColorFactor = gl.getUniformLocation(program, 'u_baseColorFactor');
    us.metallicFactor = gl.getUniformLocation(program, 'u_metallicFactor');
    us.roughnessFactor = gl.getUniformLocation(program, 'u_roughnessFactor');

    if (this.flags & ShaderStatic.bitMasks.HAS_BASECOLORMAP) {
      us.baseColorTexture = gl.getUniformLocation(program, 'u_baseColorTexture');
    }
    if (this.flags & ShaderStatic.bitMasks.HAS_NORMALMAP) {
      us.normalTexture = gl.getUniformLocation(program, 'u_normalTexture');
      us.normalTextureScale = gl.getUniformLocation(program, 'u_normalTextureScale');
    }
    if (this.flags & ShaderStatic.bitMasks.HAS_METALROUGHNESSMAP) {
      us.metallicRoughnessTexture = gl.getUniformLocation(program, 'u_metallicRoughnessTexture');
    }
    if (this.flags & ShaderStatic.bitMasks.HAS_OCCLUSIONMAP) {
      us.occlusionTexture = gl.getUniformLocation(program, 'u_occlusionTexture');
      us.occlusionStrength = gl.getUniformLocation(program, 'u_occlusionStrength');
    }
    if (this.flags & ShaderStatic.bitMasks.HAS_EMISSIVEMAP) {
      us.emissiveTexture = gl.getUniformLocation(program, 'u_emissiveTexture');
      us.emissiveFactor = gl.getUniformLocation(program, 'u_emissiveFactor');
    }

    us.diffuseEnvSampler = gl.getUniformLocation(program, 'u_DiffuseEnvSampler');
    us.specularEnvSampler = gl.getUniformLocation(program, 'u_SpecularEnvSampler');
    us.brdfLUT = gl.getUniformLocation(program, 'u_brdfLUT');

    // set static uniform values in cubemap
    gl.useProgram(program);
    gl.uniform1i(us.brdfLUT, BRDF_LUT.textureIndex);
    gl.uniform1i(us.specularEnvSampler, CUBE_MAP.textureIndex);
    gl.uniform1i(us.diffuseEnvSampler, CUBE_MAP.textureIBLDiffuseIndex);
    gl.useProgram(null);

    ShaderStatic.programObjects[this.flags] = this.programObject;
  }

}