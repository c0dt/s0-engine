export default class GLProgram {
  constructor(vertexShaderSource, fragmentShaderSource, versionLine) {
    this._vertexShaderSource = vertexShaderSource;
    this._fragmentShaderSource = fragmentShaderSource;
    this._versionLine = versionLine;
    this._attributeMap = {};
    this._uniformMap = {};
    this._uniformBlockIndices = {};
  }

  //////////////////////////////////////////////
  _createShader(context, source, type) {
    let shader = context.createShader(type);
    context.shaderSource(shader, source);
    context.compileShader(shader);
    return shader;
  }

  create(context) {
    let program = context.createProgram();
    let [vs, fs] = this._precompile(context);
    let vshader = this._createShader(context, vs, context.VERTEX_SHADER);
    let fshader = this._createShader(context, fs, context.FRAGMENT_SHADER);
    context.attachShader(program, vshader);
    context.deleteShader(vshader);
    context.attachShader(program, fshader);
    context.deleteShader(fshader);
    context.linkProgram(program);

    let log = context.getProgramInfoLog(program);
    if (log) {
      console.warn(log);
    }
    log = context.getShaderInfoLog(vshader);
    if (log) {
      console.warn(log);
    }
    
    log = context.getShaderInfoLog(fshader);
    if (log) {
      console.warn(log);
    }
    this._postcompile(context, program);
    this._program = program;
    return program;
  }

  _precompile(context) {
    let vertexShaderSource = this._versionLine + this._vertexShaderSource;
    let fragmentShaderSource = this._versionLine + this._fragmentShaderSource;
    return [vertexShaderSource, fragmentShaderSource];
  }

  _postcompile(context, program) {
    let attributesCount = context.getProgramParameter(program, context.ACTIVE_ATTRIBUTES);

    for (let i = 0; i < attributesCount; i++) {
      const attributeInfo = context.getActiveAttrib(program, i); 
      console.log('name:', attributeInfo.name, 'type:', attributeInfo.type, 'size:', attributeInfo.size); 
      this._attributeMap[attributeInfo.name] = context.getAttribLocation(program, attributeInfo.name);
    }

    let uniformsCount = context.getProgramParameter(program, context.ACTIVE_UNIFORMS);

    for (let i = 0; i < uniformsCount; i++) {
      const uniformInfo = context.getActiveUniform(program, i);
      console.log('name:', uniformInfo.name, 'type:', uniformInfo.type, 'size:', uniformInfo.size); 
      this._uniformMap[uniformInfo.name] = context.getUniformLocation(program, uniformInfo.name);
    }

    if (this._versionLine) {
      let uniformBlocksCount = context.getProgramParameter(program, context.ACTIVE_UNIFORM_BLOCKS);
      for (let i = 0; i < uniformBlocksCount; i++) {
        const blockName = context.getActiveUniformBlockName(program, i);
        console.log('uniform block name: ', blockName);
        this._uniformBlockIndices[blockName] = context.getUniformBlockIndex(program, blockName);
      } 
    }
    
  }

  use(context) {
    context.useProgram(this._program);
  }
  //////////////////////////////////////////////

  
  /**
   * 
   * @param {string} type 
   * @param {mat4} mat4 
   */
  setMat4fv(context, type, mat4) {
    let location = this._uniformMap[type];
    if (location) {
      context.uniformMatrix4fv(location, false, mat4); 
    }
  }

  /**
   * 
   * @param {string} type 
   * @param {int} value 
   */
  setInt(context, type, value) {
    let location = this._uniformMap[type];
    if (location) {
      context.uniform1i(location, value);
    }
    
  }

  /**
   * 
   * @param {string} type 
   * @param {float} value 
   */
  set1f(context, type, value) {
    let location = this._uniformMap[type];
    if (location) {
      context.uniform1f(location, value);
    }
  }

  /**
   * 
   * @param {string} type 
   * @param {vec2} value 
   */
  set2fv(context, type, value) {
    let location = this._uniformMap[type];
    if (location) {
      context.uniform2fv(location, value);
    }
  }

  /**
   * 
   * @param {string} type 
   * @param {vec4} value 
   */
  set4fv(context, type, value) {
    let location = this._uniformMap[type];
    if (location) {
      context.uniform4fv(location, value);
    }
  }

  /**
   * 
   * @param {string} type 
   * @param {vec3} value 
   */
  set3fv(context, type, value) {
    let location = this._uniformMap[type];
    if (location) {
      context.uniform3fv(location, value);
    }
  }

  /**
   * 
   * @param {string} type 
   * @param {int} value 
   */
  setBlockIndex(context, type, value) {
    let location = this._uniformBlockIndices[type];
    if (location) {
      context.uniformBlockBinding(this._program, location, value);
    }
  }
}