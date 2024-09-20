export default class RenderingContextObject {

    get RenderingContext() : WebGL2RenderingContext | WebGLRenderingContext 
    {
      // @ts-ignore
      return window.gl;
    }
}