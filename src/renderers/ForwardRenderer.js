import Renderer from './Renderer';
import { /* vec3, vec4, quat,*/ mat4, vec4, vec3 } from 'gl-matrix';
import Shader from '../core/Shader';

import vsSkyBox from '../shaders/forward/cube-map.vs.glsl';
import fsSkyBox from '../shaders/forward/cube-map.fs.glsl';

import vsQuad from '../shaders/postprocessing.vs.glsl';
import fsQuad from '../shaders/postprocessing.fs.glsl';

import vsBBOX from '../shaders/forward/axis.vs.glsl';
import fsBBOX from '../shaders/forward/axis.fs.glsl';

import Cube from '../primitives/Cube';
import Quad from '../primitives/Quad';
import Axis from '../primitives/Axis';

import IBLManager from '../managers/IBLManager';

export default class ForwardRenderer extends Renderer {
  constructor(width, height) {
    super(width, height);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);

    this.defaultSampler = gl.createSampler();
    gl.samplerParameteri(this.defaultSampler, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.samplerParameteri(this.defaultSampler, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.samplerParameteri(this.defaultSampler, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.samplerParameteri(this.defaultSampler, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.samplerParameteri(this.defaultSampler, gl.TEXTURE_WRAP_R, gl.REPEAT);
    gl.samplerParameterf(this.defaultSampler, gl.TEXTURE_MIN_LOD, -1000.0);
    gl.samplerParameterf(this.defaultSampler, gl.TEXTURE_MAX_LOD, 1000.0);
    gl.samplerParameteri(this.defaultSampler, gl.TEXTURE_COMPARE_MODE, gl.NONE);
    gl.samplerParameteri(this.defaultSampler, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);

    this._items = [];

    this._skinnedNodes = [];

    this._cube = new Cube();
    this._shaderSkybox = new Shader(vsSkyBox, fsSkyBox);
    this._shaderSkybox.compile();

    this._testQuad = new Quad();
    this._shaderQuad = new Shader(vsQuad, fsQuad);
    this._shaderQuad.compile();

    this._testAxis = new Axis();
    this._shaderAxis = new Shader(vsBBOX, fsBBOX);
    this._shaderAxis.compile();

    this._initBuffers();
  }

  _initBuffers() {
    if (this._compositeBuffer) {
      gl.deleteFramebuffer(this._compositeBuffer);
    }
    this._compositeBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._compositeBuffer);
    if (this._compositeTexture) {
      gl.deleteTexture(this._compositeTexture);
    }
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
    gl.bindTexture(gl.TEXTURE_2D, null);

    if (this._depthTexture) {
      gl.deleteTexture(this._depthTexture);
    }
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
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    if (this._renderBuffer) {
      gl.deleteFramebuffer(this._renderBuffer);
    }
    this._renderBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._renderBuffer);
    if (this._colorRendererBuffer) {
      gl.deleteRenderbuffer(this._colorRendererBuffer);
    }
    this._colorRendererBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this._colorRendererBuffer);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, 4, gl.RGBA8, this._viewWith, this._viewHeight);  
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this._colorRendererBuffer);

    if (this._depthRendererBuffer) {
      gl.deleteRenderbuffer(this._depthRendererBuffer);
    }
    this._depthRendererBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthRendererBuffer);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, 4, gl.DEPTH_COMPONENT16, this._viewWith, this._viewHeight);  
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._depthRendererBuffer);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      console.error("this combination of attachments does not work");
    }

    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
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

  render(scenes, camera) {    
    if (scenes.length && IBLManager.isReady) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._renderBuffer);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.viewport(0, 0, this._viewWith, this._viewHeight);
      scenes.forEach((scene) => {
        let length = this._items.length;
        if (length === 0) {
          let hierarchy = scene.hierarchy;
          hierarchy.forEach((node) => {
            this._visitNode(node, mat4.create());
          });
        }
      
        this._tmpMat4 = mat4.create();
        this._inverseTransformMat4 = mat4.create();
        this._skinnedNodes.forEach((node) => {
          let skin = node.skin;
          let joints = skin.joints;
          mat4.invert(this._inverseTransformMat4, node.worldMatrix);
          let jointsLength = skin.joints.length;
          for (let i = 0; i < jointsLength; i++) {
            let jointNode = joints[i].node;
            mat4.mul(this._tmpMat4, jointNode.worldMatrix, skin.inverseBindMatrices[i]);
            mat4.mul(this._tmpMat4, this._inverseTransformMat4, this._tmpMat4);
            skin.jointMatrixUniformBufferData.set(this._tmpMat4, i * 16);
          }
          gl.bindBuffer(gl.UNIFORM_BUFFER, skin.jointMatrixUniformBuffer);
          gl.bufferSubData(gl.UNIFORM_BUFFER, 0, skin.jointMatrixUniformBufferData, 0, skin.jointMatrixUniformBufferData.length);
        });
        this._skinnedNodes = [];
        this.projection = camera.projection;
        this.view = camera.view;
        this.cameraPosition = camera.position;
        length = this._items.length;
      
        if (length) {
          for (let i = 0; i < length; i++) {
            this._render(scene, this._items[i]);
          }
        }
        this._items = [];
      });

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
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, IBLManager.specularEnvSampler);
      this._drawPrimitive(this._cube, null);

      // for (let i = 0; i < 0; i++) {
      //   gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._renderBuffer);
      //   gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this._compositeBuffer);
  
      //   gl.blitFramebuffer(
      //     0, 0, this._viewWith, this._viewHeight,
      //     0, 0, this._viewWith, this._viewHeight,
      //     gl.COLOR_BUFFER_BIT, gl.NEAREST
      //   );
  
      //   gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this._renderBuffer);
      //   gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._compositeBuffer);
  
      //   this._shaderQuad.use();
      //   this._shaderQuad.setInt("compositeTexture", 0);
      //   this._shaderQuad.set2fv("resolution", [this._viewWith, this._viewHeight]);
      //   this._shaderQuad.set2fv("delta", [i * 100, i * 100]);
        
      //   gl.activeTexture(gl.TEXTURE0);
      //   gl.bindTexture(gl.TEXTURE_2D, this._compositeTexture);
      //   this._drawPrimitive(this._testQuad, null);
      // }

      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._renderBuffer);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this._compositeBuffer);

      gl.blitFramebuffer(
        0, 0, this._viewWith, this._viewHeight,
        0, 0, this._viewWith, this._viewHeight,
        gl.COLOR_BUFFER_BIT, gl.NEAREST
      );

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      this._shaderQuad.use();
      this._shaderQuad.setInt("compositeTexture", 0);
      this._shaderQuad.set2fv("resolution", [this._viewWith, this._viewHeight]);
      this._shaderQuad.set2fv("delta", [0, 0]);
      
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this._compositeTexture);
      this._drawPrimitive(this._testQuad, null);

      this._shaderAxis.use();
      this._shaderAxis.setMat4("uMVP", MVP);
      this._drawPrimitive(this._testAxis, null);
    }
  }

  //
  _visitNode(node, parentMatrix) {
    mat4.multiply(node.worldMatrix, parentMatrix, node.localMatrix);

    this._skinnedNodes;

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
    this._drawPrimitive(item.primitive, this);
  }

  //@TODO
  _drawPrimitive(primitive, context) {
    if (context && context.context.node && context.context.node.skin) {
      primitive._material.skinUniformBlockID = context.context.node.skin.uniformBlockID;
    }
    
    if (primitive._material) {
      primitive._material.use(this.context);
    }

    if (!primitive._vao) {
      primitive.prepare();
      return;
    }

    if (primitive._vao) {
      gl.bindVertexArray(primitive._vao);
      if (primitive._indices !== null) {
        gl.drawElements(primitive._mode, primitive._indices._count, primitive._indices._componentType, primitive._indices._byteOffset);
      } else {
        gl.drawArrays(primitive._mode, primitive._drawArraysOffset, primitive._drawArraysCount);
      }
    }
  }
}