import BinaryLoader from './BinaryLoader';
import AudioManager from '../../managers/AudioManager';

export default class AudioLoader extends BinaryLoader {
  _decode(rawData) {
    return new Promise((resolve, reject) => {
      AudioManager.context.decodeAudioData(rawData, (buffer) => {
        resolve(buffer); 
      }, (error) => {
        reject(error);
      });
    });
  }
}