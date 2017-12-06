import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import { glm } from '../glm';
import { ShaderStatic } from '../core/Shader';
import Axis from '../primitives/Axis';

import Camera from '../Camera';

import vs from '../shaders/color.vs.glsl';
import fs from '../shaders/color.fs.glsl';

export default class ForwardRenderer {
  constructor(width, height) {
    let defaultColor = [1.0, 1.0, 1.0, 1.0];

    this.axis = new Axis;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    this.colorGrogram = ShaderStatic.createProgram(gl, vs, fs);
    this.uniformMvpLocation = gl.getUniformLocation(this.colorGrogram, "u_MVP");

    this.projection = mat4.create();

    mat4.perspective(this.projection, glm.radians(45.0), width / height, 0.1, 100000.0);
    // this.camera = new Camera({
    //   // position: vec3.fromValues(-60, 90, 90),
    //   position: vec3.fromValues(0, 0.1, 0.5),
    //   yaw: -90.0,
    //   // pitch: -30.0
    //   pitch: 0
    // });

    this.defaultSampler = gl.createSampler();
    gl.samplerParameteri(this.defaultSampler, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.samplerParameteri(this.defaultSampler, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.samplerParameteri(this.defaultSampler, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.samplerParameteri(this.defaultSampler, gl.TEXTURE_WRAP_T, gl.REPEAT);

    this._primitives = [];
  }

  setSize(width, height) {
    this._viewWith = width;
    this._viewHeight = height;
    gl.viewport(0, 0, width, height);
  }

  activeAndBindTexture(uniformLocation, textureInfo) {
    gl.uniform1i(uniformLocation, textureInfo.index);
    gl.activeTexture(gl.TEXTURE0 + textureInfo.index);
    let texture = this.textures[ textureInfo.index ];
    if (!texture.texture) {
      texture.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture.texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        texture.source
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    } else {
      gl.bindTexture(gl.TEXTURE_2D, texture.texture);
    }

    let sampler;
    if (texture.sampler) {
      sampler = texture.sampler.sampler;
    } else {
      sampler = this.defaultSampler;
    }

    gl.bindSampler(textureInfo.index, sampler);
  }

  render(scene, camera) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);

    if (this.primitives.length) {
      for (let i = 0; i < this.primitives.length; i++) {
        this._render(this._primitives[i]);
      }
    }
  }

  _render(primitive) {
    
  }
}