import Asset from './Asset';

export default class ArrayBufferAsset extends Asset{
    
  loadAsync() {
    return new Promise((resolve, reject)=>{
      let xobj = new XMLHttpRequest();
      xobj.responseType = 'arraybuffer';
      xobj.open('GET', this._url, true);
      xobj.onreadystatechange = function() {
        if (xobj.readyState === 4) {
          if (xobj.status === 200){
            let arrayBuffer = xobj.response;
            if (arrayBuffer) {
              resolve(arrayBuffer);
            }
          } else {
            reject("");
          }
        }
      };
      xobj.send(null);
    });
  }
}