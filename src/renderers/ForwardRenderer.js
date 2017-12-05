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

    this.primitives = [];

    this.defaultSampler = gl.createSampler();
    gl.samplerParameteri(this.defaultSampler, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.samplerParameteri(this.defaultSampler, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.samplerParameteri(this.defaultSampler, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.samplerParameteri(this.defaultSampler, gl.TEXTURE_WRAP_T, gl.REPEAT);
  }

  setSize(width, height) {
    
  }

  activeAndBindTexture(uniformLocation, textureInfo) {
    gl.uniform1i(uniformLocation, textureInfo.index);
    gl.activeTexture(gl.TEXTURE0 + textureInfo.index);
    let texture = this.textures[ textureInfo.index ];
    if (!texture.texture){
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

    this.axis.draw(camera.view, this.projection);
    gl.useProgram(this.colorGrogram);

    if (this.primitives.length) {
      for (let i = 0; i < this.primitives.length; i++){
        let item = this.primitives[i];
        this.drawPrimitive(item.primitive, item.matrix);
      }
    }
  }

  drawPrimitive(primitive, matrix) {
    let MVP = mat4.create();
    mat4.mul(MVP, this.camera.view, matrix);
    mat4.mul(MVP, this.projection, MVP);
    if (primitive.material) {
      if (primitive.material.pbrMetallicRoughness.baseColorTexture) {
        this.activeAndBindTexture(gl.getUniformLocation(this.colorGrogram, "albedo"), primitive.material.pbrMetallicRoughness.baseColorTexture);
      }
    }
    gl.uniformMatrix4fv(this.uniformMvpLocation, false, MVP);
    gl.bindVertexArray(primitive.vertexArray);
    if (primitive.indices !== null) {
      gl.drawElements(primitive.mode, primitive.indicesLength, primitive.indicesComponentType, primitive.indicesOffset);
    } else {
      gl.drawArrays(primitive.mode, primitive.drawArraysOffset, primitive.drawArraysCount);
    }
    gl.bindVertexArray(null);
  }

  drawNode(node, nodeID, parentModelMatrix) {
    let matrix = mat4.create();
    if (parentModelMatrix !== undefined) {
      mat4.mul(matrix, parentModelMatrix, node.matrix);
    } else {
      mat4.copy(matrix, node.matrix);
    }
    if (node.mesh && node.mesh.primitives) {
      let primitives = node.mesh.primitives;
      primitives.forEach(primitive => {
        this.drawPrimitive(primitive, matrix);
        this.primitives.push({
          primitive: primitive,
          matrix: matrix
        });
      });
    }

    if (node.children) {
      let length = node.children.length;
      for (let i = 0; i < length; i++) {
        this.drawNode(node.children[i], node.children[i].nodeID, matrix);
      }
    }
  }
}