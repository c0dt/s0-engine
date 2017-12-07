import { mat4 } from 'gl-matrix';

import ResourcePipeline from '../ResourcePipeline';
import JSONLoader from './JSONLoader';

import BufferView from '../../core/BufferView';
import Accessor from '../../core/Accessor';
import Mesh from '../../core/Mesh';
import Node from '../../core/Node';
import Scene from '../../core/Scene';
import Texture from '../../core/Texture';

// const ATTRIBUTES = {
//   'POSITION': 0,
//   'NORMAL': 1,
//     // 'TANGENT': 2,
//   'TEXCOORD_0': 2,
//     // 'TEXCOORD_1': 4,
// };

export default class GLTFLoader extends JSONLoader {

  _decode(rawData) {
    this._jsonObject = JSON.parse(rawData);
    let glTF = this._jsonObject;
    let path = this.url.substr(0, this.url.lastIndexOf('/'));
    let buffers = [];
        
    if (glTF.buffers) {
      let urls = [];
      glTF.buffers.forEach((buffer) => {
        urls.push(path + '/' + buffer.uri);
      });

      ResourcePipeline.loadAllAsync(urls).then((dataList) => {
        buffers = dataList;
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
        // console.log(sampler);
      });
    }
    if (glTF.images) {
      glTF.images.forEach((image) => {
        // console.log(image);
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

    this._meshes = [];
    if (glTF.meshes) {
      glTF.meshes.forEach((mesh) => {
        this._meshes.push(new Mesh(mesh, accessors));
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
    
    return Promise.resolve(new Scene({
      buffers: buffers,
      bufferViews: bufferViews,
      accessors: accessors,
      meshes: this._meshes,
      textures: textures,
      rootNode: rootNode
    }));
  }

  _setupChildren(obj, node, nodes) {
    if (node.mesh !== undefined) {
      obj.mesh = this._meshes[node.mesh];
    }
    if (node.children) {
      node.children.forEach((child) => {
        let childNode = nodes[child];
        let childNodeIntance = new Node(childNode, obj.worldMatrix);
        obj.addChild(childNodeIntance);
        this._setupChildren(childNodeIntance, childNode, nodes);
      });
    }
  }
}