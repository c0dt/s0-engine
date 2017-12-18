export default class Renderer {
  constructor(width, height) {
    this.setSize(width, height);
  }
  
  setSize(width, height) {
    this._viewWith = width;
    this._viewHeight = height;
    gl.viewport(0, 0, width, height);
  }

  render(scene, camera) {
  }
}