import ResourceItem from './ResourceItem';

import GLTFLoader from './loaders/GLTFLoader';
import GLTFBufferLoader from './loaders/GLTFBufferLoader';
import ImageLoader from './loaders/ImageLoader';
import AudioLoader from './loaders/AudioLoader';
import MetalShaderLoader from './loaders/MetalShaderLoader';
import GLSLShaderLoader from './loaders/GLSLShaderLoader';

class ResourcePipeline {

  constructor() {
    this._loaders = {
      "gltf": GLTFLoader,
      "bin": GLTFBufferLoader,
      "jpg": ImageLoader,
      "png": ImageLoader,
      "gif": ImageLoader,
      "mp3": AudioLoader,
      "metal": MetalShaderLoader,
      "glsl": GLSLShaderLoader
    };  
  }

  loadAllItems(items) {
    let promises = [];
    items.forEach((item) => {
      let loader = this.getLoader(item);
      promises.push(loader.loadAsync());
    });

    return Promise.all(promises).then(() => {
      let dataList = [];
      items.forEach((item) => {
        dataList.push(item.data);
      });
      return dataList;
    });
  }

  loadAsync(url, { name: name, loaderClass: loaderClass } = {}) {
    let item = new ResourceItem({ name: name, url: url });
    let loader = loaderClass ? new loaderClass(item) : this.getLoader(item);
    return loader.loadAsync();
  }

  loadAllAsync(urls, { lname: name, oaderClass: loaderClass } = {}) {
    let items = [];
    let promises = [];
    urls.forEach((url) => {
      let item = new ResourceItem({ name: name, url: url });
      items.push(item);
      let loader = loaderClass ? new loaderClass(item) : this.getLoader(item);
      promises.push(loader.loadAsync());
    });

    return Promise.all(promises).then(() => {
      let dataList = [];
      items.forEach((item) => {
        dataList.push(item.data);
      });
      return dataList;
    });
  }

  getLoader(item) {
    return new this._loaders[item.type](item);
  }
}
    
const _instance = new ResourcePipeline;
    
export default _instance;