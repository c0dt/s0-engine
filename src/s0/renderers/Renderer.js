export default class Renderer {
  constructor() {
    this._primitives = [];
  }
  setSize(context, width, height) {
    this._viewWith = width;
    this._viewHeight = height;
    
    context.setViewport(0, 0, width, height);

    if (this._initBuffers) {
      this._initBuffers();
    }
  }
  _beginRender() {

  }
  
  render(scene, camera) {
  }
}