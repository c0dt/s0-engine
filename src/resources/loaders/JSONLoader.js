import Loader from '../Loader';

export default class JSONLoader extends Loader {
    
  loadAsync() {
    return new Promise((resolve, reject) => {
      let xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
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
    return Promise.resolve(JSON.parse(rawData));
  }
}