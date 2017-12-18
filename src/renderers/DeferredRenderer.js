import Renderer from './Renderer';
import { /* vec3, vec4, quat,*/ mat4 } from 'gl-matrix';

import Quad from '../primitives/Quad';
import Shader from '../core/Shader';

import vsPBRMaster from '../shaders/deferred/pbr.vs.glsl';
import fsPBRMaster from '../shaders/deferred/pbr.fs.glsl';

import vsComposite from '../shaders/deferred/composite.vs.glsl';
import fsComposite from '../shaders/deferred/composite.fs.glsl';

export default class DeferredRenderer extends Renderer {
  constructor(width, height) {
    super(width, height);
    this._items = [];
    // console.log(gl.getParameter(gl.MAX_COLOR_ATTACHMENTS_WEBGL));
    // console.log(gl.getParameter(gl.MAX_DRAW_BUFFERS_WEBGL));

    this.initializeGBuffer();

    this._quad = new Quad();
  }

  initializeGBuffer() {
    this._gBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._gBuffer);

    this._gPosition = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this._gPosition);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA16F,
        this._viewWith,
        this._viewHeight,
        0,
        gl.RGBA,
        gl.FLOAT,
        null
    );
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._gPosition, 0);

    this._gNormal = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this._gNormal);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA16F,
        this._viewWith,
        this._viewHeight,
        0,
        gl.RGBA,
        gl.FLOAT,
        null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this._gNormal, 0);

    this._gAlbedoSpec = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this._gAlbedoSpec);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        this._viewWith,
        this._viewHeight,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, this._gAlbedoSpec, 0);

    this._gMetallicRoughness = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this._gMetallicRoughness);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        this._viewWith,
        this._viewHeight,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT3, gl.TEXTURE_2D, this._gMetallicRoughness, 0);

    gl.drawBuffers([
      gl.COLOR_ATTACHMENT0,
      gl.COLOR_ATTACHMENT1,
      gl.COLOR_ATTACHMENT2,
      gl.COLOR_ATTACHMENT3
    ]);

    let depthRenderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this._viewWith, this._viewHeight);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      console.error('Framebuffer not complete!');
    }

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this._shaderCompositePass = new Shader(vsComposite, fsComposite);
    this._shaderCompositePass.compile();
  }

  render(scenes, camera) {
    this.renderGeometryPass(scenes, camera);

    this.renderComposite();
  }

  renderGeometryPass(scenes, camera) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._gBuffer);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    scenes.forEach((scene) => {
      let length = this._items.length;
    
      if (length === 0) {
        let root = scene.root;
        this._visitNode(root, mat4.create());
      }
  
      this.projection = camera.projection;
      this.view = camera.view;
      
      length = this._items.length;
      for (let i = 0; i < length; i++) {
        this._render(this._items[i]);
      }
  
      this._items = [];
    });

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  renderLightingPass() {
    
  }

  renderComposite() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this._shaderCompositePass.use();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._gPosition);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this._gNormal);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this._gAlbedoSpec);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this._gMetallicRoughness);

    this._quad.draw();

    // gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._gBuffer);
    // gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    // gl.blitFramebuffer(0, 0, this._viewWith, this._viewHeight, 0, 0, this._viewWith, this._viewHeight, gl.DEPTH_BUFFER_BIT, gl.NEAREST);
    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  //
  _visitNode(node, parentMatrix) {

    let worldMatrix = mat4.multiply(mat4.create(), parentMatrix, node.localMatrix);
    
    if (node.mesh) {
      node.mesh.primitives.forEach((primitive) => {
        this._items.push({ 
          primitive: primitive, 
          worldMatrix: worldMatrix
        });
      });
    }
    
    if (node.children) {
      node.children.forEach((child) => {
        this._visitNode(child, worldMatrix);
      });
    }
  }

  //@TODO 
  _render(item) {
    let MV = mat4.mul(mat4.create(), this.view, item.worldMatrix);
    let MVP = mat4.mul(mat4.create(), this.projection, MV);
    this.context = {
      MVP: MVP,
      MV: MV
    };
    item.primitive.draw(this);
  }

  //@TODO 
  useMaterial(material) {
    material.shader.use();
    material.shader.setMat4("MVP", this.context.MVP);
    material.shader.setInt("uBaseColorTexture", 0);
    // material.bindTextures();

    let texture = material.baseColorTextureInfo.texture;
    let index = material.baseColorTextureInfo.index;
    let sampler;
    if (texture.sampler) {
      sampler = texture.sampler.sampler;
    } else {
      sampler = this.defaultSampler;
    }
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, texture.texture);
    gl.bindSampler(index, sampler);
  }

  //@TODO 
  bindVertexArray(id) {
    gl.bindVertexArray(id);
  }
  
  //@TODO 
  drawElements(mode, indicesLength, indicesComponentType, indicesOffset) {
    gl.drawElements(mode, indicesLength, indicesComponentType, indicesOffset);
  }

  drawArrays(mode, drawArraysOffset, drawArraysCount) {
    gl.drawArrays(mode, drawArraysOffset, drawArraysCount);
  }
}