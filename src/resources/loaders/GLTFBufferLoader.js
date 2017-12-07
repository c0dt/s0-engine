import BinaryLoader from './BinaryLoader';
import Buffer from '../../core/Buffer';

export default class GLTFBufferLoader extends BinaryLoader {
  _decode(rawData) {
    return Promise.resolve(new Buffer(this.item, rawData));
  }
}