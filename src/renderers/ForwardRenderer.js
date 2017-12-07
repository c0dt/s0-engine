import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import { glm } from '../glm';
import { ShaderStatic } from '../core/Shader';
import Axis from '../primitives/Axis';

import Camera from '../Camera';

import vs from '../shaders/color.vs.glsl';
import fs from '../shaders/color.fs.glsl';

export default class ForwardRenderer {
  constructor(width, height) {
    this.setSize(width, height);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
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
    let length = this._primitives.length;
    
    if (length === 0) {
      let root = scene.root;
      this._visitNode(root);
    }


    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);

    
    if (length) {
      for (let i = 0; i < length; i++) {
        this._render(this._primitives[i]);
      }
    }
  }

  _visitNode(node) {
    if (node.mesh) {
      node.mesh.primitives.forEach((primitive) => {
        this._primitives.push({ primitive: primitive, worldMatrix: node.worldMatrix });
      });
    }
    
    if (node.children) {
      node.children.forEach((child) => {
        this._visitNode(child);
      });
    }
  }

  _render(primitive) {
    primitive.primitive.draw(this);
  }
}