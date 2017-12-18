export default class Renderer {
  setSize(width, height) {
    this._viewWith = width;
    this._viewHeight = height;
    gl.viewport(0, 0, width, height);
  }
}