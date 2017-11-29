import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import { glm } from '../glm';
import { ShaderStatic } from '../Shader';
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
    this.camera = new Camera({
      // position: vec3.fromValues(-60, 90, 90),
      position: vec3.fromValues(0, 0.1, 0.5),
      yaw: -90.0,
      // pitch: -30.0
      pitch: 0
    });

    this.primitives = [];
  }

  setSize(width, height) {
    
  }

  activeAndBindTexture(uniformLocation, textureInfo) {

  }

  render(scene) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    this.axis.draw(this.camera.view, this.projection);
    gl.useProgram(this.colorGrogram);

    if (this.primitives.length) {
      for (let i = 0; i < this.primitives.length; i++){
        let item = this.primitives[i];
        this.drawPrimitive(item.primitive, item.matrix);
      }
    } else {
      let length = scene.nodes.length;
      for (let i = 0; i < length; i++) {
        this.drawNode(scene.nodes[i], scene.nodes[i].nodeID, scene.rootTransform);

        this.primitives.sort((a, b)=>{
          return a.primitive.vertexArray - b.primitive.vertexArray;
        });
      }
    }
  }

  drawPrimitive(primitive, matrix) {
    let MVP = mat4.create();
    mat4.mul(MVP, this.camera.view, matrix);
    mat4.mul(MVP, this.projection, MVP);
    gl.uniformMatrix4fv(this.uniformMvpLocation, false, MVP);
    if (this.lastVertexArray !== primitive.vertexArray){
      gl.bindVertexArray(primitive.vertexArray);
      this.lastVertexArray = primitive.vertexArray;
    } else {
      console.log("OK");
    }
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