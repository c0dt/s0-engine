import Loader from '../Loader';

export default class BinaryLoader extends Loader {
    
  loadAsync() {
    return new Promise((resolve, reject) => {
      let xobj = new XMLHttpRequest();
      xobj.responseType = 'arraybuffer';
      xobj.open('GET', this.url, true);
      xobj.onreadystatechange = () => {
        if (xobj.readyState === 4) {
          if (xobj.status === 200) {
            let arrayBuffer = xobj.response;
            if (arrayBuffer) {
              this._decode(arrayBuffer).then((data) => {
                this.item.data = data;
                resolve(data);
              });
            }
          } else {
            reject("");
          }
        }
      };
      xobj.send(null);
    });
  }

  _decode(rawData) {
    return Promise.resolve(rawData);
  }
}