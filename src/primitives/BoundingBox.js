import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import { ShaderStatic } from '../core/Shader';
import vsBBOX from '../shaders/bbox.vs.glsl';
import fsBBOX from '../shaders/bbox.fs.glsl';

export default class BoundingBox{
  constructor(){
    this.vertexData = new Float32Array([
      0.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      0.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 0.0,
      0.0, 0.0, 1.0,
    
      0.0, 1.0, 1.0,
      1.0, 1.0, 1.0,
      0.0, 1.0, 1.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 1.0,
      0.0, 0.0, 1.0,
    
      1.0, 1.0, 0.0,
      1.0, 1.0, 1.0,
      1.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      1.0, 1.0, 0.0,
      1.0, 0.0, 0.0,
    
      1.0, 0.0, 1.0,
      1.0, 0.0, 0.0,
      1.0, 0.0, 1.0,
      1.0, 1.0, 1.0,
      1.0, 0.0, 1.0,
      0.0, 0.0, 1.0
    ]);
        
    this.vertexArray = gl.createVertexArray();
    this.vertexBuffer = gl.createBuffer();
    this.program = ShaderStatic.createProgram(gl, vsBBOX, fsBBOX);
    this.positionLocation = 0;
    this.uniformMvpLocation = 0;

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vertexArray);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.positionLocation);
    
    gl.bindVertexArray(null);
    this.uniformMvpLocation = gl.getUniformLocation(this.program, "u_MVP");
  }


  draw(V, P) {
    
    let MVP = mat4.create();
    gl.useProgram(this.program);
    // mat4.mul(MVP, nodeTransform, bbox.transform);
    mat4.mul(MVP, V, MVP);
    mat4.mul(MVP, P, MVP);

    gl.uniformMatrix4fv(this.uniformMvpLocation, false, MVP);
    gl.bindVertexArray(this.vertexArray);
    gl.drawArrays(gl.LINES, 0, 24);
    gl.bindVertexArray(null);
  }
  
}