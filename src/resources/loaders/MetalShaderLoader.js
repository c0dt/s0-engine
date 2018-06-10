import Loader from '../Loader';

export default class MetalShaderLoader extends Loader {
    
  loadAsync() {
    return new Promise((resolve, reject) => {
      let xobj = new XMLHttpRequest();
      xobj.overrideMimeType("x-shader/x-metal");
      xobj.open('GET', this.url, true);
      xobj.onreadystatechange = () => {
        if (xobj.readyState === 4 && 
            xobj.status === 200) {
          this._decode(xobj.responseText).then((data) => {
            this.item.data = data;
            resolve(data);
          });
        }
      };
      xobj.send(null);
    });
  }

  _decode(rawData) {
    return Promise.resolve(rawData);
  }
}