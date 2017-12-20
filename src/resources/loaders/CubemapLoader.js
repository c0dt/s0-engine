import ResourcePipeline from '../ResourcePipeline';
import JSONLoader from './JSONLoader';
import Cubemap from '../../core/Cubemap';

export default class CubemapLoader extends JSONLoader { 
  _decode(rawData) {
    let dataObject = JSON.parse(rawData);
    let source = dataObject.source;
    let path = this.url.substr(0, this.url.lastIndexOf('/'));
    let urls = [
      path + '/' + source.right,
      path + '/' + source.left,
      path + '/' + source.top,
      path + '/' + source.bottom,
      path + '/' + source.front,
      path + '/' + source.back
    ];
    return ResourcePipeline.loadAllAsync(urls).then((images) => {
      return new Cubemap({
        right: images[0], left: images[1], top: images[2], bottom: images[3], front: images[4], back: images[5]
      });
    });
  }
}