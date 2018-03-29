import S0 from '../S0';
export default class Quad {
  constructor() {
    this.vertexData = new Float32Array([         
      -1.0, 1.0, -1.0,
      -1.0, -1.0, -1.0,
      1.0, -1.0, -1.0,
      1.0, -1.0, -1.0,
      1.0, 1.0, -1.0,
      -1.0, 1.0, -1.0,

      -1.0, -1.0, 1.0,
      -1.0, -1.0, -1.0,
      -1.0, 1.0, -1.0,
      -1.0, 1.0, -1.0,
      -1.0, 1.0, 1.0,
      -1.0, -1.0, 1.0,

      1.0, -1.0, -1.0,
      1.0, -1.0, 1.0,
      1.0, 1.0, 1.0,
      1.0, 1.0, 1.0,
      1.0, 1.0, -1.0,
      1.0, -1.0, -1.0,

      -1.0, -1.0, 1.0,
      -1.0, 1.0, 1.0,
      1.0, 1.0, 1.0,
      1.0, 1.0, 1.0,
      1.0, -1.0, 1.0,
      -1.0, -1.0, 1.0,

      -1.0, 1.0, -1.0,
      1.0, 1.0, -1.0,
      1.0, 1.0, 1.0,
      1.0, 1.0, 1.0,
      -1.0, 1.0, 1.0,
      -1.0, 1.0, -1.0,

      -1.0, -1.0, -1.0,
      -1.0, -1.0, 1.0,
      1.0, -1.0, -1.0,
      1.0, -1.0, -1.0,
      -1.0, -1.0, 1.0,
      1.0, -1.0, 1.0
    ]);
  }

  prepare() {
    this.vertexArray = S0.isWebGL2 ? gl.createVertexArray() : ext.createVertexArrayOES();
    this.vertexBuffer = gl.createBuffer();
    S0.isWebGL2 ? gl.bindVertexArray(this.vertexArray) : ext.bindVertexArrayOES(this.vertexArray);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    S0.isWebGL2 ? gl.bindVertexArray(null) : ext.bindVertexArrayOES(null);

    this._vao = this.vertexArray;
    this._indices = null;
    this._mode = gl.TRIANGLES;
    this._drawArraysOffset = 0;
    this._drawArraysCount = 36;
  }
}