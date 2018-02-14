import { mat4 } from 'gl-matrix';

import ResourcePipeline from '../ResourcePipeline';
import JSONLoader from './JSONLoader';

import BufferView from '../../core/BufferView';
import Accessor from '../../core/Accessor';
import Mesh from '../../core/Mesh';
import Node from '../../core/Node';
import Scene from '../../core/Scene';
import Sampler from '../../core/Sampler';
import Texture from '../../core/Texture';
import Material from '../../core/Material';
import Skin from '../../core/Skin';
import Animation, { AnimationSampler, AnimationChannel } from '../../core/Animation';

export default class GLTFLoader extends JSONLoader {

  _processBuffers(glTF, context) {
    if (glTF.buffers) {
      let urls = [];
      let path = this.url.substr(0, this.url.lastIndexOf('/'));
      glTF.buffers.forEach((buffer) => {
        urls.push(path + '/' + buffer.uri);
      });
      return ResourcePipeline.loadAllAsync(urls).then((dataList) => {
        context.buffers = dataList;
        return context;
      });
    } else {
      return Promise.resolve(context);
    }
  }

  _processBufferViews(glTF, context) {
    let bufferViews = [];
    if (glTF.bufferViews) {
      glTF.bufferViews.forEach((bufferView) => {
        bufferView.buffer = context.buffers[bufferView.buffer];
        bufferViews.push(new BufferView(bufferView));
      });
    }
    context.bufferViews = bufferViews;
    return context;
  }

  _processAccessors(glTF, context) {
    let accessors = [];
    if (glTF.accessors) {
      glTF.accessors.forEach((accessor) => {
        accessor.bufferView = context.bufferViews[accessor.bufferView];
        accessors.push(new Accessor(accessor, context.bufferViews));
      });
    }
    context.accessors = accessors;
    return context;
  }

  _processSamplers(glTF, context) {
    let samplers = [];
    if (glTF.samplers) {
      glTF.samplers.forEach((sampler) => {
        samplers.push(new Sampler(sampler));
      });
    }

    context.samplers = samplers;
    return context;
  }

  _processImages(glTF, context) {
    if (glTF.images) {
      let urls = [];
      let path = this.url.substr(0, this.url.lastIndexOf('/'));
      glTF.images.forEach((image) => {
        urls.push(path + '/' + image.uri);
      });
      return ResourcePipeline.loadAllAsync(urls).then((images) => {
        context.images = images;
        return context;
      });
    } else {
      return Promise.resolve(context);
    }
  }

  _processTextures(glTF, context) {
    let textures = [];
    if (glTF.textures) {
      glTF.textures.forEach((texture) => {
        textures.push(new Texture({
          name: texture.name,
          sampler: context.samplers[texture.sampler],
          source: context.images[texture.source]
        }));
      });
    }
    context.textures = textures;
    return context;
  }

  _processMaterials(glTF, context) {
    let materials = [];
    if (glTF.materials) {
      glTF.materials.forEach((material) => {
        materials.push(new Material(material, context.textures));
      });
    }
    context.materials = materials;
    return context;
  }

  _processMesh(glTF, context) {
    let meshes = [];
    if (glTF.meshes) {
      glTF.meshes.forEach((mesh) => {
        meshes.push(new Mesh(mesh, context.accessors, context.materials));
      });
    }
    context.meshes = meshes;
    return context;
  }

  _processNodes(glTF, context) {
    let nodes = [];
    if (glTF.nodes) {
      glTF.nodes.forEach((node, index) => {
        nodes.push(new Node(node, index));
      });
    }
    context.nodes = nodes;
    return context;
  }

  _processNodesHierarchy(glTF, context) {
    let nodesHierarchy = [];
    let nodesStatus = {};
    if (glTF.nodes && context.nodes) {
      context.nodes.forEach((node) => {
        if (!nodesStatus[node.id]) {
          this._postprocessNode(glTF, context, node, nodesStatus);
          nodesHierarchy.push(node);
        }
      });
    }
    context.nodesHierarchy = nodesHierarchy;
    return context;
  }

  _processSkins(glTF, context) {
    let skins = [];
    if (glTF.skins && glTF.skins.length > 0) {
      glTF.skins.forEach((skin) => {
        let joints = [];
        skin.joints.forEach((joint, index) => {
          joints.push({
            id: index,
            node: context.nodes[joint]
          });
        });
        skins.push(new Skin({
          inverseBindMatrices: context.accessors[skin.inverseBindMatrices],
          joints: joints,
          skeleton: skin.skeleton
        }));
      });
    }
    context.skins = skins;
    return context;
  }

  _processAnimations(glTF, context) {
    let animations = [];
    if (glTF.animations && glTF.animations.length > 0) {
      glTF.animations.forEach((animation) => {
        let samplers = animation.samplers.map((sampler) => {
          let input = context.accessors[sampler.input];
          let output = context.accessors[sampler.output];
          return new AnimationSampler(input, output, sampler.interpolation);
        });
        let channels = animation.channels.map((channel) => {
          return new AnimationChannel(samplers[channel.sampler], {
            node: context.nodes[channel.target.node],
            path: channel.target.path
          });
        });
        animations.push(new Animation(animation.name, samplers, channels));
      });
    }
    context.animations = animations;
    return context;
  }

  _decode(rawData) {
    this._jsonObject = JSON.parse(rawData);
    let glTF = this._jsonObject;
    console.log(glTF);
    let context = {
      buffers: undefined,
      bufferViews: undefined,
      accessors: undefined,
      meshes: undefined,
      textures: undefined,
      rootNode: undefined,
      animations: undefined
    };

    let promises = [];

    promises.push(this._processImages(glTF, context));
    promises.push(this._processBuffers(glTF, context));
    return Promise.all(promises).then(() => {
      this._processSamplers(glTF, context);
      this._processTextures(glTF, context);
      this._processMaterials(glTF, context);
      this._processBufferViews(glTF, context);
      this._processAccessors(glTF, context);
      this._processMesh(glTF, context);
      this._processNodes(glTF, context);
      this._processSkins(glTF, context);
      this._processAnimations(glTF, context);
      this._processNodesHierarchy(glTF, context);
      return new Scene(context);
    });
  }

  _postprocessNode(glTF, context, node, nodesStatus) {
    nodesStatus[node.id] = true;
    node.postprocess(context);
    let children = glTF.nodes[node.id].children;
    if (children) {
      children.forEach((child) => {
        let childNodeIntance = context.nodes[child];
        childNodeIntance.parent = node;
        this._postprocessNode(glTF, context, childNodeIntance, nodesStatus);
      });
    }
  }
}