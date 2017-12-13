export default class Texture {
  constructor({ name, sampler, source }) {
    this._name = name;
    this._sampler = sampler;
    this._source = source;

    this.createTexture();
  }

  createTexture() {
    this._texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.texImage2D(
        gl.TEXTURE_2D,  // assumed
        0,        // Level of details
        // gl.RG16F, // Format
        // gl.RG,
        gl.RGBA, // Format
        gl.RGBA,
        gl.UNSIGNED_BYTE, // Size of each channel
        // gl.FLOAT,
        this._source
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}