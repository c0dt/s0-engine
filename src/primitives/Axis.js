import Shader from '../core/Shader';

export default class Axis {
  constructor() {
    this.vertexData = new Float32Array([
      0.0, 0.0, 0.0, 1.0, 0.0, 0.0,
      1.0, 0.0, 0.0, 1.0, 0.0, 0.0,

      0.0, 0.0, 0.0, 0.0, 1.0, 0.0,
      0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

      0.0, 0.0, 0.0, 0.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
    ]);
  }


  prepare() {
    this.vertexArray = gl.createVertexArray();
    this.vertexBuffer = gl.createBuffer();
    
    gl.bindVertexArray(this.vertexArray);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.STATIC_DRAW);

    gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 6 * 4, 0);
    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.colorLocation, 3, gl.FLOAT, false, 6 * 4, 3 * 4);
    gl.enableVertexAttribArray(this.colorLocation);

    gl.bindVertexArray(null);

    this._vao = this.vertexArray;
    this._indices = null;
    this._mode = gl.LINES;
    this._drawArraysOffset = 0;
    this._drawArraysCount = 6;
  }
  
}