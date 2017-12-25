import Renderer from './Renderer';
import { /* vec3, vec4, quat,*/ mat4 } from 'gl-matrix';

import Quad from '../primitives/Quad';
import Shader from '../core/Shader';

import vsLighting from '../shaders/deferred/pbrlighting.vs.glsl';
import fsLighting from '../shaders/deferred/pbrlighting.fs.glsl';

import vsComposite from '../shaders/deferred/composite.vs.glsl';
import fsComposite from '../shaders/deferred/composite.fs.glsl';

import IBLManager from '../managers/IBLManager';

import vsSkyBox from '../shaders/forward/cube-map.vs.glsl';
import fsSkyBox from '../shaders/forward/cube-map.fs.glsl';

import Cube from '../primitives/Cube';
import LUTManager from '../managers/LUTManager';

export default class DeferredRenderer extends Renderer {
  constructor(width, height) {
    super(width, height);
    this._items = [];
    this._initializeGBuffer();
    this._shaderLightingPass = new Shader(vsLighting, fsLighting);
    this._shaderLightingPass.compile();

    this._shaderCompositePass = new Shader(vsComposite, fsComposite);
    this._shaderCompositePass.compile();

    this._quad = new Quad();

    this._cube = new Cube();
    this._shaderSkybox = new Shader(vsSkyBox, fsSkyBox);
    this._shaderSkybox.compile();


    this._skinnedNodes = [];

    this._tmpMat4 = mat4.create();
    this._inverseTransformMat4 = mat4.create();
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
    // gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this._compositeBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._compositeBuffer);
    this._compositeTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this._compositeTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
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
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._compositeTexture, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this._depthTexture, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  render(scenes, camera) {
    this.projection = camera.projection;
    this.view = camera.view;
    this.cameraPosition = camera.position;

    if (scenes.length && IBLManager.isReady) {
      this.geometryPass(scenes, camera);

      gl.bindFramebuffer(gl.FRAMEBUFFER, this._compositeBuffer);  
      gl.disable(gl.DEPTH_TEST);
      //gl.clear(gl.COLOR_BUFFER_BIT);
      this.lightingPass();
      
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      
      let MVP = mat4.create();
      mat4.copy(MVP, camera.view);
      MVP[12] = 0.0;
      MVP[13] = 0.0;
      MVP[14] = 0.0;
      MVP[15] = 1.0;
      mat4.mul(MVP, camera.projection, MVP);
      this._shaderSkybox.use();
      this._shaderSkybox.setMat4('uMVP', MVP);
      this._shaderSkybox.setInt('u_environment', 0);
      // IBLManager.activeAndBindTextures();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, IBLManager.specularEnvSampler);
      this._cube.draw();
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
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

      this._skinnedNodes.forEach((node, index) => {
        let skin = node.skin;
        let joints = skin.joints;

        mat4.invert(this._inverseTransformMat4, node.worldMatrix);
        for (let i = 0, len = skin.joints.length; i < len; i++) {
          let jointNode = joints[i].node;
          mat4.mul(this._tmpMat4, jointNode.worldMatrix, skin.inverseBindMatrices[i]);
          mat4.mul(this._tmpMat4, this._inverseTransformMat4, this._tmpMat4);
          skin.jointMatrixUniformBufferData.set(this._tmpMat4, i * 16);
        }
        gl.bindBuffer(gl.UNIFORM_BUFFER, skin.jointMatrixUniformBuffer);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, skin.jointMatrixUniformBufferData, 0, skin.jointMatrixUniformBufferData.length);
          // this._render(scene, this._items[index]);
      });
      this._skinnedNodes = [];

      length = this._items.length;
      for (let i = 0; i < length; i++) {
        this._render(scene, this._items[i]);
      }
      this._items = [];
    });

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  lightingPass() {
    this._shaderLightingPass.use();

    this._shaderLightingPass.setInt("gPosition", 0);
    this._shaderLightingPass.setInt("gNormal", 1);
    this._shaderLightingPass.setInt("gAlbedoSpec", 2);
    this._shaderLightingPass.setInt("gMetallicRoughness", 3);
    this._shaderLightingPass.setInt("depthTexture", 4);
    IBLManager.activeAndBindTextures();
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

  composite() {
    this._shaderCompositePass.use();

    this._shaderCompositePass.setInt("compositeTexture", 0);
    this._shaderCompositePass.setInt("depthTexture", 1);
    this._shaderCompositePass.setInt("lutTexture", 2);
    // this._shaderCompositePass.setInt("gMetallicRoughness", 3);
    // this._shaderCompositePass.setInt("depthTexture", 4);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._compositeTexture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this._depthTexture);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, LUTManager.lutTexture);

    this._quad.draw();
  }

  //
  _visitNode(node, parentMatrix) {

    mat4.multiply(node.worldMatrix, parentMatrix, node.localMatrix);

    if (node.hasSkin()) {
      this._skinnedNodes.push(node);
    }
    
    if (node.mesh) {
      node.mesh.primitives.forEach((primitive) => {
        this._items.push({
          node: node,
          primitive: primitive, 
          worldMatrix: node.worldMatrix
        });
      });
    }
    
    if (node.children) {
      node.children.forEach((child) => {
        this._visitNode(child, node.worldMatrix);
      });
    }
  }
  
  activeAndBindTexture(textureInfo) {
    gl.activeTexture(gl.TEXTURE0 + textureInfo.index);
    let texture = textureInfo.texture;
    if (!texture.texture) {
      texture.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture.texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        texture.source
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    } else {
      gl.bindTexture(gl.TEXTURE_2D, texture.texture);
    }
    let sampler;
    if (texture.sampler) {
      sampler = texture.sampler.sampler;
    } else {
      sampler = this.defaultSampler;
    }
    gl.bindSampler(textureInfo.index, sampler);
  }

  //@TODO 
  _render(scene, item) {
    let MV = mat4.mul(mat4.create(), this.view, item.worldMatrix);
    let MVP = mat4.mul(mat4.create(), this.projection, MV);
    this.context = {
      scene: scene,
      node: item.node,
      MVP: MVP,
      MV: MV,
      M: item.worldMatrix,
      activeAndBindTexture: this.activeAndBindTexture,
      cameraPosition: this.cameraPosition
    };
    item.primitive.draw(this);
  }

  //@TODO 
  useMaterial(material) {
    material.use(this.context);
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