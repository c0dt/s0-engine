import Renderer from './Renderer';
import { /* vec3, vec4, quat,*/ mat4, vec4, vec3 } from 'gl-matrix';
import Shader from '../core/Shader';

import vsSkyBox from '../shaders/forward/cube-map.vs.glsl';
import fsSkyBox from '../shaders/forward/cube-map.fs.glsl';

import Cube from '../primitives/Cube';

import IBLManager from '../managers/IBLManager';

export default class ForwardRenderer extends Renderer {
  constructor(width, height) {
    super(width, height);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
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
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);

    scenes.forEach((scene) => {
      let length = this._items.length;
      if (length === 0) {
        let root = scene.root;
        this._visitNode(root, mat4.create());
      }
      this._tmpMat4 = mat4.create();
      this._inverseTransformMat4 = mat4.create();
      this._skinnedNodes.forEach((node) => {
        let skin = node.skin;
        // let uniformBlockID = skin.uniformBlockID;
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

    if (scenes.length && IBLManager.isReady) {
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