import Loader from '../Loader';

export default class ImageLoader extends Loader {
    
  loadAsync() {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = this.url;
      img.onload = (evt) => {
        this.item.data = img;
        resolve(evt);
        console.log(evt);
      };
      img.onerror = (error) => {
        reject(error);
      };
    });
  }
}