import Asset from './Asset';

export default class ImageAsset extends Asset{
    
  loadAsync() {
    return new Promise((resolve, reject)=>{
      let img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = this._url;
      img.onload = (evt) => {
        resolve(evt);
        console.log(evt);
      };
      img.onerror = (error) => {
        reject(error);
      };
    });
  }
}