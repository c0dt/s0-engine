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

    this._initializeGBuffer();

    this._quad = new Quad();
  }

  _initializeGBuffer() {
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

    this._depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this._depthTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.DEPTH_COMPONENT16,
        this._viewWith,
        this._viewHeight,
        0,
        gl.DEPTH_COMPONENT,
        gl.UNSIGNED_SHORT,
        null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this._depthTexture, 0);

    gl.drawBuffers([
      gl.COLOR_ATTACHMENT0,
      gl.COLOR_ATTACHMENT1,
      gl.COLOR_ATTACHMENT2,
      gl.COLOR_ATTACHMENT3
    ]);

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
    this.geometryPass(scenes, camera);
    this.lightingPass();
    this.composite();
  }

  geometryPass(scenes, camera) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._gBuffer);
    gl.enable(gl.DEPTH_TEST);
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

  lightingPass() {
    
  }

  composite() {
    this._shaderCompositePass.use();

    this._shaderCompositePass.setInt("gPosition", 0);
    this._shaderCompositePass.setInt("gNormal", 1);
    this._shaderCompositePass.setInt("gAlbedoSpec", 2);
    this._shaderCompositePass.setInt("gMetallicRoughness", 3);
    this._shaderCompositePass.setInt("depthTexture", 4);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._gPosition);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this._gNormal);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this._gAlbedoSpec);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this._gMetallicRoughness);
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, this._depthTexture);

    this._quad.draw();
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
      MV: MV,
      M: item.worldMatrix,
      V: this.view,
    };
    item.primitive.draw(this);
  }

  //@TODO 
  useMaterial(material) {
    material.shader.use();
    material.shader.setMat4("uM", this.context.M);
    material.shader.setMat4("uMVP", this.context.MVP);

    material.shader.setInt("uBaseColorTexture", 0);
    material.shader.setInt("uNormalTexture", 1);
    material.shader.setInt("uMetallicRoughnessTexture", 2);

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

    if (material.normalTextureInfo) {
      texture = material.normalTextureInfo.texture;
      index = material.normalTextureInfo.index;
      if (texture.sampler) {
        sampler = texture.sampler.sampler;
      } else {
        sampler = this.defaultSampler;
      }
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, texture.texture);
      gl.bindSampler(index, sampler);
    }

    if (material.metallicRoughnessTextureInfo) {
      texture = material.metallicRoughnessTextureInfo.texture;
      index = material.metallicRoughnessTextureInfo.index;
      if (texture.sampler) {
        sampler = texture.sampler.sampler;
      } else {
        sampler = this.defaultSampler;
      }
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, texture.texture);
      gl.bindSampler(index, sampler);
    }
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