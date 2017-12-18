import Renderer from './Renderer';
import { /* vec3, vec4, quat,*/ mat4 } from 'gl-matrix';

export default class ForwardRenderer extends Renderer {
  constructor(width, height) {
    super(width, height);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
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
  }

  activeAndBindTexture(uniformLocation, textureInfo) {
    gl.uniform1i(uniformLocation, textureInfo.index);
    gl.activeTexture(gl.TEXTURE0 + textureInfo.index);
    let texture = this.textures[ textureInfo.index ];
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
  
      this.projection = camera.projection;
      this.view = camera.view;
      length = this._items.length;
      
      if (length) {
        for (let i = 0; i < length; i++) {
          this._render(this._items[i]);
        }
      }
  
      this._items = [];
    });
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