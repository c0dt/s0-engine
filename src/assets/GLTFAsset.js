import { vec3, vec4, quat, mat4 } from 'gl-matrix';

// import ShaderManager from '../managers/ShaderManager.js';
import JSONAsset from './JSONAsset';


import BufferView from '../core/BufferView';
import Accessor from '../core/Accessor';
import Mesh from '../core/Mesh';
import Node from '../core/Node';
import Model from '../core/Model';
import Texture from '../core/Texture';

// const ATTRIBUTES = {
//   'POSITION': 0,
//   'NORMAL': 1,
//     // 'TANGENT': 2,
//   'TEXCOORD_0': 2,
//     // 'TEXCOORD_1': 4,
// };

export default class GLTFAsset extends JSONAsset {

  loadAsync() {
    return super.loadAsync().
      then((rawData) => {
        return this._postprocess(rawData);
      });
  }

  _postprocess(rawData) {
    this._jsonObject = JSON.parse(rawData);
    let glTF = this._jsonObject;

    let buffers = [];
    if (glTF.buffers) {
      buffers.forEach((buffer) => {
        buffers.push(new Buffer(buffer));
      });
    }

    let bufferViews = [];
    if (glTF.bufferViews) {
      glTF.bufferViews.forEach((bufferView) => {
        bufferViews.push(new BufferView(bufferView));
      });
    }

    let accessors = [];
    if (glTF.accessors) {
      glTF.accessors.forEach((accessor) => {
        accessors.push(new Accessor(accessor));
      });
    }

    if (glTF.samplers) {
      glTF.samplers.forEach((sampler) => {
        console.log(sampler);
      });
    }
    if (glTF.images) {
      glTF.images.forEach((image) => {
        console.log(image);
      });
    }

    let textures = [];

    if (glTF.textures) {
      glTF.textures.forEach((texture) => {
        textures.push(new Texture({
          name: texture.name,
          sampler: glTF.samplers[texture.sampler],
          source: glTF.images[texture.source]
        }));
      });
    }

    let materials = [];

    let meshes = [];
    if (glTF.meshes) {
      glTF.meshes.forEach((mesh) => {
        // console.log(mesh);
        meshes.push(new Mesh(mesh));
      });
    }

    // console.log(glTF.nodes);
    let identity = mat4.create();
    let rootNode = undefined;
    if (glTF.nodes && glTF.nodes.length > 0) {
      let node = glTF.nodes[0];
      rootNode = new Node(node, identity);
      this._setupChildren(rootNode, node, glTF.nodes);
    }
    
    return Promise.resolve(new Model({
      buffers: undefined,
      bufferViews: bufferViews,
      accessors: accessors,
      meshes: meshes,
      textures: textures,
      rootNode: rootNode
    }));
  }

  _setupChildren(obj, node, nodes) {
    node.children.forEach((child) => {
      let childNode = nodes[child];
      let childNodeIntance = new Node(childNode, obj.worldMatrix);
      obj.addChild(childNodeIntance);
      if (childNode.children && childNode.children.length > 0) {
        // console.log(childNode.children);
        this._setupChildren(childNodeIntance, childNode, nodes);
      }
    });
  }
}