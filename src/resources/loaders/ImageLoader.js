import Loader from '../Loader';

export default class ImageLoader extends Loader {
    
  loadAsync() {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = this.url;
      img.onload = (evt) => {
        this.item.data = img;
        this._decode(img).then((data) => {
          resolve(data);
        });
      };
      img.onerror = (error) => {
        reject(error);
      };
    });
  }
}