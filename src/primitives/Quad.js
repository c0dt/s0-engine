import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import { ShaderStatic } from '../Shader';
import vs from '../shaders/quad.vs.glsl';
import fs from '../shaders/quad.fs.glsl';

export default class Quad{
  constructor(){
    this.vertexData = new Float32Array([
      -1.0, 1.0, 0.0, 0.0, 1.0,
      -1.0, -1.0, 0.0, 0.0, 0.0,
      1.0, 1.0, 0.0, 1.0, 1.0,
      1.0, -1.0, 0.0, 1.0, 0.0,
    ]);

    this.program = ShaderStatic.createProgram(gl, vs, fs);
    this.uniformMvpLocation = 0;

    this.vertexArray = gl.createVertexArray();
    this.vertexBuffer = gl.createBuffer();

    gl.bindVertexArray(this.vertexArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.STATIC_DRAW);

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 5 * 4, 0);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
    gl.enableVertexAttribArray(1);

    gl.bindVertexArray(null);

    gl.useProgram(this.program);
    this.uniformMvpLocation = gl.getUniformLocation(this.program, "MVP");
    this.texture0Location = gl.getUniformLocation(this.program, "texture_0");
    gl.uniform1i(this.texture0Location, 0);
  }


  draw(V, P) {
    
    let MVP = mat4.create();
    gl.useProgram(this.program);
    if (this.texture){
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
    mat4.mul(MVP, V, MVP);
    mat4.mul(MVP, P, MVP);
    gl.uniformMatrix4fv(this.uniformMvpLocation, false, MVP);
    gl.bindVertexArray(this.vertexArray);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
  }
  
}