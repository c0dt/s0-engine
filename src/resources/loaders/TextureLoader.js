import ImageLoader from './ImageLoader';
import Texture from '../../core/Texture';

export default class TextureLoader extends ImageLoader {
  _decode(rawData) {
    return Promise.resolve(new Texture({
      name: this.item.name, 
      source: rawData }
    ));
  }
}