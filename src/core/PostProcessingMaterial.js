export default class PostProcessingMaterial {
  constructor(shader, compositeTexture) {
    this._shader = shader;
    this._shader.compile();
  }
  set compositeTexture(value) {
    this._compositeTexture = value;
  }
  use(context) {
    this._shader.use();
    this._shader.setMat4('uMVP', context.MVP);
    this._shader.setInt('uCompositeTexture', 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._compositeTexture);
    this._shader.set2fv("uResolution", [context.viewWith, context.viewHeight]);
    this._shader.set2fv("uDelta", [100, 100]);
  }
}