import ResourceItem from './ResourceItem';

import GLTFLoader from './loaders/GLTFLoader';
import GLTFBufferLoader from './loaders/GLTFBufferLoader';
import ImageLoader from './loaders/ImageLoader';

class ResourcePipeline {

  constructor() {
    this._loaders = {
      "gltf": GLTFLoader,
      "bin": GLTFBufferLoader,
      "jpg": ImageLoader,
      "png": ImageLoader,
      "gif": ImageLoader,
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

  loadAsync(url) {
    let item = new ResourceItem({ url: url });
    let loader = this.getLoader(item);
    return loader.loadAsync();
  }

  loadAllAsync(urls) {
    let items = [];
    let promises = [];
    urls.forEach((url) => {
      let item = new ResourceItem({ url: url });
      items.push(item);
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

  getLoader(item) {
    return new this._loaders[item.type](item);
  }
}
    
const _instance = new ResourcePipeline;
    
export default _instance;