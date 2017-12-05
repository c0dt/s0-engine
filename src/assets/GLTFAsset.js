import { vec3, vec4, quat, mat4 } from 'gl-matrix';

import Asset from './Asset';
// import ShaderManager from '../managers/ShaderManager.js';
import JSONAsset from './JSONAsset';


import BufferView from '../core/BufferView';
import Accessor from '../core/Accessor';
import Mesh from '../core/Mesh';
import Node from '../core/Node';

// const ATTRIBUTES = {
//   'POSITION': 0,
//   'NORMAL': 1,
//     // 'TANGENT': 2,
//   'TEXCOORD_0': 2,
//     // 'TEXCOORD_1': 4,
// };

export default class GLTFAsset extends JSONAsset{

  loadAsync() {
    return super.loadAsync().
      then(rawData=>{
        return this._postprocess(rawData);
      });
  }

  _postprocess(rawData){
    this._jsonObject = JSON.parse(rawData);
    let glTF = this._jsonObject;
    let buffers = glTF.buffers;

    buffers.forEach(buffer =>{
      console.log(buffer);
    });

    let bufferViews = glTF.bufferViews;

    bufferViews.forEach(bufferView =>{
      new BufferView(bufferView);
    });

    let accessors = glTF.accessors;

    accessors.forEach(accessor=>{
      console.log(new Accessor(accessor));
    });

    let meshes = glTF.meshes;

    meshes.forEach(mesh=>{
      let meshInstance = new Mesh(mesh);
    });

    let nodes = glTF.nodes;

    nodes.forEach(node=>{
      console.log(new Node(node));
    });
    
    console.log();
    return Promise.resolve();
  }
}