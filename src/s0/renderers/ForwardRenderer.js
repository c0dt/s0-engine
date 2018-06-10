import Renderer from "./Renderer";

export default class ForwardRenderer extends Renderer {
  _forwardPass(visibleLights, frameRenderingConfiguration, context, lightData, stereoEnabled) {
    this._primitives.forEach((primitive, index) => {
      let MVP = this._worldMatrices[index];
      // context._currentProgram.setMat4fv(context._context, "uMVP", MVP);
      context.drawPrimitive(primitive, MVP);
    });
  }

  _beginForwardRendering(context, frameRenderingConfiguration) {

  }
  
  _renderOpaques(context, rendererSettings) {
    // var opaqueDrawSettings = new DrawRendererSettings(m_CurrCamera, m_LitPassName);
    // opaqueDrawSettings.SetShaderPassName(1, m_UnlitPassName);
    // opaqueDrawSettings.sorting.flags = SortFlags.CommonOpaque;
    // opaqueDrawSettings.rendererConfiguration = settings;

    // var opaqueFilterSettings = new FilterRenderersSettings(true)
    // {
    //     renderQueueRange = RenderQueueRange.opaque
    // };

    // context.DrawRenderers(m_CullResults.visibleRenderers, ref opaqueDrawSettings, opaqueFilterSettings);

    // // Render objects that did not match any shader pass with error shader
    // RenderObjectsWithError(ref context, opaqueFilterSettings, SortFlags.None);

    // if (m_CurrCamera.clearFlags == CameraClearFlags.Skybox)
    //     context.DrawSkybox(m_CurrCamera);
  }
  _afterOpaque(context, frameRenderingConfiguration) {

  }
  _renderTransparents(context, rendererSettings) {

  }
  _afterTransparent(context, frameRenderingConfiguration) {

  }
  _endForwardRendering(context, frameRenderingConfiguration) {

  }

  _setupPerFrameShaderConstants() {
    // // When glossy reflections are OFF in the shader we set a constant color to use as indirect specular
    // SphericalHarmonicsL2 ambientSH = RenderSettings.ambientProbe;
    // Color linearGlossyEnvColor = new Color(ambientSH[0, 0], ambientSH[1, 0], ambientSH[2, 0]) * RenderSettings.reflectionIntensity;
    // Color glossyEnvColor = CoreUtils.ConvertLinearToActiveColorSpace(linearGlossyEnvColor);
    // Shader.SetGlobalVector(PerFrameBuffer._GlossyEnvironmentColor, glossyEnvColor);

    // // Used when subtractive mode is selected
    // Shader.SetGlobalVector(PerFrameBuffer._SubtractiveShadowColor, CoreUtils.ConvertSRGBToActiveColorSpace(RenderSettings.subtractiveShadowColor));
  }

  _setupPerCameraShaderConstants() {
    // float cameraWidth = GetScaledCameraWidth(m_CurrCamera);
    //         float cameraHeight = GetScaledCameraHeight(m_CurrCamera);
    //         Shader.SetGlobalVector(PerCameraBuffer._ScaledScreenParams, new Vector4(cameraWidth, cameraHeight, 1.0f + 1.0f / cameraWidth, 1.0f + 1.0f / cameraHeight));
  }

  _beginRender(context) {
    context.beginRendering();
  }

  _endRender(context) {
    context.endRendering();
  }

  render(context, cameras) {
    this._beginRender(context, cameras);
    // console.log(context);
    this._setupPerFrameShaderConstants();
    // cameras.sort(
    cameras.forEach((camera) => {
      this._setupPerCameraShaderConstants();
      this._forwardPass(null, null, context);
    });
    this._endRender(context);
  }
}